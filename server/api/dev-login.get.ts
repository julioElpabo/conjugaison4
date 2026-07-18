import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface DevelopmentLogin {
  email?: unknown
  password?: unknown
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')

  try {
    const source = await readFile(resolve(process.cwd(), 'dev-login.local.json'), 'utf8')
    const credentials = JSON.parse(source) as DevelopmentLogin
    return {
      email: typeof credentials.email === 'string' ? credentials.email.slice(0, 254) : '',
      password: typeof credentials.password === 'string' ? credentials.password.slice(0, 200) : '',
    }
  } catch {
    return { email: '', password: '' }
  }
})
