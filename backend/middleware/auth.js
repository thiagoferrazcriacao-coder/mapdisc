import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'mapdisc-secret-change-me'

export function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.companyId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}