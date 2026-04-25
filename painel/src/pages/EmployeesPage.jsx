import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterDisc, setFilterDisc] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', jobTitle: '', email: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [createdLink, setCreatedLink] = useState(null) // link após criar
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadEmployees() }, [])

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees()
      setEmployees(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setForm({ name: '', jobTitle: '', email: '' })
    setError('')
    setCreatedLink(null)
    setCopied(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCreatedLink(null)
    setCopied(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Nome é obrigatório')
    if (!form.jobTitle.trim()) return setError('Função é obrigatória')
    setCreating(true)
    setError('')
    try {
      // 1. Cria o funcionário
      const emp = await api.createEmployee({
        name: form.name.trim(),
        jobTitle: form.jobTitle.trim(),
        email: form.email.trim() || '',
        functionCategories: [form.jobTitle.trim()]
      })
      // 2. Cria o convite vinculado ao funcionário
      const inv = await api.createInvitation({
        employeeName: form.name.trim(),
        employeeEmail: form.email.trim() || '',
        employeeId: emp.id || emp._id
      })
      const link = `${window.location.origin}/teste?token=${inv.token}`
      setCreatedLink(link)
      // Copia automaticamente
      navigator.clipboard.writeText(link).catch(() => {})
      setCopied(true)
      // Adiciona funcionário na lista imediatamente
      setEmployees(prev => [{ ...emp, discResult: null }, ...prev])
    } catch (err) {
      setError(err.message || 'Erro ao criar funcionário')
    } finally {
      setCreating(false)
    }
  }

  const filtered = employees.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterDept && e.department !== filterDept) return false
    if (filterDisc && e.discResult?.dominantType !== filterDisc) return false
    return true
  })

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
        <button onClick={openModal} className="btn-primary text-sm">+ Novo Funcionário</button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" className="input flex-1" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input w-full sm:w-48" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">Todos os departamentos</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input w-full sm:w-40" value={filterDisc} onChange={e => setFilterDisc(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="D">D — Dominante</option>
            <option value="I">I — Influente</option>
            <option value="S">S — Estável</option>
            <option value="C">C — Consciencioso</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <p className="text-gray-500">Nenhum funcionário encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(emp => (
            <Link to={`/employees/${emp.id}`} key={emp.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: emp.discResult ? (DISC_COLORS[emp.discResult.dominantType] + '20') : '#F5F0FF', border: emp.discResult ? `2px solid ${DISC_COLORS[emp.discResult.dominantType]}` : '2px solid #7C3AED' }}>
                  {emp.profilePhoto
                    ? <img src={emp.profilePhoto} alt={emp.name} className="w-full h-full object-cover" />
                    : emp.discResult
                      ? <span className="text-lg font-bold" style={{ color: DISC_COLORS[emp.discResult.dominantType] }}>{emp.discResult.dominantType}</span>
                      : <img src="/logo.png" alt="" className="w-8 h-8" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{emp.name}</div>
                  <div className="text-sm text-gray-500">{emp.jobTitle || emp.functionCategories?.[0] || emp.department || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {emp.discResult ? (
                  <>
                    <span className="badge" style={{ backgroundColor: DISC_COLORS[emp.discResult.dominantType] + '20', color: DISC_COLORS[emp.discResult.dominantType] }}>
                      {emp.discResult.dominantType} — {emp.discResult.percentages?.[emp.discResult.dominantType] || 0}%
                    </span>
                    {emp.discResult.analysis?.currentFunctionFit != null && (
                      <span className={`badge ${emp.discResult.analysis.currentFunctionFit >= 70 ? 'bg-green-100 text-green-800' : emp.discResult.analysis.currentFunctionFit >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.discResult.analysis.currentFunctionFit}% adequação
                      </span>
                    )}
                  </>
                ) : (
                  <span className="badge bg-gray-100 text-gray-600">Pendente</span>
                )}
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!window.confirm(`Deseja remover ${emp.name}? Esta ação não pode ser desfeita.`)) return
                    try {
                      await api.deleteEmployee(emp.id)
                      setEmployees(prev => prev.filter(x => x.id !== emp.id))
                    } catch (err) { alert('Erro ao remover funcionário') }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Remover funcionário"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Novo Funcionário */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>

            {!createdLink ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Novo Funcionário</h2>
                <p className="text-sm text-gray-500 mb-4">Preencha os dados e um link de teste DISC será gerado automaticamente</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
                <form onSubmit={handleCreate} noValidate>
                  <div className="mb-4">
                    <label className="label">Nome do Funcionário *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label className="label">Função / Cargo *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Vendedor, Analista, Gerente..."
                      value={form.jobTitle}
                      onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="label">Email <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input
                      type="text"
                      className="input"
                      placeholder="email@empresa.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn-primary flex-1" disabled={creating}>
                      {creating ? 'Criando...' : 'Criar e Gerar Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Funcionário criado!</h2>
                  <p className="text-sm text-gray-500 mt-1">Envie o link abaixo para <strong>{form.name}</strong> fazer o teste DISC</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Link do teste:</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{createdLink}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdLink).catch(() => {})
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="btn-primary w-full mb-3"
                >
                  {copied ? '✓ Link copiado!' : '📋 Copiar Link'}
                </button>
                <button onClick={closeModal} className="btn-secondary w-full">Fechar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
