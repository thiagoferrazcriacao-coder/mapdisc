import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET || 'mapdisc-secret-change-me'

const memStore = {
  companies: [],
  employees: [],
  invitations: [],
  discResults: []
}

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.companyId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

const CHOICE_MAP = { A: 'D', B: 'I', C: 'S', D: 'C', D: 'D', I: 'I', S: 'S', C: 'C' }

const FUNCTION_PROFILES = {
  'Vendas': { D: 70, I: 85, S: 40, C: 30 },
  'Liderança': { D: 90, I: 60, S: 50, C: 40 },
  'Atendimento': { D: 35, I: 70, S: 85, C: 40 },
  'Financeiro': { D: 30, I: 25, S: 60, C: 90 },
  'Marketing': { D: 55, I: 80, S: 30, C: 45 },
  'Operações': { D: 50, I: 30, S: 75, C: 70 },
  'RH': { D: 40, I: 75, S: 80, C: 45 },
  'TI': { D: 35, I: 25, S: 55, C: 85 },
  'Produção': { D: 55, I: 25, S: 75, C: 65 },
  'Administração': { D: 45, I: 40, S: 65, C: 75 },
  'Ensino': { D: 35, I: 80, S: 70, C: 40 },
  'Criativo': { D: 45, I: 65, S: 30, C: 70 }
}

