import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { v4 as uuidv4 } from 'uuid'

const DISC_PROFILES = [
  { value: 'Vendas',        label: 'Vendas / Comercial' },
  { value: 'Liderança',     label: 'Liderança / Gestão' },
  { value: 'Atendimento',   label: 'Atendimento / Suporte' },
  { value: 'Financeiro',    label: 'Financeiro / Contabilidade' },
  { value: 'Marketing',     label: 'Marketing / Comunicação' },
  { value: 'Operações',     label: 'Operações / Logística' },
  { value: 'RH',            label: 'RH / Pessoas' },
  { value: 'TI',            label: 'TI / Tecnologia' },
  { value: 'Produção',      label: 'Produção / Manufatura' },
  { value: 'Administração', label: 'Administração / Backoffice' },
  { value: 'Ensino',        label: 'Ensino / Treinamento' },
  { value: 'Criativo',      label: 'Criativo / Design' },
]

const DISC_COLORS = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_LABELS = {
  'Vendas': 'D+I', 'Liderança': 'D', 'Atendimento': 'S+I', 'Financeiro': 'C',
  'Marketing': 'I', 'Operações': 'S+C', 'RH': 'S+I', 'TI': 'C',
  'Produção': 'S+C', 'Administração': 'C+S', 'Ensino': 'I+S', 'Criativo': 'I+C'
}

function FunctionForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [discCategory, setDiscCategory] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !discCategory) return
    onAdd({ id: uuidv4(), name: name.trim(), discCategory })
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <input
        className="input flex-1"
        placeholder="Nome da função (ex: Gerente de Vendas)"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <select className="input w-full sm:w-56" value={discCategory} onChange={e => setDiscCategory(e.target.value)}>
        <option value="">Perfil DISC ideal...</option>
        {DISC_PROFILES.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary px-4">Adicionar</button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4">Cancelar</button>
      </div>
    </form>
  )
}

export default function CompanyFunctionsPage() {
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSectorName, setNewSectorName] = useState('')
  const [addingSector, setAddingSector] = useState(false)
  const [addingFunctionFor, setAddingFunctionFor] = useState(null) // sectorId

  useEffect(() => { loadFunctions() }, [])

  const loadFunctions = async () => {
    try {
      const data = await api.getCompanyFunctions()
      setSectors(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const save = async (newSectors) => {
    setSaving(true)
    try {
      await api.saveCompanyFunctions(newSectors)
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const addSector = () => {
    if (!newSectorName.trim()) return
    const updated = [...sectors, { id: uuidv4(), name: newSectorName.trim(), functions: [] }]
    setSectors(updated)
    save(updated)
    setNewSectorName('')
    setAddingSector(false)
  }

  const deleteSector = (sectorId) => {
    if (!window.confirm('Remover este setor e todas as suas funções?')) return
    const updated = sectors.filter(s => s.id !== sectorId)
    setSectors(updated)
    save(updated)
  }

  const addFunction = (sectorId, fn) => {
    const updated = sectors.map(s =>
      s.id === sectorId ? { ...s, functions: [...(s.functions || []), fn] } : s
    )
    setSectors(updated)
    save(updated)
    setAddingFunctionFor(null)
  }

  const deleteFunction = (sectorId, fnId) => {
    const updated = sectors.map(s =>
      s.id === sectorId ? { ...s, functions: (s.functions || []).filter(f => f.id !== fnId) } : s
    )
    setSectors(updated)
    save(updated)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funções e Setores</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre os setores e funções da sua empresa para cruzar com os perfis DISC dos funcionários</p>
        </div>
        <button onClick={() => setAddingSector(true)} className="btn-primary text-sm">+ Novo Setor</button>
      </div>

      {addingSector && (
        <div className="card mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            className="input flex-1"
            placeholder="Nome do setor (ex: Comercial, Operações, Financeiro...)"
            value={newSectorName}
            onChange={e => setNewSectorName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSector()}
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={addSector} className="btn-primary">Criar Setor</button>
            <button onClick={() => { setAddingSector(false); setNewSectorName('') }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {sectors.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-gray-500 font-medium">Nenhum setor cadastrado ainda</p>
          <p className="text-sm text-gray-400 mt-2 mb-4">Crie setores e adicione as funções da sua empresa para ativar o sistema de realocação DISC</p>
          <button onClick={() => setAddingSector(true)} className="btn-primary mx-auto">+ Criar primeiro setor</button>
        </div>
      ) : (
        <div className="space-y-4">
          {sectors.map(sector => (
            <div key={sector.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-primary">🏢</span> {sector.name}
                  <span className="text-xs font-normal text-gray-400 ml-1">({(sector.functions || []).length} {(sector.functions || []).length === 1 ? 'função' : 'funções'})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddingFunctionFor(addingFunctionFor === sector.id ? null : sector.id)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    + Função
                  </button>
                  <button
                    onClick={() => deleteSector(sector.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover setor"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {addingFunctionFor === sector.id && (
                <FunctionForm
                  onAdd={(fn) => addFunction(sector.id, fn)}
                  onCancel={() => setAddingFunctionFor(null)}
                />
              )}

              {(sector.functions || []).length === 0 && addingFunctionFor !== sector.id ? (
                <p className="text-sm text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">
                  Nenhuma função cadastrada neste setor —{' '}
                  <button onClick={() => setAddingFunctionFor(sector.id)} className="text-primary font-medium hover:underline">adicionar função</button>
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {(sector.functions || []).map(fn => (
                    <div key={fn.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: '#7C3AED' }}>
                          {fn.discCategory?.[0] || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fn.name}</div>
                          <div className="text-xs text-gray-500">
                            Perfil ideal: <span className="font-medium text-gray-700">{DISC_PROFILES.find(p => p.value === fn.discCategory)?.label || fn.discCategory}</span>
                            {DISC_LABELS[fn.discCategory] && <span className="ml-2 font-bold text-purple-600">({DISC_LABELS[fn.discCategory]})</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFunction(sector.id, fn.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover função"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Salvando...
        </div>
      )}
    </div>
  )
}
