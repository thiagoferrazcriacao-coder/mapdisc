import { Router } from 'express'

export default function createDashboardRoutes(Employee, DISCResult, Invitation, memStore, isConnected) {
  const router = Router()

  router.get('/stats', async (req, res) => {
    try {
      const companyId = req.companyId
      if (isConnected) {
        const totalEmployees = await Employee.countDocuments({ companyId })
        const completedTests = await DISCResult.countDocuments({ companyId })
        const invitations = await Invitation.find({ companyId })
        const pendingInvitations = invitations.filter(i => !i.used && new Date(i.expiresAt) > new Date()).length

        const results = await DISCResult.find({ companyId })
        const discDistribution = { D: 0, I: 0, S: 0, C: 0 }
        let totalFit = 0
        let fitCount = 0

        results.forEach(r => {
          discDistribution.D += r.percentages.D
          discDistribution.I += r.percentages.I
          discDistribution.S += r.percentages.S
          discDistribution.C += r.percentages.C
          if (r.analysis?.currentFunctionFit) {
            totalFit += r.analysis.currentFunctionFit
            fitCount++
          }
        })

        if (completedTests > 0) {
          discDistribution.D = Math.round(discDistribution.D / completedTests)
          discDistribution.I = Math.round(discDistribution.I / completedTests)
          discDistribution.S = Math.round(discDistribution.S / completedTests)
          discDistribution.C = Math.round(discDistribution.C / completedTests)
        }

        const avgFit = fitCount > 0 ? Math.round(totalFit / fitCount) : 0

        return res.json({ totalEmployees, completedTests, pendingInvitations, discDistribution, avgFit })
      } else {
        const employees = memStore.employees.filter(e => e.companyId === companyId)
        const results = memStore.discResults.filter(r => r.companyId === companyId)
        const invitations = memStore.invitations.filter(i => i.companyId === companyId)
        const pendingInvitations = invitations.filter(i => !i.used && new Date(i.expiresAt) > new Date()).length

        const discDistribution = { D: 0, I: 0, S: 0, C: 0 }
        let totalFit = 0
        let fitCount = 0

        results.forEach(r => {
          discDistribution.D += r.percentages.D
          discDistribution.I += r.percentages.I
          discDistribution.S += r.percentages.S
          discDistribution.C += r.percentages.C
          if (r.analysis?.currentFunctionFit != null) {
            totalFit += r.analysis.currentFunctionFit
            fitCount++
          }
        })

        if (results.length > 0) {
          discDistribution.D = Math.round(discDistribution.D / results.length)
          discDistribution.I = Math.round(discDistribution.I / results.length)
          discDistribution.S = Math.round(discDistribution.S / results.length)
          discDistribution.C = Math.round(discDistribution.C / results.length)
        }

        const avgFit = fitCount > 0 ? Math.round(totalFit / fitCount) : 0

        return res.json({
          totalEmployees: employees.length,
          completedTests: results.length,
          pendingInvitations,
          discDistribution,
          avgFit
        })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}