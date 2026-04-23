import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_NAMES = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Consciencioso' }

function SectionCard({ title, icon, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {icon && <span>{icon}</span>} {title}
      </h2>
      {children}
    </div>
  )
}

function Tag({ color, children }) {
  const styles = {
    D: 'bg-red-100 text-red-800 border-red-200',
    I: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    S: 'bg-green-100 text-green-800 border-green-200',
    C: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return <span className={`badge border ${styles[color] || 'bg-gray-100 text-gray-800'}`}>{children}</span>
}

function FitBadge({ pct }) {
  if (pct >= 75) return <span className="badge bg-green-100 text-green-800">Boa adequação</span>
  if (pct >= 50) return <span className="badge bg-yellow-100 text-yellow-800">Moderada</span>
  return <span className="badge bg-red-100 text-red-800">Baixa</span>
}

function BulletList({ items, icon = '•', textColor = 'text-gray-700' }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className={`text-sm ${textColor} flex gap-2`}>
          <span className="flex-shrink-0">{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

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
  const profile = analysis?.profileDetails

  const radarData = Object.entries(pcts).map(([key, value]) => ({
    subject: `${key} — ${DISC_NAMES[key]}`,
    value,
    fullMark: 100
  }))

  const fitColor = (pct) => pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  const fitBg = (pct) => pct >= 75 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <div>
      <Link to="/employees" className="text-sm text-primary font-medium hover:underline mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para Funcionários
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6 mt-2">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: result ? (DISC_COLORS[result.dominantType] + '15') : '#EEF4FF', border: result ? `4px solid ${DISC_COLORS[result.dominantType]}` : '4px solid #0057FF' }}>
            {employee.profilePhoto
              ? <img src={employee.profilePhoto} alt={employee.name} className="w-full h-full object-cover" />
              : result
                ? <span className="text-4xl font-extrabold" style={{ color: DISC_COLORS[result.dominantType] }}>{result.dominantType}</span>
                : <img src="/logo.png" alt="MapDISC" className="w-20 h-20" />}
          </div>
          {result && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-sm font-bold shadow"
              style={{ backgroundColor: DISC_COLORS[result.dominantType] }}>
              {result.dominantType} — {DISC_NAMES[result.dominantType]}
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-0">
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
            <SectionCard title="Perfil DISC" icon="🎯">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Perfil" dataKey="value" stroke="#0057FF" fill="#0057FF" fillOpacity={0.3} />
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
              {profile?.secondaryInfluence && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">INFLUÊNCIA DO PERFIL SECUNDÁRIO</p>
                  <p className="text-sm text-gray-600">{profile.secondaryInfluence}</p>
                </div>
              )}
            </SectionCard>

            <div className="space-y-4">
              {analysis && (
                <SectionCard title="Adequação na Função Atual" icon="📊" className={`border ${fitBg(analysis.currentFunctionFit)}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl font-bold" style={{ color: fitColor(analysis.currentFunctionFit) }}>
                      {analysis.currentFunctionFit}%
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">{analysis.currentFunctionName}</div>
                      <FitBadge pct={analysis.currentFunctionFit} />
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: analysis.currentFunctionFit + '%', backgroundColor: fitColor(analysis.currentFunctionFit) }}></div>
                  </div>
                </SectionCard>
              )}

              {analysis?.improvementTips && (
                <SectionCard title="💡 Dicas de Melhoria" icon="">
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.improvementTips}</p>
                </SectionCard>
              )}
            </div>
          </div>

          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <SectionCard title="✅ Pontos Fortes" icon="">
                <BulletList items={profile.strengths} icon="✓" textColor="text-green-700" />
              </SectionCard>

              <SectionCard title="⚠️ Pontos de Atenção" icon="">
                <BulletList items={profile.attentionPoints} icon="⚠" textColor="text-yellow-700" />
              </SectionCard>

              <SectionCard title="🚫 Pontos Negativos" icon="">
                <BulletList items={profile.weaknesses} icon="✗" textColor="text-red-700" />
              </SectionCard>

              <SectionCard title="🛡️ Como Lidar com os Negativos" icon="">
                <BulletList items={profile.howToDodgeNegatives} icon="→" textColor="text-primary" />
              </SectionCard>

              <SectionCard title="👥 Como Gerenciar Este Perfil" icon="">
                <BulletList items={profile.howToManage} icon="▸" textColor="text-gray-700" />
              </SectionCard>

              <SectionCard title="🎯 Fatores-Chave" icon="">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">AMBIENTE IDEAL</div>
                    <p className="text-sm text-gray-700">{profile.idealEnvironment}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">GATILHOS DE ESTRESSE</div>
                    <p className="text-sm text-gray-700">{profile.stressTriggers}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">O QUE MOTIVA</div>
                    <p className="text-sm text-gray-700">{profile.motivationKeys}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">ESTILO DE COMUNICAÇÃO</div>
                    <p className="text-sm text-gray-700">{profile.communicationStyle}</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <SectionCard title="🏆 Top 3 Funções Recomendadas" icon="">
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
            </SectionCard>
          )}

          {employee.jobDescription && (
            <SectionCard title="📝 Descrição das Atividades" icon="">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{employee.jobDescription}</p>
              {employee.dailyTasks && employee.dailyTasks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {employee.dailyTasks.map((task, i) => (
                    <span key={i} className="badge bg-gray-100 text-gray-700">{task}</span>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>
      )}
    </div>
  )
}