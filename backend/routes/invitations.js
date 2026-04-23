import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'

export default function createInvitationRoutes(Invitation, Employee, memStore, isConnected) {
  const router = Router()

  router.post('/', async (req, res) => {
    try {
      const companyId = req.companyId
      const { employeeName, employeeEmail } = req.body
      if (!employeeName) return res.status(400).json({ error: 'Nome do funcionário é obrigatório' })
      if (isConnected) {
        const invitation = new Invitation({ companyId, employeeName, employeeEmail: employeeEmail?.toLowerCase() })
        await invitation.save()
        return res.status(201).json({ ...invitation.toJSON(), id: invitation._id })
      } else {
        const id = uuidv4()
        const token = uuidv4()
        const invitation = {
          _id: id,
          companyId,
          token,
          employeeName,
          employeeEmail: employeeEmail?.toLowerCase(),
          used: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          usedAt: null,
          createdAt: new Date().toISOString()
        }
        memStore.invitations.push(invitation)
        return res.status(201).json({ ...invitation, id })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.get('/', async (req, res) => {
    try {
      const companyId = req.companyId
      if (isConnected) {
        const invitations = await Invitation.find({ companyId }).sort({ createdAt: -1 })
        return res.json(invitations.map(i => ({ ...i.toJSON(), id: i._id })))
      } else {
        const invitations = memStore.invitations.filter(i => i.companyId === companyId)
        return res.json(invitations.map(({ ...i }) => ({ ...i, id: i._id })))
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const companyId = req.companyId
      const { id } = req.params
      if (isConnected) {
        const invitation = await Invitation.findOneAndDelete({ _id: id, companyId })
        if (!invitation) return res.status(404).json({ error: 'Convite não encontrado' })
        return res.json({ message: 'Convite cancelado' })
      } else {
        const idx = memStore.invitations.findIndex(i => i._id === id && i.companyId === companyId)
        if (idx === -1) return res.status(404).json({ error: 'Convite não encontrado' })
        memStore.invitations.splice(idx, 1)
        return res.json({ message: 'Convite cancelado' })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.get('/public/:token', async (req, res) => {
    try {
      const { token } = req.params
      if (isConnected) {
        const invitation = await Invitation.findOne({ token, used: false, expiresAt: { $gt: new Date() } })
        if (!invitation) return res.status(404).json({ error: 'Convite inválido ou expirado' })
        return res.json({ employeeName: invitation.employeeName, employeeEmail: invitation.employeeEmail, companyId: invitation.companyId })
      } else {
        const invitation = memStore.invitations.find(i => i.token === token && !i.used && new Date(i.expiresAt) > new Date())
        if (!invitation) return res.status(404).json({ error: 'Convite inválido ou expirado' })
        return res.json({ employeeName: invitation.employeeName, employeeEmail: invitation.employeeEmail, companyId: invitation.companyId })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}