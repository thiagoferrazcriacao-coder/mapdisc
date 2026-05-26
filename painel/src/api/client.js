const BASE = '/api'

function getToken() {
  return localStorage.getItem('mapdisc_token')
}

function normalizeId(data) {
  if (Array.isArray(data)) return data.map(normalizeId)
  if (data && typeof data === 'object' && '_id' in data) return { ...data, id: data._id }
  return data
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    // Rotas de autenticação: apenas lança o erro (não redireciona)
    if (path.startsWith('/auth/')) {
      throw new Error(data.error || 'Credenciais inválidas')
    }
    // Rotas protegidas: desloga e redireciona para login
    localStorage.removeItem('mapdisc_token')
    localStorage.removeItem('mapdisc_user')
    window.location.href = '/login'
    return
  }

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return normalizeId(data)
}

export const api = {
  register: (data) => request('POST', '/auth/register', data),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  verifyEmail: (email, code) => request('POST', '/auth/verify-email', { email, code }),
  resendCode: (email) => request('POST', '/auth/resend-code', { email }),
  me: () => request('GET', '/auth/me'),
  updateMe: (data) => request('PATCH', '/auth/me', data),
  changePassword: (data) => request('PATCH', '/auth/password', data),
  getEmployees: () => request('GET', '/employees'),
  getEmployee: (id) => request('GET', `/employees/${id}`),
  createEmployee: (data) => request('POST', '/employees', data),
  updateEmployee: (id, data) => request('PATCH', `/employees/${id}`, data),
  deleteEmployee: (id) => request('DELETE', `/employees/${id}`),
  getInvitations: () => request('GET', '/invitations'),
  createInvitation: (data) => request('POST', '/invitations', data),
  deleteInvitation: (id) => request('DELETE', `/invitations/${id}`),
  getDashboardStats: () => request('GET', '/dashboard/stats'),
  getCompanyFunctions: () => request('GET', '/company/functions'),
  saveCompanyFunctions: (sectors) => request('PUT', '/company/functions', { sectors }),
  getJobs: () => request('GET', '/jobs'),
  createJob: (data) => request('POST', '/jobs', data),
  updateJob: (id, data) => request('PATCH', `/jobs/${id}`, data),
  deleteJob: (id) => request('DELETE', `/jobs/${id}`),
  getJobCandidates: (jobId) => request('GET', `/jobs/${jobId}/candidates`),
  addCandidate: (jobId, data) => request('POST', `/jobs/${jobId}/candidates`, data),
  hireCandidate: (id) => request('PATCH', `/candidates/${id}/hire`),
  getTalentBank: () => request('GET', '/talent-bank'),
}