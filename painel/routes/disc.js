import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { calculateDISCScores, calculatePercentages, getDominantType, generateAnalysis, TYPE_DESCRIPTIONS } from '../services/discAnalyzer.js'

export default function createDiscRoutes(Employee, DISCResult, Invitation, Company, memStore, isConnectedFn) {
  const router = Router()

  router.post('/submit', async (req, res) => {
    try {
      const { invitationToken, employeeData, responses } = req.body
      if (!invitationToken || !responses || responses.length !== 24) {
        return res.status(400).json({ error: 'Dados incompletos. Envie token e 24 respostas.' })
      }

      let invitation
      if (isConnectedFn()) {
        invitation = await Invitation.findOne({ token: invitationToken, used: false, expiresAt: { $gt: new Date() } })
      } else {
        invitation = memStore.invitations.find(i => i.token === invitationToken && !i.used && new Date(i.expiresAt) > new Date())
      }

      if (!invitation) {
        return res.status(404).json({ error: 'Convite inválido ou expirado' })
      }

      const scores = calculateDISCScores(responses)
      const percentages = calculatePercentages(scores)
      const { dominant, secondary } = getDominantType(percentages)
      const analysis = generateAnalysis(percentages, employeeData?.functionCategories || [])

      let employee
      if (isConnectedFn()) {
        employee = await Employee.findOne({ email: invitation.employeeEmail, companyId: invitation.companyId })
        if (!employee) {
          employee = new Employee({
            companyId: invitation.companyId,
            name: employeeData?.name || invitation.employeeName,
            email: employeeData?.email || invitation.employeeEmail,
            phone: employeeData?.phone,
            department: employeeData?.department,
            jobTitle: employeeData?.jobTitle,
            jobDescription: employeeData?.jobDescription,
            dailyTasks: employeeData?.dailyTasks || [],
            functionCategories: employeeData?.functionCategories || []
          })
          await employee.save()
        } else {
          Object.assign(employee, {
            name: employeeData?.name || employee.name,
            phone: employeeData?.phone || employee.phone,
            department: employeeData?.department || employee.department,
            jobTitle: employeeData?.jobTitle || employee.jobTitle,
            jobDescription: employeeData?.jobDescription || employee.jobDescription,
            dailyTasks: employeeData?.dailyTasks || employee.dailyTasks,
            functionCategories: employeeData?.functionCategories || employee.functionCategories
          })
          await employee.save()
        }
      } else {
        employee = memStore.employees.find(e => e.email === (employeeData?.email || invitation.employeeEmail) && e.companyId === invitation.companyId)
        if (!employee) {
          const empId = uuidv4()
          employee = {
            _id: empId,
            companyId: invitation.companyId,
            name: employeeData?.name || invitation.employeeName,
            email: employeeData?.email || invitation.employeeEmail,
            phone: employeeData?.phone,
            department: employeeData?.department,
            jobTitle: employeeData?.jobTitle,
            jobDescription: employeeData?.jobDescription,
            dailyTasks: employeeData?.dailyTasks || [],
            functionCategories: employeeData?.functionCategories || [],
            createdAt: new Date().toISOString()
          }
          memStore.employees.push(employee)
        }
      }

      const discResult = {
        employeeId: employee._id || employee.id,
        companyId: invitation.companyId,
        invitationId: invitation._id || invitation.id,
        responses,
        scores,
        percentages,
        dominantType: dominant,
        secondaryType: secondary,
        analysis,
        completedAt: new Date().toISOString()
      }

      if (isConnectedFn()) {
        const existing = await DISCResult.findOneAndDelete({ employeeId: employee._id })
        const result = new DISCResult(discResult)
        await result.save()
        invitation.used = true
        invitation.usedAt = new Date()
        await invitation.save()
        return res.json({
          percentages,
          dominantType: dominant,
          secondaryType: secondary,
          description: TYPE_DESCRIPTIONS[dominant].description,
          analysis: {
            currentFunctionFit: analysis.currentFunctionFit,
            currentFunctionName: analysis.currentFunctionName,
            recommendations: analysis.recommendations
          }
        })
      } else {
        const existingIdx = memStore.discResults.findIndex(r => r.employeeId === employee._id)
        if (existingIdx !== -1) memStore.discResults.splice(existingIdx, 1)
        const id = uuidv4()
        memStore.discResults.push({ _id: id, ...discResult })
        invitation.used = true
        invitation.usedAt = new Date().toISOString()
        return res.json({
          percentages,
          dominantType: dominant,
          secondaryType: secondary,
          description: TYPE_DESCRIPTIONS[dominant].description,
          analysis: {
            currentFunctionFit: analysis.currentFunctionFit,
            currentFunctionName: analysis.currentFunctionName,
            recommendations: analysis.recommendations
          }
        })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}