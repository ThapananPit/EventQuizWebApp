import { Hono } from 'hono'
import { googleAuth } from '@hono/oauth-providers/google'
import { setCookie, getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const app = new Hono()
const COOKIE = 'ld_sess'
const TTL = 60 * 60 * 24 * 7

async function getSession(c) {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  try { return await verify(token, c.env.SESSION_SECRET) }
  catch { return null }
}

app.use('/auth/google', async (c, next) => {
  return googleAuth({
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
  })(c, next)
})

app.get('/auth/google', async (c) => {
  const u = c.get('user-google')
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name'
  ).bind(u.id, u.email, u.name).run()
  const token = await sign(
    { sub: u.id, email: u.email, name: u.name, exp: Math.floor(Date.now() / 1000) + TTL },
    c.env.SESSION_SECRET
  )
  setCookie(c, COOKIE, token, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: TTL, path: '/' })
  return c.redirect('/')
})

app.get('/api/me', async (c) => {
  const s = await getSession(c)
  return c.json(s ? { id: s.sub, email: s.email, name: s.name } : null)
})

app.post('/api/logout', (c) => {
  setCookie(c, COOKIE, '', { maxAge: 0, path: '/' })
  return c.json({ ok: true })
})

app.post('/api/scores', async (c) => {
  const s = await getSession(c)
  if (!s) return c.json({ error: 'unauthorized' }, 401)
  const { path_id, score, ending, users_remaining } = await c.req.json()
  await c.env.DB.prepare(
    'INSERT INTO scores (user_id, path_id, score, ending, users_remaining) VALUES (?, ?, ?, ?, ?)'
  ).bind(s.sub, path_id, score, ending, users_remaining).run()
  return c.json({ ok: true })
})

export default app
