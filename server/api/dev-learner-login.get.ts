import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface DevelopmentLearnerLogin {
  username?: unknown
  password?: unknown
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')

  try {
    const source = await readFile(resolve(process.cwd(), 'learner-login.local.json'), 'utf8')
    const credentials = JSON.parse(source) as DevelopmentLearnerLogin
    return {
      username: typeof credentials.username === 'string' ? credentials.username.slice(0, 80) : '',
      password: typeof credentials.password === 'string' ? credentials.password.slice(0, 200) : '',
    }
  }
  catch {
    return { username: '', password: '' }
  }
})
