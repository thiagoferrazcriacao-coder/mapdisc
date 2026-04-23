import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { put, head, list } from '@vercel/blob'

const JWT_SECRET = process.env.JWT_SECRET || 'mapdisc-secret-change-me'

// ── Blob DB helpers ───────────────────────────────────────────────────────────
// Each collection is a JSON array stored as a single blob file.
// We use a versioned path so we can overwrite deterministically.

const BLOB_BASE = 'db'

async function readCollection(name) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const { blobs } = await list({ prefix: `${BLOB_BASE}/${name}.json`, token })
    if (!blobs || blobs.length === 0) return []
    const url = blobs[0].downloadUrl || blobs[0].url
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function writeCollection(name, data) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  const content = JSON.stringify(data)
  await put(`${BLOB_BASE}/${name}.json`, content, {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true,
    token
  })
}

// ── Simple CRUD helpers ───────────────────────────────────────────────────────
async function dbFind(col, query = {}) {
  const data = await readCollection(col)
  return data.filter(item => Object.entries(query).every(([k, v]) => item[k] === v))
}

async function dbFindOne(col, query = {}) {
  const results = await dbFind(col, query)
  return results[0] || null
}

async function dbInsert(col, doc) {
  const data = await readCollection(col)
  data.push(doc)
  await writeCollection(col, data)
  return doc
}

async function dbUpdateOne(col, query, update) {
  const data = await readCollection(col)
  const idx = data.findIndex(item => Object.entries(query).every(([k, v]) => item[k] === v))
  if (idx === -1) return null
  data[idx] = { ...data[idx], ...update }
  await writeCollection(col, data)
  return data[idx]
}

async function dbDeleteOne(col, query) {
  const data = await readCollection(col)
  const idx = data.findIndex(item => Object.entries(query).every(([k, v]) => item[k] === v))
  if (idx === -1) return null
  const [removed] = data.splice(idx, 1)
  await writeCollection(col, data)
  return removed
}

async function dbDeleteMany(col, query) {
  const data = await readCollection(col)
  const kept = data.filter(item => !Object.entries(query).every(([k, v]) => item[k] === v))
  await writeCollection(col, kept)
}

// ── Auth middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.companyId = decoded.id
    next()
  } catch { return res.status(401).json({ error: 'Token inválido' }) }
}

// ── DISC logic ────────────────────────────────────────────────────────────────
const CHOICE_MAP = { A: 'D', B: 'I', C: 'S', D: 'C' }

const FUNCTION_PROFILES = {
  'Vendas':        { D: 70, I: 85, S: 40, C: 30 },
  'Liderança':     { D: 90, I: 60, S: 50, C: 40 },
  'Atendimento':   { D: 35, I: 70, S: 85, C: 40 },
  'Financeiro':    { D: 30, I: 25, S: 60, C: 90 },
  'Marketing':     { D: 55, I: 80, S: 30, C: 45 },
  'Operações':     { D: 50, I: 30, S: 75, C: 70 },
  'RH':            { D: 40, I: 75, S: 80, C: 45 },
  'TI':            { D: 35, I: 25, S: 55, C: 85 },
  'Produção':      { D: 55, I: 25, S: 75, C: 65 },
  'Administração': { D: 45, I: 40, S: 65, C: 75 },
  'Ensino':        { D: 35, I: 80, S: 70, C: 40 },
  'Criativo':      { D: 45, I: 65, S: 30, C: 70 }
}

const TYPE_DESCRIPTIONS = {
  D: { name: 'Dominante',     description: 'Pessoas com perfil D são diretas, decididas e orientadas a resultados.' },
  I: { name: 'Influente',     description: 'Pessoas com perfil I são entusiasmadas, comunicativas e persuasivas.' },
  S: { name: 'Estável',       description: 'Pessoas com perfil S são pacientes, leais e confiáveis.' },
  C: { name: 'Consciencioso', description: 'Pessoas com perfil C são analíticas, precisas e sistemáticas.' }
}

