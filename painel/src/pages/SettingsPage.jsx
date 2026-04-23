import { useState, useEffect } from 'react'
import { useAuth } from '../AppAuthProvider'
import { api } from '../api/client'

export default function SettingsPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', industry: '', teamSize: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [message, setMessage] = useState('')
  const [pwMessage, setPwMessage] = useState('')
  const [error, setError] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        industry: user.industry || '',
        teamSize: user.teamSize || ''
      })
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.updateMe(form)
      setMessage('Dados atualizados com sucesso')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwMessage('')
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('As senhas não coincidem')
    if (pwForm.newPassword.length < 6) return setPwError('A nova senha deve ter pelo menos 6 caracteres')
    setSavingPw(true)
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwMessage('Senha alterada com sucesso')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h2>
          {message && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="label">Nome da Empresa</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} disabled />
            </div>
            <div className="mb-3">
              <label className="label">Telefone</label>
              <input type="tel" className="input" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Setor</label>
                <select className="input" value={form.industry} onChange={e => setForm(prev => ({ ...prev, industry: e.target.value }))}>
                  <option value="">Selecione</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="comercio">Comércio</option>
                  <option value="industria">Indústria</option>
                  <option value="servicos">Serviços</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="label">Tamanho da equipe</label>
                <select className="input" value={form.teamSize} onChange={e => setForm(prev => ({ ...prev, teamSize: e.target.value }))}>
                  <option value="">Selecione</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
          {pwMessage && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{pwMessage}</div>}
          {pwError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{pwError}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label className="label">Senha Atual</label>
              <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))} required />
            </div>
            <div className="mb-3">
              <label className="label">Nova Senha</label>
              <input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="mb-4">
              <label className="label">Confirmar Nova Senha</label>
              <input type="password" className="input" value={pwForm.confirmPassword} onChange={e => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary" disabled={savingPw}>
              {savingPw ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}