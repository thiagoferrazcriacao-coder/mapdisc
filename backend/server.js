import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import Company from './models/Company.js'
import Employee from './models/Employee.js'
import Invitation from './models/Invitation.js'
import DISCResult from './models/DISCResult.js'

import { auth } from './middleware/auth.js'
import createAuthRoutes from './routes/auth.js'
import createEmployeeRoutes from './routes/employees.js'
import createInvitationRoutes from './routes/invitations.js'
import createDiscRoutes from './routes/disc.js'
import createDashboardRoutes from './routes/dashboard.js'

const JWT_SECRET = process.env.JWT_SECRET || 'mapdisc-secret-change-me'

const memStore = {
  companies: [],
  employees: [],
  invitations: [],
  discResults: []
}

let isConnected = false

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('⚠ MONGODB_URI não configurado. Usando armazenamento em memória.')
    return
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    isConnected = true
    console.log('✓ MongoDB conectado')
  } catch (err) {
    console.log('⚠ Erro ao conectar MongoDB. Usando armazenamento em memória.', err.message)
  }
}

connectDB()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', createAuthRoutes(Company, memStore, isConnected))
app.use('/api/employees', auth, createEmployeeRoutes(Employee, DISCResult, Invitation, memStore, isConnected))
app.use('/api/invitations', auth, createInvitationRoutes(Invitation, Employee, memStore, isConnected))
app.use('/api/disc', createDiscRoutes(Employee, DISCResult, Invitation, Company, memStore, isConnected))
app.use('/api/dashboard', auth, createDashboardRoutes(Employee, DISCResult, Invitation, memStore, isConnected))

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const companyId = req.companyId
    if (isConnected) {
      const company = await Company.findById(companyId)
      if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
      return res.json({ ...company.toJSON(), id: company._id })
    } else {
      const company = memStore.companies.find(c => c._id === companyId)
      if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
      const { password, ...user } = company
      return res.json({ ...user, id: company._id })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.patch('/api/auth/me', auth, async (req, res) => {
  try {
    const companyId = req.companyId
    const { name, phone, industry, teamSize } = req.body
    if (isConnected) {
      const company = await Company.findByIdAndUpdate(companyId, { name, phone, industry, teamSize }, { new: true })
      if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
      return res.json({ ...company.toJSON(), id: company._id })
    } else {
      const idx = memStore.companies.findIndex(c => c._id === companyId)
      if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' })
      Object.assign(memStore.companies[idx], { name, phone, industry, teamSize })
      const { password, ...user } = memStore.companies[idx]
      return res.json({ ...user, id: memStore.companies[idx]._id })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.patch('/api/auth/password', auth, async (req, res) => {
  try {
    const companyId = req.companyId
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Senhas obrigatórias' })
    if (isConnected) {
      const company = await Company.findById(companyId)
      if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
      const bcrypt = await import('bcryptjs')
      const valid = await bcrypt.compare(currentPassword, company.password)
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' })
      company.password = newPassword
      await company.save()
      return res.json({ message: 'Senha alterada com sucesso' })
    } else {
      const idx = memStore.companies.findIndex(c => c._id === companyId)
      if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' })
      const bcrypt = await import('bcryptjs')
      const valid = await bcrypt.compare(currentPassword, memStore.companies[idx].password)
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' })
      memStore.companies[idx].password = await bcrypt.hash(newPassword, 12)
      return res.json({ message: 'Senha alterada com sucesso' })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.use('/teste', express.static(join(dirname(fileURLToPath(import.meta.url)), '..', 'teste')))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'painel', 'dist')))
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/teste')) {
      res.sendFile(join(__dirname, '..', 'painel', 'dist', 'index.html'))
    }
  })
}

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`✓ MapDISC API rodando na porta ${PORT}`)
  if (!isConnected) console.log('⚠ Modo em memória ativo — dados não persistem')
})