const TYPE_TIPS = {
  D: { 'Vendas': 'Use sua determinação para bater metas, desenvolva escuta ativa.', 'Liderança': 'Inclua a equipe nas decisões.', 'Atendimento': 'Pratique empatia e paciência.', 'Financeiro': 'Cuidado para não pular etapas.', 'Marketing': 'Desenvolva sensibilidade criativa.', 'Operações': 'Desenvolva planejamento de longo prazo.', 'RH': 'Desenvolva sensibilidade.', 'TI': 'Desenvolva paciência para detalhes.', 'Produção': 'Cuidado para não pressionar demais.', 'Administração': 'Atenção a processos.', 'Ensino': 'Desenvolva escuta.', 'Criativo': 'Abra espaço para ideias divergentes.' },
  I: { 'Vendas': 'Seu carisma é perfeito. Desenvolva suivi organizado.', 'Liderança': 'Desenvolva firmeza nas decisões difíceis.', 'Atendimento': 'Cuidado para não prometer demais.', 'Financeiro': 'Desenvolva rigor com números.', 'Marketing': 'Perfeito! Mantenha foco em resultados.', 'Operações': 'Desenvolva atenção a processos.', 'RH': 'Desenvolva estrutura.', 'TI': 'Desenvolva foco em detalhes técnicos.', 'Produção': 'Desenvolva consistência.', 'Administração': 'Desenvolva organização documental.', 'Ensino': 'Perfeito! Desenvolva estrutura nas avaliações.', 'Criativo': 'Desenvolva disciplina para finalizar.' },
  S: { 'Vendas': 'Desenvolva assertividade no fechamento.', 'Liderança': 'Desenvolva firmeza.', 'Atendimento': 'Perfeito! Cuidado com sobrecarga.', 'Financeiro': 'Desenvolva proatividade.', 'Marketing': 'Desenvolva ousadia.', 'Operações': 'Perfeito! Mantenha.', 'RH': 'Perfeito! Cuidado com sobrecarga emocional.', 'TI': 'Desenvolva proatividade.', 'Produção': 'Perfeito! Mantenha.', 'Administração': 'Desenvolva iniciativa.', 'Ensino': 'Desenvolva dinamismo.', 'Criativo': 'Desenvolva abertura para experimentar.' },
  C: { 'Vendas': 'Desenvolva espontaneidade e conexão emocional.', 'Liderança': 'Desenvolva velocidade nas decisões.', 'Atendimento': 'Desenvolva empatia e flexibilidade.', 'Financeiro': 'Perfeito! Mantenha.', 'Marketing': 'Desenvolva criatividade.', 'Operações': 'Desenvolva flexibilidade.', 'RH': 'Desenvolva sensibilidade.', 'TI': 'Perfeito! Mantenha.', 'Produção': 'Desenvolva velocidade.', 'Administração': 'Perfeito! Mantenha.', 'Ensino': 'Desenvolva dinâmica.', 'Criativo': 'Desenvolva ousadia.' }
}

function calculateDISCScores(responses) {
  const scores = { D: 0, I: 0, S: 0, C: 0 }
  for (const r of responses) {
    const m = CHOICE_MAP[r.most]; const l = CHOICE_MAP[r.least]
    if (m) scores[m] += 1; if (l) scores[l] -= 1
  }
  return scores
}

function calculatePercentages(scores) {
  const keys = ['D', 'I', 'S', 'C']; const raw = {}; const normalized = {}
  for (const k of keys) raw[k] = ((scores[k] + 24) / 48) * 100
  const sum = raw.D + raw.I + raw.S + raw.C
  for (const k of keys) normalized[k] = sum > 0 ? Math.round((raw[k] / sum) * 100) : 25
  const diff = 100 - (normalized.D + normalized.I + normalized.S + normalized.C)
  if (diff !== 0) { const mk = keys.reduce((a, b) => normalized[a] >= normalized[b] ? a : b); normalized[mk] += diff }
  return normalized
}

function getDominantType(pcts) {
  const sorted = Object.entries(pcts).sort((a, b) => b[1] - a[1])
  return { dominant: sorted[0][0], secondary: sorted[1][0] }
}

function calculateFit(pcts, fn) {
  const ideal = FUNCTION_PROFILES[fn]; if (!ideal) return 0
  const keys = ['D', 'I', 'S', 'C']
  const emp = keys.map(k => pcts[k]); const idl = keys.map(k => ideal[k])
  const n = emp.length; const me = emp.reduce((a, b) => a + b, 0) / n; const mi = idl.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sx2 = 0, sy2 = 0
  for (let i = 0; i < n; i++) { const dx = emp[i] - me; const dy = idl[i] - mi; sxy += dx * dy; sx2 += dx * dx; sy2 += dy * dy }
  const den = Math.sqrt(sx2 * sy2)
  if (den === 0) { let ssd = 0; for (let i = 0; i < n; i++) ssd += (emp[i] - idl[i]) ** 2; return Math.max(0, Math.min(100, Math.round((1 - Math.sqrt(ssd) / 200) * 100))) }
  const p = sxy / den; return Math.max(0, Math.min(100, Math.round(((p + 1) / 2) * 100)))
}

