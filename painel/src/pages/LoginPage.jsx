import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AppAuthProvider'
import { api } from '../api/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(email, password)
      login(res.token, res.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧭</div>
          <h1 className="text-3xl font-bold text-white">MapDISC</h1>
          <p className="text-white/80 mt-1">Perfil Comportamental DISC</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="mb-6">
              <label className="label">Senha</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Não tem conta? <Link to="/register" className="text-primary font-medium hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}