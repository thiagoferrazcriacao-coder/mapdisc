import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employeeName: '', employeeEmail: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { loadInvitations() }, [])

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations()
      setInvitations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.employeeName.trim()) return setError('Nome é obrigatório')
    if (form.employeeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employeeEmail)) return setError('Email inválido')
    setCreating(true)
    setError('')
    try {
      await api.createInvitation({ ...form, employeeName: form.employeeName.trim() })
      setShowModal(false)
      setForm({ employeeName: '', employeeEmail: '' })
      await loadInvitations()
    } catch (err) {
      setError(err.message || 'Erro ao criar convite. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja remover este convite? Esta ação não pode ser desfeita.')) return
    try {
      await api.deleteInvitation(id)
      setInvitations(prev => prev.filter(i => (i.id || i._id) !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleResend = async (inv) => {
    try {
      const newInv = await api.createInvitation({ employeeName: inv.employeeName, employeeEmail: inv.employeeEmail })
      await loadInvitations()
      // auto-copy the new link
      const link = `${window.location.origin}/teste?token=${newInv.token}`
      navigator.clipboard.writeText(link).catch(() => {})
      setCopiedId('resent_' + newInv.token)
      setTimeout(() => setCopiedId(null), 3000)
    } catch (err) {
      alert('Erro ao reenviar: ' + err.message)
    }
  }

  const copyLink = (token) => {
    const link = `${window.location.origin}/teste?token=${token}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(token)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const getStatus = (inv) => {
    if (inv.used) return { label: 'Completado', bg: 'bg-green-100', text: 'text-green-800' }
    if (new Date(inv.expiresAt) < new Date()) return { label: 'Expirado', bg: 'bg-red-100', text: 'text-red-800' }
    return { label: 'Pendente', bg: 'bg-yellow-100', text: 'text-yellow-800' }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Convites</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Novo Convite</button>
      </div>

      {invitations.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <p className="text-gray-500">Nenhum convite criado ainda</p>
          <p className="text-sm text-gray-400 mt-1">Crie convites para que seus funcionários possam fazer o teste DISC</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map(inv => {
            const status = getStatus(inv)
            return (
              <div key={inv.id || inv._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{inv.employeeName}</div>
                  <div className="text-sm text-gray-500">{inv.employeeEmail || 'Sem email'}</div>
                  <div className="text-xs text-gray-400 mt-1">Criado em {formatDate(inv.createdAt)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${status.bg} ${status.text}`}>{status.label}</span>

                  {/* Copiar link — só para pendentes */}
                  {!inv.used && new Date(inv.expiresAt) > new Date() && (
                    <button onClick={() => copyLink(inv.token)} className="btn-secondary text-xs py-1.5 px-3">
                      {copiedId === inv.token ? '✓ Copiado!' : '📋 Copiar Link'}
                    </button>
                  )}

                  {/* Reenviar — disponível em todos os convites */}
                  <button
                    onClick={() => handleResend(inv)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    title="Criar novo link para o funcionário repetir o teste"
                  >
                    {copiedId === 'resent_' + inv.token ? '✓ Link copiado!' : '↩ Reenviar'}
                  </button>

                  {/* Deletar — sempre visível */}
                  <button
                    onClick={() => handleDelete(inv.id || inv._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover convite"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Convite</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleCreate} noValidate>
              <div className="mb-4">
                <label className="label">Nome do Funcionário *</label>
                <input type="text" className="input" value={form.employeeName} onChange={e => setForm(prev => ({ ...prev, employeeName: e.target.value }))} placeholder="Nome completo" />
              </div>
              <div className="mb-6">
                <label className="label">Email do Funcionário</label>
                <input type="text" className="input" value={form.employeeEmail} onChange={e => setForm(prev => ({ ...prev, employeeEmail: e.target.value }))} placeholder="email@empresa.com" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}