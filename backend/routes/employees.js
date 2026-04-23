import { Router } from 'express'

export default function createEmployeeRoutes(Employee, DISCResult, Invitation, memStore, isConnectedFn) {
  const router = Router()

  router.get('/', async (req, res) => {
    try {
      const companyId = req.companyId
      if (isConnectedFn()) {
        const employees = await Employee.find({ companyId }).sort({ createdAt: -1 })
        const results = await DISCResult.find({ companyId })
        const resultMap = {}
        results.forEach(r => { resultMap[r.employeeId] = r })
        const enriched = employees.map(e => ({
          ...e.toJSON(),
          id: e._id,
          discResult: resultMap[e._id] || null
        }))
        return res.json(enriched)
      } else {
        const employees = memStore.employees.filter(e => e.companyId === companyId)
        const results = memStore.discResults.filter(r => r.companyId === companyId)
        const resultMap = {}
        results.forEach(r => { resultMap[r.employeeId] = r })
        const enriched = employees.map(e => {
          const { ...rest } = e
          return { ...rest, id: e._id, discResult: resultMap[e._id] || null }
        })
        return res.json(enriched)
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.get('/:id', async (req, res) => {
    try {
      const companyId = req.companyId
      const { id } = req.params
      if (isConnectedFn()) {
        const employee = await Employee.findOne({ _id: id, companyId })
        if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' })
        const discResult = await DISCResult.findOne({ employeeId: id })
        return res.json({ ...employee.toJSON(), id: employee._id, discResult: discResult || null })
      } else {
        const employee = memStore.employees.find(e => e._id === id && e.companyId === companyId)
        if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' })
        const discResult = memStore.discResults.find(r => r.employeeId === id) || null
        const { ...rest } = employee
        return res.json({ ...rest, id: employee._id, discResult })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.post('/', async (req, res) => {
    try {
      const companyId = req.companyId
      const { name, email, phone, department, jobTitle, jobDescription, dailyTasks, functionCategories } = req.body
      if (!name) return res.status(400).json({ error: 'Nome é obrigatório' })
      if (isConnectedFn()) {
        const employee = new Employee({ companyId, name, email, phone, department, jobTitle, jobDescription, dailyTasks, functionCategories })
        await employee.save()
        return res.status(201).json({ ...employee.toJSON(), id: employee._id })
      } else {
        const { v4: uuidv4 } = await import('uuid')
        const id = uuidv4()
        const employee = { _id: id, companyId, name, email, phone, department, jobTitle, jobDescription, dailyTasks: dailyTasks || [], functionCategories: functionCategories || [], createdAt: new Date().toISOString() }
        memStore.employees.push(employee)
        return res.status(201).json({ ...employee, id })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.patch('/:id', async (req, res) => {
    try {
      const companyId = req.companyId
      const { id } = req.params
      const updates = req.body
      if (isConnectedFn()) {
        const employee = await Employee.findOneAndUpdate({ _id: id, companyId }, updates, { new: true })
        if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' })
        return res.json({ ...employee.toJSON(), id: employee._id })
      } else {
        const idx = memStore.employees.findIndex(e => e._id === id && e.companyId === companyId)
        if (idx === -1) return res.status(404).json({ error: 'Funcionário não encontrado' })
        Object.assign(memStore.employees[idx], updates)
        return res.json({ ...memStore.employees[idx], id: memStore.employees[idx]._id })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const companyId = req.companyId
      const { id } = req.params
      if (isConnectedFn()) {
        const employee = await Employee.findOneAndDelete({ _id: id, companyId })
        if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' })
        await DISCResult.deleteOne({ employeeId: id })
        return res.json({ message: 'Funcionário removido' })
      } else {
        const idx = memStore.employees.findIndex(e => e._id === id && e.companyId === companyId)
        if (idx === -1) return res.status(404).json({ error: 'Funcionário não encontrado' })
        memStore.employees.splice(idx, 1)
        const ridx = memStore.discResults.findIndex(r => r.employeeId === id)
        if (ridx !== -1) memStore.discResults.splice(ridx, 1)
        return res.json({ message: 'Funcionário removido' })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}