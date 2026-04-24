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
        <Link to="/invitations" className="btn-primary text-sm">+ Novo Convite</Link>
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
    </div>
  )
}