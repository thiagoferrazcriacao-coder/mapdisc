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
    // Sort by uploadedAt descending to always get the most recent version
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
    const url = latest.downloadUrl || latest.url
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store'
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

function generateDetailedProfile(dominant, secondary, role, jobTitle, jobDescription, employeeName) {
  const n = employeeName || 'Este profissional'
  const ctx = jobTitle ? `como ${jobTitle}` : role ? `na função de ${role}` : 'nesta função'
  const ctxDesc = jobDescription ? ` Considerando que ${n} ${jobDescription.slice(0, 120).toLowerCase()}, ` : ''

  const PROFILES = {
    D: {
      strengths: [
        `${n} tem tomada de decisão rápida e assertiva ${ctx} — age antes que outros ainda estejam analisando`,
        `Alta capacidade de execução e senso de urgência: entrega resultados mesmo sob pressão intensa`,
        `Liderança natural que direciona a equipe para o objetivo sem se perder em detalhes`,
        `Coragem para enfrentar situações difíceis, negociações tensas e decisões impopulares`,
        `Foco inabalável em metas — não se distrai com tarefas que não geram resultado direto`
      ],
      attentionPoints: [
        `${ctxDesc}${n} pode impor um ritmo acelerado demais, gerando esgotamento na equipe ao redor`,
        `A comunicação muito direta de ${n} pode ser percebida como agressiva por perfis mais sensíveis (S e I)`,
        `Tendência a decidir sem consultar quem tem informações técnicas importantes — fique atento a isso ${ctx}`,
        `Pode subestimar processos e etapas necessárias que parecem "lentos" mas evitam retrabalho`
      ],
      weaknesses: [
        `${n} demonstra impaciência com pessoas mais detalhistas ou com ritmo diferente ${ctx}`,
        `Dificuldade em ouvir críticas: interpreta feedback como ataque e pode reagir de forma defensiva`,
        `Tendência a assumir controle de situações mesmo quando não é o responsável — gera conflito`,
        `Negligência de aspectos emocionais e relacionais que impactam a coesão da equipe`
      ],
      howToDodgeNegatives: [
        `Ao dar feedback para ${n}, seja direto e com dados concretos — ele responde bem à honestidade e mal a rodeios`,
        `Estabeleça como norma que decisões que afetam a equipe precisem de uma etapa de consulta antes de serem executadas`,
        `Em reuniões com ${n}, defina pauta clara e tempo fixo — isso canaliza a energia dele de forma produtiva`,
        `Reconheça publicamente os resultados de ${n}: isso mantém o engajamento sem necessidade de microgestão`,
        `Quando perceber impaciência, ofereça um desafio maior — ${n} precisa de estímulo, não de freio`
      ],
      howToManage: [
        `Dê autonomia real a ${n} ${ctx} com metas claras — microgerenciar este perfil gera conflito e desmotivação`,
        `Apresente desafios com métricas objetivas: ${n} precisa saber exatamente o que "vencer" significa`,
        `Seja direto e objetivo no feedback — ${n} valoriza honestidade mais do que diplomacia`,
        `Ofereça projetos de liderança e protagonismo como forma de reconhecimento e retenção`,
        `Evite reuniões longas sem pauta e sem decisão — prefira encontros curtos, objetivos e conclusivos`
      ],
      idealEnvironment: `${n} performa melhor em ambientes dinâmicos com autonomia para decidir e executar ${ctx}. Prefere metas desafiadoras, liberdade de ação, competição saudável e reconhecimento concreto por conquistas. Perde rendimento em ambientes com excesso de burocracia e aprovações.`,
      stressTriggers: `Ambientes lentos, excesso de aprovações e reuniões sem decisão são os principais gatilhos de queda de performance para ${n} ${ctx}. Perda de controle, falta de autoridade clara e tarefas repetitivas sem propósito esgotam este perfil rapidamente.`,
      motivationKeys: `${n} se motiva com desafios novos, metas ambiciosas, autonomia para agir e a sensação clara de estar avançando ${ctx}. Reconhecimento público por resultados tangíveis é o principal combustível deste perfil.`,
      communicationStyle: `${n} tem comunicação direta, objetiva e orientada a resultados. Prefere respostas curtas, sem rodeios e com decisão clara ao final. ${jobTitle ? `Em ${jobTitle}, valoriza briefings rápidos e reuniões que terminam com ação definida.` : 'Evite apresentações longas sem conclusão prática ao se comunicar com este perfil.'}`
    },
    I: {
      strengths: [
        `${n} tem comunicação envolvente e poder de influência positiva ${ctx} — conecta pessoas e cria engajamento`,
        `Alta capacidade de persuasão: convence, entusiasma e mobiliza equipes em torno de ideias`,
        `Criatividade para apresentar soluções novas e tornar processos mais dinâmicos e atrativos`,
        `Facilidade para construir relacionamentos de confiança com clientes, colegas e lideranças`,
        `Energia e otimismo que contagiam o ambiente e mantêm o time motivado em momentos difíceis`
      ],
      attentionPoints: [
        `${ctxDesc}${n} tende a superestimar o que consegue entregar — os compromissos assumidos precisam de acompanhamento próximo`,
        `A aversão a conflitos pode fazer com que ${n} deixe problemas interpessoais sem resolução ${ctx}`,
        `Dispersão em múltiplas ideias e projetos ao mesmo tempo pode comprometer o foco nas prioridades`,
        `Análises técnicas ou dados detalhados podem ser negligenciados em favor do que "parece certo"`
      ],
      weaknesses: [
        `${n} tem dificuldade em manter organização e disciplina em processos repetitivos ${ctx}`,
        `Impulsividade: tende a agir pelo entusiasmo do momento antes de analisar completamente`,
        `Dependência de aprovação e validação externa para manter a motivação — oscila com a ausência de feedback`,
        `Dificuldade em sustentar o foco em tarefas técnicas, solitárias ou de longo prazo`
      ],
      howToDodgeNegatives: [
        `Estabeleça com ${n} uma lista de prioridades semanais — limite a 3 entregas essenciais e acompanhe o fechamento`,
        `Antes de ${n} assumir novos compromissos, pergunte junto: "Temos tempo e recurso para isso agora?" — esse filtro evita sobrepromessas`,
        `Solicite que ${n} apresente dados e números junto às ideias — isso eleva a qualidade das propostas`,
        `Crie rituais de fechamento: ${n} só deve abrir frentes novas após finalizar o que estava em andamento`,
        `Use reconhecimento como ferramenta de direcionamento — elogie as entregas que ${n} concluiu com qualidade`
      ],
      howToManage: [
        `Reconheça publicamente as conquistas de ${n} ${ctx} — validação é o principal combustível deste perfil`,
        `Dê espaço para criatividade, mas estabeleça entregas com prazo e critério de qualidade claros`,
        `Envolva ${n} em apresentações, vendas, treinamentos e interações que exijam influência e comunicação`,
        `Ofereça feedback com encorajamento antes de apontar pontos de melhoria — a ordem importa`,
        `Posicione ${n} como referência em projetos de comunicação, inovação e engajamento de equipe`
      ],
      idealEnvironment: `${n} performa melhor em ambientes colaborativos com interação social frequente e espaço para criatividade ${ctx}. Prefere variedade de tarefas, reconhecimento visível e um time positivo. Perde energia em ambientes frios, isolados ou excessivamente técnicos.`,
      stressTriggers: `Isolamento, tarefas muito técnicas e repetitivas, falta de reconhecimento e ambientes frios sem interação são os principais desgastes para ${n} ${ctx}. Críticas públicas sem contexto positivo desmontam rapidamente este perfil.`,
      motivationKeys: `${n} se motiva sendo reconhecido, trabalhando com pessoas, tendo liberdade criativa e sentindo que inspira os outros ${ctx}. A sensação de que sua presença faz diferença no time é o maior motivador deste perfil.`,
      communicationStyle: `${n} tem comunicação expressiva, calorosa e persuasiva — usa histórias, analogias e emoção para engajar. ${jobTitle ? `Em ${jobTitle}, prefere reuniões participativas e dinâmicas que terminem com energia positiva.` : 'Evite comunicações frias ou apenas por escrito sem interação com este perfil.'}`
    },
    S: {
      strengths: [
        `${n} tem confiabilidade excepcional ${ctx} — as pessoas sabem que podem contar com ele sem precisar cobrar`,
        `Capacidade de ouvir com atenção genuína, o que gera confiança sólida em clientes e colegas`,
        `Paciência para lidar com situações difíceis e pessoas em crise sem perder o equilíbrio emocional`,
        `Lealdade e comprometimento de longo prazo — constrói relações sólidas que sustentam resultados`,
        `Habilidade natural de criar ambientes harmoniosos onde as pessoas se sentem seguras e valorizadas`
      ],
      attentionPoints: [
        `${ctxDesc}${n} pode acumular demandas por dificuldade em recusar pedidos — o excesso leva ao esgotamento silencioso`,
        `Resistência a mudanças rápidas pode fazer com que ${n} atrase adaptações necessárias ${ctx}`,
        `A dificuldade em se posicionar firmemente pode deixar problemas importantes sem resolução por tempo demais`,
        `Pode ser percebido como passivo ou sem iniciativa em situações que exigem protagonismo e velocidade`
      ],
      weaknesses: [
        `${n} tem dificuldade em tomar decisões rápidas sob pressão — precisa de tempo para processar ${ctx}`,
        `Resistência a conflitos pode silenciar opiniões importantes que precisavam ser expressas`,
        `Tendência a colocar as necessidades dos outros acima das próprias, gerando burnout silencioso`,
        `Manutenção do status quo mesmo quando uma mudança necessária está clara para todos ao redor`
      ],
      howToDodgeNegatives: [
        `Ao delegar tarefas a ${n}, estabeleça prazos claros com antecedência — a estrutura elimina a paralisia por sobrecarga`,
        `Crie um canal individual e seguro para ${n} expressar opiniões — em grupo, este perfil tende a se calar`,
        `Quando houver mudança de processo ou estrutura, comunique a ${n} com antecedência e explique o raciocínio`,
        `Proteja ${n} de sobrecarga: monitore a carga de trabalho e intervenha antes do esgotamento aparecer`,
        `Incentive ${n} a verbalizar discordâncias — sua opinião tem valor estratégico e precisa ser ouvida`
      ],
      howToManage: [
        `Ofereça estabilidade e clareza nas expectativas para ${n} ${ctx} — insegurança e ambiguidade paralisam este perfil`,
        `Anuncie mudanças com antecedência e explique o raciocínio — isso elimina a resistência antes que apareça`,
        `Reconheça a consistência e confiabilidade de ${n} com a mesma frequência que reconhece grandes feitos`,
        `Crie espaços individuais para que ${n} expresse opiniões — em grupo, este perfil pode se calar`,
        `Envolva ${n} em projetos de longo prazo que valorizem relacionamento, consistência e suporte ao cliente`
      ],
      idealEnvironment: `${n} performa melhor em ambientes estáveis, previsíveis e colaborativos ${ctx}. Prefere rotinas bem definidas, relações de confiança duradouras e um time unido onde há respeito mútuo. Perde rendimento em ambientes de alta pressão e mudanças abruptas.`,
      stressTriggers: `Mudanças abruptas sem explicação, conflitos interpessoais não resolvidos, pressão por velocidade excessiva e ambientes de alta competição interna são os principais gatilhos de queda de rendimento para ${n} ${ctx}.`,
      motivationKeys: `${n} se motiva sentindo que contribui de forma significativa para a equipe, tendo relações de confiança sólidas, estabilidade no ambiente e sendo reconhecido pelo trabalho consistente e pela lealdade ${ctx}.`,
      communicationStyle: `${n} tem comunicação calorosa, paciente e empática — ouve mais do que fala e escolhe as palavras com cuidado. ${jobTitle ? `Em ${jobTitle}, valoriza explicações completas, conversas individuais e tempo para processar antes de responder.` : 'Prefira comunicação presencial ou por voz a trocas rápidas por texto com este perfil.'}`
    },
    C: {
      strengths: [
        `${n} tem precisão e qualidade técnica nas entregas ${ctx} — entrega com pouquíssima margem de erro`,
        `Capacidade analítica para identificar riscos, inconsistências e oportunidades que outros não percebem`,
        `Organização e sistematização que transforma processos caóticos em fluxos replicáveis e eficientes`,
        `Comprometimento rigoroso com padrões de qualidade e excelência — não entrega "mais ou menos"`,
        `Habilidade de investigar problemas até encontrar a causa raiz, evitando soluções superficiais`
      ],
      attentionPoints: [
        `${ctxDesc}${n} pode analisar em excesso e atrasar decisões que precisam de velocidade ${ctx}`,
        `O perfeccionismo de ${n} pode gerar retrabalho desnecessário em entregas que já estavam adequadas`,
        `Dificuldade em delegar: acredita que ninguém vai fazer no padrão necessário — isso cria gargalos`,
        `Comunicação técnica de ${n} pode criar distância com perfis menos analíticos em reuniões e apresentações`
      ],
      weaknesses: [
        `${n} tem resistência a improvisar — situações fora do planejado ${ctx} geram ansiedade e queda de performance`,
        `Pode ser excessivamente crítico com erros próprios e alheios, gerando clima de tensão na equipe`,
        `Dificuldade em tomar decisões com informações incompletas — espera por mais dados que podem não chegar`,
        `Pode parecer frio ou distante em contextos emocionais onde a conexão humana é necessária`
      ],
      howToDodgeNegatives: [
        `Ao briefar ${n}, defina critérios claros de "bom o suficiente" — nem toda entrega precisa de 100% de perfeição`,
        `Estabeleça prazos máximos de análise para ${n}: "Até X você reúne os dados, depois a gente decide junto"`,
        `Peça que ${n} apresente as conclusões de forma acessível, com contexto para não especialistas`,
        `Crie marcos de entrega intermediários — isso evita que ${n} refine indefinidamente sem avançar`,
        `Valorize explicitamente a qualidade das entregas de ${n}: ele precisa ouvir que precisão tem valor para a empresa`
      ],
      howToManage: [
        `Forneça dados, critérios claros e contexto lógico a ${n} ${ctx} — este perfil responde à razão, não à emoção`,
        `Dê tempo adequado para análise — pressão por velocidade gera qualidade inferior e resistência de ${n}`,
        `Valorize a precisão e profundidade das entregas de ${n}, não só a velocidade — ele precisa saber que qualidade importa`,
        `Apresente mudanças com justificativas racionais, evidências e impacto esperado — evite "porque sim"`,
        `Envolva ${n} em projetos que exijam planejamento, auditoria, controle de qualidade e análise de dados`
      ],
      idealEnvironment: `${n} performa melhor em ambientes estruturados com processos claros e espaço para aprofundamento técnico ${ctx}. Prefere trabalhar com dados e padrões bem definidos. Perde rendimento sob improvisação forçada ou em ambientes caóticos.`,
      stressTriggers: `Improvisação forçada, informações insuficientes para decidir, ambientes caóticos e pressão para entregar sem tempo adequado de análise são os principais gatilhos de queda de desempenho para ${n} ${ctx}.`,
      motivationKeys: `${n} se motiva resolvendo problemas complexos com qualidade, alcançando padrões de excelência reconhecidos e sendo valorizado pela precisão e competência técnica ${ctx}. Ter acesso a dados e ferramentas adequadas é essencial.`,
      communicationStyle: `${n} tem comunicação precisa, lógica e baseada em fatos — prefere escrita com dados, estrutura clara e conclusões documentadas. ${jobTitle ? `Em ${jobTitle}, valoriza reuniões com pauta definida, atas e decisões registradas.` : 'Evite comunicações vagas ou baseadas apenas em intuição com este perfil.'}`
    }
  }

  const p = PROFILES[dominant] || PROFILES.D
  const secName = TYPE_DESCRIPTIONS[secondary]?.name || ''
  const secInfluence = {
    D: { I: `A influência do perfil I adiciona carisma e facilidade de comunicação às decisões assertivas de ${n}.`, S: `O perfil S secundário traz paciência e cuidado com as pessoas, equilibrando a determinação de ${n}.`, C: `O C secundário adiciona rigor analítico às decisões de ${n} — age rápido, mas com embasamento.` },
    I: { D: `A influência do D adiciona assertividade e foco em resultados ao entusiasmo natural de ${n}.`, S: `O S secundário traz empatia profunda e consistência, tornando a influência de ${n} mais duradoura.`, C: `O C secundário adiciona organização e profundidade às ideias criativas de ${n}.` },
    S: { D: `A influência do D adiciona iniciativa e assertividade quando necessário ao jeito cuidadoso de ${n}.`, I: `O I secundário traz leveza, humor e comunicação mais expressiva ao perfil consistente de ${n}.`, C: `O C secundário reforça a organização e atenção aos detalhes no trabalho consistente de ${n}.` },
    C: { D: `A influência do D adiciona velocidade e decisão à análise de ${n} — age quando tem dados suficientes.`, I: `O I secundário traz calor humano e comunicação mais acessível às entregas técnicas de ${n}.`, S: `O S secundário adiciona paciência e cuidado com as pessoas ao perfil analítico de ${n}.` }
  }
  const influence = secInfluence[dominant]?.[secondary] || ''

  return {
    strengths: p.strengths,
    attentionPoints: p.attentionPoints,
    weaknesses: p.weaknesses,
    howToDodgeNegatives: p.howToDodgeNegatives,
    howToManage: p.howToManage,
    idealEnvironment: p.idealEnvironment,
    stressTriggers: p.stressTriggers,
    motivationKeys: p.motivationKeys,
    communicationStyle: p.communicationStyle,
    secondaryType: secName,
    secondaryInfluence: influence
  }
}

