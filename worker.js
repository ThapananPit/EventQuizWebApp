import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const app = new Hono()


// TEMP DEBUG
app.onError((err, c) => {
  console.error(err)
  return c.text(`CRASH DETAILS: ${err.message}\n\nSTACK: ${err.stack}`, 500)
})


const COOKIE = 'ld_sess'
const STATE_COOKIE = 'ld_state'
const TTL = 60 * 60 * 24 * 7

const GOOGLE_AUTH     = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN    = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo'

async function getSession(c) {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  try { return await verify(token, c.env.SESSION_SECRET, 'HS256') }
  catch { return null }
}

app.get('/auth/google', async (c) => {
  const code  = c.req.query('code')
  const state = c.req.query('state')
  const origin = new URL(c.req.url).origin
  const redirectUri = `${origin}/auth/google`

  if (!code) {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).replace(/\W/g, '')
    setCookie(c, STATE_COOKIE, nonce, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 300, path: '/' })
    const params = new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: nonce,
    })
    return c.redirect(`${GOOGLE_AUTH}?${params}`)
  }

  const saved = getCookie(c, STATE_COOKIE)
  if (!saved || saved !== state) return c.text('Invalid state', 400)
  setCookie(c, STATE_COOKIE, '', { maxAge: 0, path: '/' })

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()
  if (!tokens.access_token) return c.text('Token exchange failed', 500)

  const userRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const u = await userRes.json()

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name'
  ).bind(u.sub, u.email, u.name).run()

  const token = await sign(
    { sub: u.sub, email: u.email, name: u.name, exp: Math.floor(Date.now() / 1000) + TTL },
    c.env.SESSION_SECRET,
    'HS256'
  )
  setCookie(c, COOKIE, token, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: TTL, path: '/' })
  return c.redirect('/')
})

app.get('/debug-session', async (c) => {
  const raw = getCookie(c, COOKIE)
  if (!raw) return c.json({ status: 'no_cookie' })
  try {
    const decoded = await verify(raw, c.env.SESSION_SECRET)
    return c.json({ status: 'ok', decoded })
  } catch (e) {
    return c.json({ status: 'verify_failed', error: e.message })
  }
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
