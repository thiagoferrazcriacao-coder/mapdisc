import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../AppAuthProvider'
import { api } from '../api/client'

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const inputs = useRef([])

  useEffect(() => {
    if (!email) navigate('/register')
    inputs.current[0]?.focus()
  }, [email, navigate])

  const handleChange = (i, val) => {
    const cleaned = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = cleaned
    setCode(next)
    if (cleaned && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) return setError('Digite os 6 dígitos do código')
    setError('')
    setLoading(true)
    try {
      const res = await api.verifyEmail(email, fullCode)
      login(res.token, res.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Código inválido ou expirado')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setSuccess('')
    try {
      await api.resendCode(email)
      setSuccess('Novo código enviado! Verifique seu email.')
    } catch (err) {
      setError(err.message || 'Erro ao reenviar código')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="MapDISC" className="w-40 h-40 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Confirme seu email</h1>
          <p className="text-white/80 mt-2 text-sm">
            Enviamos um código de 6 dígitos para<br />
            <strong className="text-white">{email}</strong>
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Confirmar email'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-gray-500">Não recebeu o código?</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-medium text-sm hover:underline mt-1 disabled:opacity-50"
            >
              {resending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary font-medium hover:underline">Voltar ao login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