const TYPE_DESCRIPTIONS = {
  D: { name: 'Dominante', description: 'Pessoas com perfil D são diretas, decididas e orientadas a resultados.' },
  I: { name: 'Influente', description: 'Pessoas com perfil I são entusiasmadas, comunicativas e persuasivas.' },
  S: { name: 'Estável', description: 'Pessoas com perfil S são pacientes, leais e confiáveis.' },
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
  const top3 = allFits.slice(0, 3).map(f => ({ ...f, reason: f.fitPercentage >= 80 ? `Seu perfil ${TYPE_DESCRIPTIONS[dominant].name} tem alta compatibilidade.` : f.fitPercentage >= 60 ? `Seu perfil tem boa compatibilidade.` : `Compatibilidade moderada.` }))
  const tips = currFn ? (TYPE_TIPS[dominant]?.[currFn] || 'Continue desenvolvendo suas competências.') : ''
  const strengths = { D: 'Decisão, foco em resultados, liderança', I: 'Comunicação, persuasão, inspiração', S: 'Confiabilidade, paciência, consistência', C: 'Precisão, organização, análise' }
  const challenges = { D: 'Impaciência, autoritarismo', I: 'Impulsividade, desorganização', S: 'Resistência a mudanças', C: 'Perfeccionismo, lentidão' }
  return {
    currentFunctionFit: currFit, currentFunctionName: currFn || 'Não informado',
    recommendations: top3, improvementTips: tips,
    strengthsInCurrentRole: strengths[dominant] || '', challengesInCurrentRole: challenges[dominant] || '',
    profileDetails: {
      strengths: TYPE_DESCRIPTIONS[dominant].strengths || [strengths[dominant]],
      weaknesses: TYPE_DESCRIPTIONS[dominant].weaknesses || [challenges[dominant]],
      attentionPoints: TYPE_DESCRIPTIONS[dominant].attentionPoints || [],
      howToManage: TYPE_DESCRIPTIONS[dominant].howToManage || [],
      howToDodgeNegatives: TYPE_DESCRIPTIONS[dominant].howToDodgeNegatives || [],
      idealEnvironment: TYPE_DESCRIPTIONS[dominant].idealEnvironment || '',
      stressTriggers: TYPE_DESCRIPTIONS[dominant].stressTriggers || '',
      motivationKeys: TYPE_DESCRIPTIONS[dominant].motivationKeys || '',
      communicationStyle: TYPE_DESCRIPTIONS[dominant].communicationStyle || '',
      secondaryType: TYPE_DESCRIPTIONS[secondary]?.name || ''
    }
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, industry, teamSize } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    const existing = memStore.companies.find(c => c.email === email.toLowerCase())
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' })
    const id = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 12)
    const company = { _id: id, name, email: email.toLowerCase(), phone, industry, teamSize, password: hashedPassword, createdAt: new Date().toISOString() }
    memStore.companies.push(company)
    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...user } = company
    return res.status(201).json({ token, user: { ...user, id } })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    const company = memStore.companies.find(c => c.email === email.toLowerCase())
    if (!company) return res.status(401).json({ error: 'Credenciais inválidas' })
    const valid = await bcrypt.compare(password, company.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })
    const token = jwt.sign({ id: company._id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...user } = company
    return res.json({ token, user: { ...user, id: company._id } })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const company = memStore.companies.find(c => c._id === req.companyId)
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })
    const { password, ...user } = company
    return res.json({ ...user, id: company._id })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.post('/api/invitations', auth, async (req, res) => {
  try {
    const { employeeName, employeeEmail } = req.body
    if (!employeeName) return res.status(400).json({ error: 'Nome obrigatório' })
    const id = uuidv4(); const token = uuidv4()
    const invitation = { _id: id, companyId: req.companyId, token, employeeName, employeeEmail: employeeEmail?.toLowerCase(), used: false, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), usedAt: null, createdAt: new Date().toISOString() }
    memStore.invitations.push(invitation)
    return res.status(201).json({ ...invitation, id })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/invitations', auth, async (req, res) => {
  try {
    const invitations = memStore.invitations.filter(i => i.companyId === req.companyId)
    return res.json(invitations.map(({ ...i }) => ({ ...i, id: i._id })))
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.delete('/api/invitations/:id', auth, async (req, res) => {
  try {
    const idx = memStore.invitations.findIndex(i => i._id === req.params.id && i.companyId === req.companyId)
    if (idx === -1) return res.status(404).json({ error: 'Convite não encontrado' })
    memStore.invitations.splice(idx, 1)
    return res.json({ message: 'Convite cancelado' })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/invitations/public/:token', async (req, res) => {
  try {
    const inv = memStore.invitations.find(i => i.token === req.params.token && !i.used && new Date(i.expiresAt) > new Date())
    if (!inv) return res.status(404).json({ error: 'Convite inválido ou expirado' })
    return res.json({ employeeName: inv.employeeName, employeeEmail: inv.employeeEmail, companyId: inv.companyId })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/employees', auth, async (req, res) => {
  try {
    const employees = memStore.employees.filter(e => e.companyId === req.companyId)
    const results = memStore.discResults.filter(r => r.companyId === req.companyId)
    const rm = {}; results.forEach(r => { rm[r.employeeId] = r })
    return res.json(employees.map(e => ({ ...e, id: e._id, discResult: rm[e._id] || null })))
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/employees/:id', auth, async (req, res) => {
  try {
    const emp = memStore.employees.find(e => e._id === req.params.id && e.companyId === req.companyId)
    if (!emp) return res.status(404).json({ error: 'Funcionário não encontrado' })
    const dr = memStore.discResults.find(r => r.employeeId === emp._id) || null
    return res.json({ ...emp, id: emp._id, discResult: dr })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.delete('/api/employees/:id', auth, async (req, res) => {
  try {
    const idx = memStore.employees.findIndex(e => e._id === req.params.id && e.companyId === req.companyId)
    if (idx === -1) return res.status(404).json({ error: 'Funcionário não encontrado' })
    memStore.employees.splice(idx, 1)
    const ridx = memStore.discResults.findIndex(r => r.employeeId === req.params.id)
    if (ridx !== -1) memStore.discResults.splice(ridx, 1)
    return res.json({ message: 'Funcionário removido' })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.post('/api/disc/submit', async (req, res) => {
  try {
    const { invitationToken, employeeData, responses } = req.body
    if (!invitationToken || !responses || responses.length !== 24) return res.status(400).json({ error: 'Dados incompletos' })
    const inv = memStore.invitations.find(i => i.token === invitationToken && !i.used && new Date(i.expiresAt) > new Date())
    if (!inv) return res.status(404).json({ error: 'Convite inválido ou expirado' })
    const scores = calculateDISCScores(responses)
    const percentages = calculatePercentages(scores)
    const { dominant, secondary } = getDominantType(percentages)
    const analysis = generateAnalysis(percentages, employeeData?.functionCategories || [])
    let emp = memStore.employees.find(e => e.email === (employeeData?.email || inv.employeeEmail) && e.companyId === inv.companyId)
    if (!emp) {
      const eid = uuidv4()
      emp = { _id: eid, companyId: inv.companyId, name: employeeData?.name || inv.employeeName, email: employeeData?.email || inv.employeeEmail, phone: employeeData?.phone, department: employeeData?.department, jobTitle: employeeData?.jobTitle, jobDescription: employeeData?.jobDescription, dailyTasks: employeeData?.dailyTasks || [], functionCategories: employeeData?.functionCategories || [], createdAt: new Date().toISOString() }
      memStore.employees.push(emp)
    }
    const eid = uuidv4()
    memStore.discResults.push({ _id: eid, employeeId: emp._id, companyId: inv.companyId, invitationId: inv._id, responses, scores, percentages, dominantType: dominant, secondaryType: secondary, analysis, completedAt: new Date().toISOString() })
    inv.used = true; inv.usedAt = new Date().toISOString()
    return res.json({ percentages, dominantType: dominant, secondaryType: secondary, description: TYPE_DESCRIPTIONS[dominant].description, analysis: { currentFunctionFit: analysis.currentFunctionFit, currentFunctionName: analysis.currentFunctionName, recommendations: analysis.recommendations, improvementTips: analysis.improvementTips, strengthsInCurrentRole: analysis.strengthsInCurrentRole, challengesInCurrentRole: analysis.challengesInCurrentRole, profileDetails: analysis.profileDetails } })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const employees = memStore.employees.filter(e => e.companyId === req.companyId)
    const results = memStore.discResults.filter(r => r.companyId === req.companyId)
    const invitations = memStore.invitations.filter(i => i.companyId === req.companyId)
    const pending = invitations.filter(i => !i.used && new Date(i.expiresAt) > new Date()).length
    const discDistribution = { D: 0, I: 0, S: 0, C: 0 }
    let totalFit = 0, fitCount = 0
    results.forEach(r => { discDistribution.D += r.percentages.D; discDistribution.I += r.percentages.I; discDistribution.S += r.percentages.S; discDistribution.C += r.percentages.C; if (r.analysis?.currentFunctionFit != null) { totalFit += r.analysis.currentFunctionFit; fitCount++ } })
    if (results.length > 0) { discDistribution.D = Math.round(discDistribution.D / results.length); discDistribution.I = Math.round(discDistribution.I / results.length); discDistribution.S = Math.round(discDistribution.S / results.length); discDistribution.C = Math.round(discDistribution.C / results.length) }
    return res.json({ totalEmployees: employees.length, completedTests: results.length, pendingInvitations: pending, discDistribution, avgFit: fitCount > 0 ? Math.round(totalFit / fitCount) : 0 })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.get('/api/disc/questions', async (req, res) => {
  return res.json({ questions: DISC_QUESTIONS_SHORT || [] })
})

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Erro interno do servidor' }) })

export default app