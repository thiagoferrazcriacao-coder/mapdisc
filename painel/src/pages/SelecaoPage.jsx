import { useState, useEffect } from 'react'
import { api } from '../api/client'

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_CATEGORIES = ['Vendas','Liderança','Atendimento','Financeiro','Marketing','Operações','RH','TI','Produção','Administração','Ensino','Criativo']

function FitBadge({ pct }) {
  if (pct == null) return <span className="text-xs text-gray-400">Aguardando</span>
  const color = pct >= 75 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{pct}% fit</span>
}

function DISCMini({ pcts }) {
  if (!pcts) return null
  return (
    <div className="flex gap-1 items-end h-6">
      {['D','I','S','C'].map(k => (
        <div key={k} className="flex flex-col items-center gap-0.5">
          <div className="w-3 rounded-sm" style={{ height: `${Math.round((pcts[k]/100)*20)}px`, background: DISC_COLORS[k], minHeight: 2 }} />
          <span className="text-[9px] font-bold" style={{ color: DISC_COLORS[k] }}>{k}</span>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { pending: ['Aguardando','bg-gray-100 text-gray-600'], tested: ['Testado','bg-blue-100 text-blue-700'], hired: ['Contratado','bg-green-100 text-green-700'] }
  const [label, cls] = map[status] || ['—','bg-gray-100 text-gray-400']
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ── Modal criar vaga ──────────────────────────────────────────────────────────
function JobModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', department: '', discCategory: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const job = await api.createJob(form)
      onCreated(job)
      onClose()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nova Vaga</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="label">Título da Vaga *</label>
              <input className="input" value={form.title} onChange={handle('title')} placeholder="Ex: Vendedor Sênior" required />
            </div>
            <div className="mb-3">
              <label className="label">Setor / Departamento</label>
              <input className="input" value={form.department} onChange={handle('department')} placeholder="Ex: Comercial" />
            </div>
            <div className="mb-3">
              <label className="label">Perfil DISC Ideal</label>
              <select className="input" value={form.discCategory} onChange={handle('discCategory')}>
                <option value="">Selecionar perfil</option>
                {DISC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label className="label">Descrição (opcional)</label>
              <textarea className="input" rows={3} value={form.description} onChange={handle('description')} placeholder="Descreva a vaga..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Criando...' : 'Criar Vaga'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Modal adicionar candidato ─────────────────────────────────────────────────
function CandidateModal({ job, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState(null)

  const handle = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.addCandidate(job.id, form)
      const fullLink = `${window.location.origin}${res.testLink}`
      setLink(fullLink)
      onAdded(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const copy = () => { navigator.clipboard.writeText(link); alert('Link copiado!') }
  const whatsapp = () => {
    const text = encodeURIComponent(`Olá, ${form.name}! Você foi convidado(a) para participar do nosso processo seletivo para a vaga de ${job.title}. Acesse o link abaixo para realizar a avaliação comportamental DISC:\n\n${link}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Adicionar Candidato</h2>
          <p className="text-sm text-gray-500 mb-4">Vaga: <strong>{job.title}</strong></p>
          {!link ? (
            <>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="label">Nome *</label>
                  <input className="input" value={form.name} onChange={handle('name')} placeholder="Nome do candidato" required />
                </div>
                <div className="mb-3">
                  <label className="label">Email (opcional)</label>
                  <input type="email" className="input" value={form.email} onChange={handle('email')} placeholder="candidato@email.com" />
                </div>
                <div className="mb-5">
                  <label className="label">Telefone (opcional)</label>
                  <input type="tel" className="input" value={form.phone} onChange={handle('phone')} placeholder="(00) 00000-0000" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Gerando...' : 'Gerar Link'}</button>
                </div>
              </form>
            </>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-green-800 mb-2">Link do teste gerado para {form.name}:</p>
                <div className="bg-white border border-green-200 rounded-lg p-2 text-xs text-gray-700 break-all font-mono">{link}</div>
              </div>
              <div className="flex gap-2 mb-4">
                <button onClick={copy} className="btn-secondary flex-1 text-sm">Copiar link</button>
                <button onClick={whatsapp} className="flex-1 text-sm font-semibold py-2 px-4 rounded-xl text-white" style={{ background: '#25D366' }}>
                  Enviar via WhatsApp
                </button>
              </div>
              <button onClick={onClose} className="btn-primary w-full">Concluir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Painel de candidatos de uma vaga ─────────────────────────────────────────
function JobPanel({ job, onBack, onJobUpdated }) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [hiring, setHiring] = useState(null)

  useEffect(() => {
    api.getJobCandidates(job.id).then(setCandidates).catch(console.error).finally(() => setLoading(false))
  }, [job.id])

  const sorted = [...candidates].sort((a, b) => (b.fitPercentage ?? -1) - (a.fitPercentage ?? -1))

  const hire = async (c) => {
    if (!window.confirm(`Contratar ${c.name}? Isso vai criar o funcionário no painel.`)) return
    setHiring(c.id)
    try {
      await api.hireCandidate(c.id)
      setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, status: 'hired' } : x))
    } catch (err) { alert(err.message) }
    finally { setHiring(null) }
  }

  const toggleStatus = async () => {
    const newStatus = job.status === 'open' ? 'closed' : 'open'
    await api.updateJob(job.id, { status: newStatus })
    onJobUpdated({ ...job, status: newStatus })
  }

  return (
    <div>
      {showModal && <CandidateModal job={job} onClose={() => setShowModal(false)} onAdded={c => setCandidates(prev => [...prev, c])} />}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {job.department && <span className="text-sm text-gray-500">{job.department}</span>}
            {job.discCategory && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{job.discCategory}</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {job.status === 'open' ? 'Aberta' : 'Encerrada'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleStatus} className="btn-secondary text-sm">
            {job.status === 'open' ? 'Encerrar vaga' : 'Reabrir vaga'}
          </button>
          {job.status === 'open' && (
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Candidato</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">Carregando...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <p className="font-medium">Nenhum candidato ainda</p>
          <p className="text-sm mt-1">Adicione candidatos e compartilhe o link do teste</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((c, i) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: c.dominantType ? DISC_COLORS[c.dominantType] : '#D1D5DB' }}>
                {c.dominantType || (i + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                <div className="text-xs text-gray-400">{c.email || 'Sem email'}</div>
              </div>
              <DISCMini pcts={c.discPercentages} />
              <FitBadge pct={c.fitPercentage} />
              <StatusBadge status={c.status} />
              {c.status === 'tested' && (
                <button onClick={() => hire(c)} disabled={hiring === c.id}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {hiring === c.id ? '...' : 'Contratar'}
                </button>
              )}
              {c.status === 'hired' && (
                <span className="text-xs text-green-600 font-medium">Funcionário</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Banco de Talentos ─────────────────────────────────────────────────────────
function TalentBank() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTalentBank().then(setCandidates).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-12 text-gray-400">Carregando...</div>
  if (candidates.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
      <p className="font-medium">Banco de talentos vazio</p>
      <p className="text-sm mt-1">Candidatos que realizarem o teste aparecerão aqui</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {candidates.sort((a,b) => (b.fitPercentage ?? -1) - (a.fitPercentage ?? -1)).map(c => (
        <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: c.dominantType ? DISC_COLORS[c.dominantType] : '#D1D5DB' }}>
            {c.dominantType || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{c.name}</div>
            <div className="text-xs text-gray-400">{c.email || 'Sem email'} {c.phone ? `• ${c.phone}` : ''}</div>
          </div>
          <DISCMini pcts={c.discPercentages} />
          <FitBadge pct={c.fitPercentage} />
          <StatusBadge status={c.status} />
        </div>
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function SelecaoPage() {
  const [tab, setTab] = useState('vagas') // 'vagas' | 'banco'
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)

  useEffect(() => {
    api.getJobs().then(setJobs).catch(console.error).finally(() => setLoadingJobs(false))
  }, [])

  const deleteJob = async (job) => {
    if (!window.confirm(`Excluir a vaga "${job.title}"? Todos os candidatos serão removidos.`)) return
    await api.deleteJob(job.id)
    setJobs(prev => prev.filter(j => j.id !== job.id))
    if (selectedJob?.id === job.id) setSelectedJob(null)
  }

  if (selectedJob) {
    return (
      <JobPanel
        job={selectedJob}
        onBack={() => setSelectedJob(null)}
        onJobUpdated={(updated) => {
          setSelectedJob(updated)
          setJobs(prev => prev.map(j => j.id === updated.id ? updated : j))
        }}
      />
    )
  }

  return (
    <div>
      {showJobModal && <JobModal onClose={() => setShowJobModal(false)} onCreated={job => setJobs(prev => [...prev, job])} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seleção</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie vagas e candidatos com análise DISC</p>
        </div>
        {tab === 'vagas' && (
          <button onClick={() => setShowJobModal(true)} className="btn-primary">+ Nova Vaga</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[['vagas','Vagas'],['banco','Banco de Talentos']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'banco' ? <TalentBank /> : (
        loadingJobs ? (
          <div className="flex items-center justify-center py-12 text-gray-400">Carregando...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="font-semibold text-gray-700 text-lg">Nenhuma vaga criada</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Crie uma vaga para começar a selecionar candidatos</p>
            <button onClick={() => setShowJobModal(true)} className="btn-primary">+ Criar primeira vaga</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5"
                onClick={() => setSelectedJob(job)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
                    {job.department && <p className="text-sm text-gray-500 truncate">{job.department}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.status === 'open' ? 'Aberta' : 'Encerrada'}
                  </span>
                </div>
                {job.discCategory && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    Perfil: {job.discCategory}
                  </span>
                )}
                {job.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteJob(job) }}
                    className="text-gray-300 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
