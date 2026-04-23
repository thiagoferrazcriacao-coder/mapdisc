export default async function handler(req, res) {
  const { default: app } = await import('../server.js')
  return app(req, res)
}