function generateAnalysis(pcts, cats) {
  const { dominant, secondary } = getDominantType(pcts)
  const currFn = cats && cats.length > 0 ? cats[0] : null
  const currFit = currFn ? calculateFit(pcts, currFn) : 0
  const allFits = Object.keys(FUNCTION_PROFILES).map(fn => ({ functionName: fn, fitPercentage: calculateFit(pcts, fn) })).sort((a, b) => b.fitPercentage - a.fitPercentage)
  const top3 = allFits.slice(0, 3).map(f => ({ ...f, reason: f.fitPercentage >= 80 ? `Seu perfil ${TYPE_DESCRIPTIONS[dominant].name} tem alta compatibilidade.` : f.fitPercentage >= 60 ? 'Seu perfil tem boa compatibilidade.' : 'Compatibilidade moderada.' }))
  const tips = currFn ? (TYPE_TIPS[dominant]?.[currFn] || 'Continue desenvolvendo suas competências.') : ''
  const strengths = { D: 'Decisão, foco em resultados, liderança', I: 'Comunicação, persuasão, inspiração', S: 'Confiabilidade, paciência, consistência', C: 'Precisão, organização, análise' }
  const challenges = { D: 'Impaciência, autoritarismo', I: 'Impulsividade, desorganização', S: 'Resistência a mudanças', C: 'Perfeccionismo, lentidão' }
  return {
    currentFunctionFit: currFit, currentFunctionName: currFn || 'Não informado',
    recommendations: top3, improvementTips: tips,
    strengthsInCurrentRole: strengths[dominant] || '', challengesInCurrentRole: challenges[dominant] || '',
    profileDetails: {
      strengths: [strengths[dominant]], weaknesses: [challenges[dominant]],
      attentionPoints: [], howToManage: [], howToDodgeNegatives: [],
      idealEnvironment: '', stressTriggers: '', motivationKeys: '', communicationStyle: '',
      secondaryType: TYPE_DESCRIPTIONS[secondary]?.name || ''
    }
  }
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, industry, teamSize } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    const existing = await dbFindOne('companies', { email: email.toLowerCase() })
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' })
    const id = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 12)
    const company = { _id: id, id, name, email: email.toLowerCase(), phone, industry, teamSize, password: hashedPassword, createdAt: new Date().toISOString() }
    await dbInsert('companies', company)
    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...user } = company
    return res.status(201).json({ token, user })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    const company = await dbFindOne('companies', { email: email.toLowerCase() })
    if (!company) return res.status(401).json({ error: 'Credenciais inválidas' })
    const valid = await bcrypt.compare(password, company.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })
    const token = jwt.sign({ id: company._id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...user } = company
    return res.json({ token, user })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const company = await dbFindOne('companies', { _id: req.companyId })
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
    const { password, ...user } = company
    return res.json(user)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// ── Invitation routes ─────────────────────────────────────────────────────────
app.post('/api/invitations', auth, async (req, res) => {
  try {
    const { employeeName, employeeEmail } = req.body
    if (!employeeName) return res.status(400).json({ error: 'Nome obrigatório' })
    const id = uuidv4(); const token = uuidv4()
    const invitation = { _id: id, id, companyId: req.companyId, token, employeeName, employeeEmail: employeeEmail?.toLowerCase(), used: false, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), usedAt: null, createdAt: new Date().toISOString() }
    await dbInsert('invitations', invitation)
    return res.status(201).json(invitation)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/invitations', auth, async (req, res) => {
  try {
    const invitations = await dbFind('invitations', { companyId: req.companyId })
    return res.json(invitations)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.delete('/api/invitations/:id', auth, async (req, res) => {
  try {
    const removed = await dbDeleteOne('invitations', { _id: req.params.id, companyId: req.companyId })
    if (!removed) return res.status(404).json({ error: 'Convite não encontrado' })
    return res.json({ message: 'Convite cancelado' })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/invitations/public/:token', async (req, res) => {
  try {
    const invitations = await dbFind('invitations', { token: req.params.token, used: false })
    const inv = invitations.find(i => new Date(i.expiresAt) > new Date())
    if (!inv) return res.status(404).json({ error: 'Convite inválido ou expirado' })
    return res.json({ employeeName: inv.employeeName, employeeEmail: inv.employeeEmail, companyId: inv.companyId })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// ── Employee routes ───────────────────────────────────────────────────────────
app.get('/api/employees', auth, async (req, res) => {
  try {
    const employees = await dbFind('employees', { companyId: req.companyId })
    const results = await dbFind('discResults', { companyId: req.companyId })
    const rm = {}; results.forEach(r => { rm[r.employeeId] = r })
    return res.json(employees.map(e => ({ ...e, discResult: rm[e._id] || null })))
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/employees/:id', auth, async (req, res) => {
  try {
    const emp = await dbFindOne('employees', { _id: req.params.id, companyId: req.companyId })
    if (!emp) return res.status(404).json({ error: 'Funcionário não encontrado' })
    const dr = await dbFindOne('discResults', { employeeId: emp._id })
    return res.json({ ...emp, discResult: dr || null })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.delete('/api/employees/:id', auth, async (req, res) => {
  try {
    const removed = await dbDeleteOne('employees', { _id: req.params.id, companyId: req.companyId })
    if (!removed) return res.status(404).json({ error: 'Funcionário não encontrado' })
    await dbDeleteMany('discResults', { employeeId: req.params.id })
    return res.json({ message: 'Funcionário removido' })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// ── DISC submit ───────────────────────────────────────────────────────────────
app.post('/api/disc/submit', async (req, res) => {
  try {
    const { invitationToken, employeeData, responses } = req.body
    if (!invitationToken || !responses || responses.length !== 24) return res.status(400).json({ error: 'Dados incompletos' })
    const invitations = await dbFind('invitations', { token: invitationToken, used: false })
    const inv = invitations.find(i => new Date(i.expiresAt) > new Date())
    if (!inv) return res.status(404).json({ error: 'Convite inválido ou expirado' })
    const scores = calculateDISCScores(responses)
    const percentages = calculatePercentages(scores)
    const { dominant, secondary } = getDominantType(percentages)
    const analysis = generateAnalysis(percentages, employeeData?.functionCategories || [])
    const targetEmail = (employeeData?.email || inv.employeeEmail || '').toLowerCase()
    let emp = await dbFindOne('employees', { email: targetEmail, companyId: inv.companyId })
    if (!emp) {
      const eid = uuidv4()
      emp = { _id: eid, id: eid, companyId: inv.companyId, name: employeeData?.name || inv.employeeName, email: targetEmail, phone: employeeData?.phone || '', department: employeeData?.department || '', jobTitle: employeeData?.jobTitle || '', jobDescription: employeeData?.jobDescription || '', functionCategories: employeeData?.functionCategories || [], profilePhoto: employeeData?.profilePhoto || null, createdAt: new Date().toISOString() }
      await dbInsert('employees', emp)
    }
    const rid = uuidv4()
    await dbInsert('discResults', { _id: rid, id: rid, employeeId: emp._id, companyId: inv.companyId, invitationId: inv._id, responses, scores, percentages, dominantType: dominant, secondaryType: secondary, analysis, completedAt: new Date().toISOString() })
    await dbUpdateOne('invitations', { _id: inv._id }, { used: true, usedAt: new Date().toISOString() })
    return res.json({ percentages, dominantType: dominant, secondaryType: secondary, description: TYPE_DESCRIPTIONS[dominant].description, analysis: { currentFunctionFit: analysis.currentFunctionFit, currentFunctionName: analysis.currentFunctionName, recommendations: analysis.recommendations, improvementTips: analysis.improvementTips, strengthsInCurrentRole: analysis.strengthsInCurrentRole, challengesInCurrentRole: analysis.challengesInCurrentRole, profileDetails: analysis.profileDetails } })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// ── Dashboard stats ───────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const [employees, results, invitations] = await Promise.all([
      dbFind('employees', { companyId: req.companyId }),
      dbFind('discResults', { companyId: req.companyId }),
      dbFind('invitations', { companyId: req.companyId })
    ])
    const pending = invitations.filter(i => !i.used && new Date(i.expiresAt) > new Date()).length
    const discDistribution = { D: 0, I: 0, S: 0, C: 0 }
    let totalFit = 0, fitCount = 0
    results.forEach(r => {
      discDistribution.D += r.percentages.D; discDistribution.I += r.percentages.I
      discDistribution.S += r.percentages.S; discDistribution.C += r.percentages.C
      if (r.analysis?.currentFunctionFit != null) { totalFit += r.analysis.currentFunctionFit; fitCount++ }
    })
    if (results.length > 0) {
      discDistribution.D = Math.round(discDistribution.D / results.length)
      discDistribution.I = Math.round(discDistribution.I / results.length)
      discDistribution.S = Math.round(discDistribution.S / results.length)
      discDistribution.C = Math.round(discDistribution.C / results.length)
    }
    return res.json({ totalEmployees: employees.length, completedTests: results.length, pendingInvitations: pending, discDistribution, avgFit: fitCount > 0 ? Math.round(totalFit / fitCount) : 0 })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Erro interno do servidor' }) })

export default app
