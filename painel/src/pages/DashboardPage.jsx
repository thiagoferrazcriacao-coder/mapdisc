import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_NAMES = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Consciencioso' }

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, empData] = await Promise.all([api.getDashboardStats(), api.getEmployees()])
      setStats(statsData)
      setEmployees(empData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>

  const discData = stats?.discDistribution
    ? Object.entries(stats.discDistribution).map(([key, value]) => ({ name: key, fullName: DISC_NAMES[key], value, fill: DISC_COLORS[key] }))
    : [{ name: 'D', fullName: 'Dominante', value: 25, fill: DISC_COLORS.D }, { name: 'I', fullName: 'Influente', value: 25, fill: DISC_COLORS.I }, { name: 'S', fullName: 'Estável', value: 25, fill: DISC_COLORS.S }, { name: 'C', fullName: 'Consciencioso', value: 25, fill: DISC_COLORS.C }]

  const completedEmployees = employees.filter(e => e.discResult)
  const lowFitEmployees = completedEmployees.filter(e => e.discResult?.analysis?.currentFunctionFit != null && e.discResult.analysis.currentFunctionFit < 60)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500">Total Funcionários</div>
          <div className="text-3xl font-bold text-primary mt-1">{stats?.totalEmployees || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Testes Completados</div>
          <div className="text-3xl font-bold text-success mt-1">{stats?.completedTests || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Adequação Média</div>
          <div className="text-3xl font-bold mt-1" style={{ color: (stats?.avgFit || 0) >= 70 ? '#10B981' : (stats?.avgFit || 0) >= 50 ? '#F59E0B' : '#EF4444' }}>{stats?.avgFit || 0}%</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Convites Pendentes</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pendingInvitations || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição DISC da Equipe</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value + '%', name]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {discData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Resultados</h2>
          {completedEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p>Nenhum resultado ainda</p>
              <p className="text-sm mt-1">Envie convites para seus funcionários</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedEmployees.slice(0, 5).map(emp => (
                <Link to={`/employees/${emp.id}`} key={emp.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{ background: DISC_COLORS[emp.discResult?.dominantType] + '20', border: `2px solid ${DISC_COLORS[emp.discResult?.dominantType]}` }}>
                      {emp.profilePhoto
                        ? <img src={emp.profilePhoto} alt={emp.name} className="w-full h-full object-cover" />
                        : <span className="text-sm font-bold" style={{ color: DISC_COLORS[emp.discResult?.dominantType] }}>{emp.discResult?.dominantType}</span>}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.jobTitle || emp.functionCategories?.[0] || '—'}</div>
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: DISC_COLORS[emp.discResult?.dominantType] + '20', color: DISC_COLORS[emp.discResult?.dominantType] }}>
                    {emp.discResult?.dominantType} — {emp.discResult?.percentages?.[emp.discResult.dominantType] || 0}%
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {lowFitEmployees.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-800 mb-3">⚠ Atenção — Baixa Adequação</h2>
          <div className="space-y-2">
            {lowFitEmployees.map(emp => (
              <Link to={`/employees/${emp.id}`} key={emp.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-red-100 transition-colors">
                <span className="text-sm font-medium text-red-900">{emp.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">{emp.discResult?.analysis?.currentFunctionName || '—'}</span>
                  <span className="badge bg-red-100 text-red-800">{emp.discResult?.analysis?.currentFunctionFit || 0}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}