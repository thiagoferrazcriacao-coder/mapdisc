import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'mapdisc-secret-change-me'

export default function createAuthRoutes(Company, memStore, isConnected) {
  const router = Router()

  router.post('/register', async (req, res) => {
    try {
      const { name, email, phone, password, industry, teamSize } = req.body
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      }
      if (isConnected) {
        const existing = await Company.findOne({ email: email.toLowerCase() })
        if (existing) return res.status(400).json({ error: 'Email já cadastrado' })
        const company = new Company({ name, email: email.toLowerCase(), phone, password, industry, teamSize })
        await company.save()
        const token = jwt.sign({ id: company._id }, JWT_SECRET, { expiresIn: '7d' })
        return res.status(201).json({ token, user: company.toJSON() })
      } else {
        const existing = memStore.companies.find(c => c.email === email.toLowerCase())
        if (existing) return res.status(400).json({ error: 'Email já cadastrado' })
        const { v4: uuidv4 } = await import('uuid')
        const id = uuidv4()
        const hashedPassword = await bcrypt.hash(password, 12)
        const company = { _id: id, name, email: email.toLowerCase(), phone, password: hashedPassword, industry, teamSize, createdAt: new Date().toISOString() }
        memStore.companies.push(company)
        const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
        const { password: _, ...user } = company
        return res.status(201).json({ token, user: { ...user, id } })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })
      if (isConnected) {
        const company = await Company.findOne({ email: email.toLowerCase() })
        if (!company) return res.status(401).json({ error: 'Credenciais inválidas' })
        const valid = await company.comparePassword(password)
        if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })
        const token = jwt.sign({ id: company._id }, JWT_SECRET, { expiresIn: '7d' })
        return res.json({ token, user: company.toJSON() })
      } else {
        const company = memStore.companies.find(c => c.email === email.toLowerCase())
        if (!company) return res.status(401).json({ error: 'Credenciais inválidas' })
        const valid = await bcrypt.compare(password, company.password)
        if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })
        const token = jwt.sign({ id: company._id }, JWT_SECRET, { expiresIn: '7d' })
        const { password: _, ...user } = company
        return res.json({ token, user: { ...user, id: company._id } })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}