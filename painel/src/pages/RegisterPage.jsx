import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AppAuthProvider'
import { api } from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', industry: '', teamSize: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('As senhas não coincidem')
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres')
    setLoading(true)
    try {
      const res = await api.register({ name: form.name, email: form.email, phone: form.phone, password: form.password, industry: form.industry, teamSize: form.teamSize })
      login(res.token, res.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧭</div>
          <h1 className="text-3xl font-bold text-white">MapDISC</h1>
          <p className="text-white/80 mt-1">Criar sua conta</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="label">Nome da Empresa *</label>
              <input type="text" className="input" value={form.name} onChange={handleChange('name')} placeholder="Nome da empresa" required />
            </div>
            <div className="mb-3">
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={handleChange('email')} placeholder="seu@email.com" required />
            </div>
            <div className="mb-3">
              <label className="label">Telefone</label>
              <input type="tel" className="input" value={form.phone} onChange={handleChange('phone')} placeholder="(00) 00000-0000" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">Setor</label>
                <select className="input" value={form.industry} onChange={handleChange('industry')}>
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
                <select className="input" value={form.teamSize} onChange={handleChange('teamSize')}>
                  <option value="">Selecione</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="label">Senha *</label>
              <input type="password" className="input" value={form.password} onChange={handleChange('password')} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="mb-5">
              <label className="label">Confirmar Senha *</label>
              <input type="password" className="input" value={form.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Repita a senha" required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}