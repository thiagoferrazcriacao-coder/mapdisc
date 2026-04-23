import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_NAMES = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Consciencioso' }

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEmployee() }, [id])

  const loadEmployee = async () => {
    try {
      const data = await api.getEmployee(id)
      setEmployee(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>
  if (!employee) return <div className="text-center py-12 text-gray-500">Funcionário não encontrado</div>

  const result = employee.discResult
  const pcts = result?.percentages || { D: 0, I: 0, S: 0, C: 0 }
  const analysis = result?.analysis

  const radarData = Object.entries(pcts).map(([key, value]) => ({
    subject: key,
    value,
    fullMark: 100
  }))

  const recommendationData = analysis?.recommendations?.map(r => ({
    name: r.functionName,
    adequacao: r.fitPercentage,
    fill: r.fitPercentage >= 70 ? '#10B981' : r.fitPercentage >= 50 ? '#F59E0B' : '#EF4444'
  })) || []

  const fitColor = (pct) => pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  const fitBg = (pct) => pct >= 75 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const fitLabel = (pct) => pct >= 75 ? 'Boa adequação' : pct >= 50 ? 'Adequação moderada' : 'Baixa adequação'

  return (
    <div>
      <Link to="/employees" className="text-sm text-primary font-medium hover:underline mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para Funcionários
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 mt-2">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-2xl font-bold text-primary">
          {result ? result.dominantType : '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
          <p className="text-gray-500">{employee.jobTitle || employee.functionCategories?.join(', ') || '—'}</p>
          <p className="text-sm text-gray-400">{employee.email} {employee.department ? `· ${employee.department}` : ''}</p>
        </div>
      </div>

      {!result ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p className="text-gray-500">Aguardando resultado do teste DISC</p>
          <p className="text-sm text-gray-400 mt-1">Envie um convite para este funcionário</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil DISC</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Radar name="Perfil" dataKey="value" stroke="#6C3AED" fill="#6C3AED" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {Object.entries(pcts).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: DISC_COLORS[key] }}>{value}%</div>
                    <div className="text-xs text-gray-500">{key} — {DISC_NAMES[key]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary-50 text-center">
                <span className="text-sm text-gray-600">Tipo dominante:</span>
                <span className="ml-2 font-bold text-primary text-lg">{result.dominantType} — {DISC_NAMES[result.dominantType]}</span>
                {result.secondaryType && (
                  <span className="ml-3 text-sm text-gray-500">| Secundário: <span className="font-semibold">{result.secondaryType} — {DISC_NAMES[result.secondaryType]}</span></span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {analysis && (
                <div className={`card border ${fitBg(analysis.currentFunctionFit)}`}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Adequação na Função Atual</h2>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-4xl font-bold" style={{ color: fitColor(analysis.currentFunctionFit) }}>
                      {analysis.currentFunctionFit}%
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">{analysis.currentFunctionName}</div>
                      <div className="text-sm text-gray-500">{fitLabel(analysis.currentFunctionFit)}</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: analysis.currentFunctionFit + '%', backgroundColor: fitColor(analysis.currentFunctionFit) }}></div>
                  </div>
                  {analysis.strengthsInCurrentRole && (
                    <div className="mt-3 text-sm"><span className="font-medium text-green-700">Pontos fortes:</span> {analysis.strengthsInCurrentRole}</div>
                  )}
                  {analysis.challengesInCurrentRole && (
                    <div className="mt-1 text-sm"><span className="font-medium text-red-700">Desafios:</span> {analysis.challengesInCurrentRole}</div>
                  )}
                </div>
              )}

              {analysis?.improvementTips && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Dicas de Melhoria</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.improvementTips}</p>
                </div>
              )}
            </div>
          </div>

          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 3 Funções Recomendadas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{i + 1}. {rec.functionName}</span>
                      <span className="text-2xl font-bold" style={{ color: fitColor(rec.fitPercentage) }}>{rec.fitPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full" style={{ width: rec.fitPercentage + '%', backgroundColor: fitColor(rec.fitPercentage) }}></div>
                    </div>
                    <p className="text-xs text-gray-500">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {employee.jobDescription && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição das Atividades</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{employee.jobDescription}</p>
              {employee.dailyTasks && employee.dailyTasks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {employee.dailyTasks.map((task, i) => (
                    <span key={i} className="badge bg-gray-100 text-gray-700">{task}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}