function generateAnalysis(pcts, cats, jobTitle, jobDescription, employeeName) {
  const { dominant, secondary } = getDominantType(pcts)
  const n = employeeName || 'Este profissional'
  const currFn = cats && cats.length > 0 ? cats[0] : null
  const currFit = currFn ? calculateFit(pcts, currFn) : 0
  const allFits = Object.keys(FUNCTION_PROFILES).map(fn => ({ functionName: fn, fitPercentage: calculateFit(pcts, fn) })).sort((a, b) => b.fitPercentage - a.fitPercentage)
  const top3 = allFits.slice(0, 3).map(f => ({ ...f, reason: f.fitPercentage >= 80 ? `Alta compatibilidade: o perfil ${TYPE_DESCRIPTIONS[dominant].name} de ${n} se alinha muito bem com as exigências desta função.` : f.fitPercentage >= 60 ? `Boa compatibilidade: ${n} tem características relevantes para esta função com alguns pontos de desenvolvimento.` : `Compatibilidade moderada: há espaço para crescimento, mas exige desenvolvimento em áreas específicas para ${n}.` }))
  const tips = currFn ? (TYPE_TIPS[dominant]?.[currFn] || `Continue acompanhando o desenvolvimento de ${n} e ofereça feedback regular sobre desempenho e comportamento.`) : `Defina a função principal de ${n} para receber dicas personalizadas de gestão.`
  const strengths = { D: 'Decisão, foco em resultados, liderança', I: 'Comunicação, persuasão, inspiração', S: 'Confiabilidade, paciência, consistência', C: 'Precisão, organização, análise' }
  const challenges = { D: 'Impaciência, autoritarismo', I: 'Impulsividade, desorganização', S: 'Resistência a mudanças', C: 'Perfeccionismo, lentidão' }
  const profileDetails = generateDetailedProfile(dominant, secondary, currFn, jobTitle, jobDescription, employeeName)
  return {
    currentFunctionFit: currFit, currentFunctionName: currFn || 'Não informado',
    recommendations: top3, improvementTips: tips,
    strengthsInCurrentRole: strengths[dominant] || '', challengesInCurrentRole: challenges[dominant] || '',
    profileDetails
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
    const { employeeName, employeeEmail, employeeId } = req.body
    if (!employeeName) return res.status(400).json({ error: 'Nome obrigatório' })
    const id = uuidv4(); const token = uuidv4()
    const invitation = { _id: id, id, companyId: req.companyId, token, employeeName, employeeEmail: employeeEmail?.toLowerCase() || '', employeeId: employeeId || null, used: false, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), usedAt: null, createdAt: new Date().toISOString() }
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
    let jobTitle = ''
    if (inv.employeeId) {
      const emp = await dbFindOne('employees', { _id: inv.employeeId })
      jobTitle = emp?.jobTitle || ''
    }
    return res.json({ employeeName: inv.employeeName, employeeEmail: inv.employeeEmail, companyId: inv.companyId, employeeId: inv.employeeId || null, jobTitle })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// ── Employee routes ───────────────────────────────────────────────────────────
app.post('/api/employees', auth, async (req, res) => {
  try {
    const { name, jobTitle, email, department, functionCategories } = req.body
    if (!name) return res.status(400).json({ error: 'Nome obrigatório' })
    const id = uuidv4()
    const emp = { _id: id, id, companyId: req.companyId, name, email: email?.toLowerCase() || '', jobTitle: jobTitle || '', jobDescription: '', department: department || '', functionCategories: functionCategories || (jobTitle ? [jobTitle] : []), profilePhoto: null, createdAt: new Date().toISOString() }
    await dbInsert('employees', emp)
    return res.status(201).json(emp)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

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
    const empName = employeeData?.name || inv.employeeName || ''
    const analysis = generateAnalysis(percentages, employeeData?.functionCategories || [], employeeData?.jobTitle || '', employeeData?.jobDescription || '', empName)
    const targetEmail = (employeeData?.email || inv.employeeEmail || '').toLowerCase()
    // Find pre-created employee by employeeId (from panel creation) or by email
    let emp = inv.employeeId
      ? await dbFindOne('employees', { _id: inv.employeeId, companyId: inv.companyId })
      : (targetEmail ? await dbFindOne('employees', { email: targetEmail, companyId: inv.companyId }) : null)
    if (!emp) {
      const eid = uuidv4()
      emp = { _id: eid, id: eid, companyId: inv.companyId, name: empName, email: targetEmail, phone: employeeData?.phone || '', department: employeeData?.department || '', jobTitle: employeeData?.jobTitle || '', jobDescription: employeeData?.jobDescription || '', functionCategories: employeeData?.functionCategories || [], profilePhoto: employeeData?.profilePhoto || null, createdAt: new Date().toISOString() }
      await dbInsert('employees', emp)
    } else {
      // Update pre-created employee with data filled in by the employee during the test
      const updates = {}
      if (employeeData?.phone) updates.phone = employeeData.phone
      if (employeeData?.department) updates.department = employeeData.department
      if (employeeData?.jobTitle) updates.jobTitle = employeeData.jobTitle
      if (employeeData?.jobDescription) updates.jobDescription = employeeData.jobDescription
      if (employeeData?.functionCategories?.length) updates.functionCategories = employeeData.functionCategories
      if (employeeData?.profilePhoto) updates.profilePhoto = employeeData.profilePhoto
      if (Object.keys(updates).length > 0) {
        await dbUpdateOne('employees', { _id: emp._id }, updates)
        emp = { ...emp, ...updates }
      }
    }
    // ── Relocation suggestions when fit < 20% ────────────────────────────────
    let relocationSuggestions = []
    if (analysis.currentFunctionFit < 50) {
      try {
        const cfDoc = await dbFindOne('companyFunctions', { companyId: inv.companyId })
        if (cfDoc?.sectors?.length > 0) {
          const suggestions = []
          for (const sector of cfDoc.sectors) {
            for (const fn of (sector.functions || [])) {
              if (fn.discCategory && FUNCTION_PROFILES[fn.discCategory]) {
                suggestions.push({ functionName: fn.name, sectorName: sector.name, fitPercentage: calculateFit(percentages, fn.discCategory) })
              }
            }
          }
          relocationSuggestions = suggestions.sort((a, b) => b.fitPercentage - a.fitPercentage).slice(0, 3)
        }
      } catch (_) {}
    }
    const rid = uuidv4()
    await dbInsert('discResults', { _id: rid, id: rid, employeeId: emp._id, companyId: inv.companyId, invitationId: inv._id, responses, scores, percentages, dominantType: dominant, secondaryType: secondary, analysis, relocationSuggestions, completedAt: new Date().toISOString() })
    await dbUpdateOne('invitations', { _id: inv._id }, { used: true, usedAt: new Date().toISOString() })
    return res.json({ percentages, dominantType: dominant, secondaryType: secondary, description: TYPE_DESCRIPTIONS[dominant].description, analysis: { currentFunctionFit: analysis.currentFunctionFit, currentFunctionName: analysis.currentFunctionName, recommendations: analysis.recommendations, improvementTips: analysis.improvementTips, strengthsInCurrentRole: analysis.strengthsInCurrentRole, challengesInCurrentRole: analysis.challengesInCurrentRole, profileDetails: analysis.profileDetails }, relocationSuggestions })
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

// ── Company functions routes ──────────────────────────────────────────────────
app.get('/api/company/functions', auth, async (req, res) => {
  try {
    const doc = await dbFindOne('companyFunctions', { companyId: req.companyId })
    return res.json(doc ? doc.sectors : [])
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.put('/api/company/functions', auth, async (req, res) => {
  try {
    const { sectors } = req.body
    const existing = await dbFindOne('companyFunctions', { companyId: req.companyId })
    if (existing) {
      await dbUpdateOne('companyFunctions', { companyId: req.companyId }, { sectors: sectors || [] })
    } else {
      await dbInsert('companyFunctions', { _id: uuidv4(), id: uuidv4(), companyId: req.companyId, sectors: sectors || [] })
    }
    return res.json({ sectors: sectors || [] })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Erro interno do servidor' }) })

export default app
