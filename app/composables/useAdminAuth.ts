export interface AdminUser {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  privilegeId: number
}

export type AdminAuthStatus = 'unknown' | 'checking' | 'authenticated' | 'anonymous'

interface SessionResponse {
  user: AdminUser | null
}

interface LoginResponse {
  user: AdminUser
}

type ErrorLike = {
  status?: number
  statusCode?: number
  statusMessage?: string
  message?: string
  data?: {
    status?: number
    statusCode?: number
    statusMessage?: string
    message?: string
  }
  response?: {
    status?: number
  }
}

export function getAdminErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const candidate = error as ErrorLike
  return candidate.statusCode
    ?? candidate.status
    ?? candidate.data?.statusCode
    ?? candidate.data?.status
    ?? candidate.response?.status
}

export function getAdminErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const candidate = error as ErrorLike
  return candidate.data?.statusMessage
    || candidate.data?.message
    || candidate.statusMessage
    || candidate.message
    || fallback
}

export function useAdminAuth() {
  const user = useState<AdminUser | null>('admin-user', () => null)
  const status = useState<AdminAuthStatus>('admin-auth-status', () => 'unknown')
  const authError = useState<string>('admin-auth-error', () => '')

  const isAuthenticated = computed(() => status.value === 'authenticated' && Boolean(user.value))

  function clearSession(message = '') {
    user.value = null
    status.value = 'anonymous'
    authError.value = message
  }

  async function checkSession(force = false): Promise<AdminUser | null> {
    if (!force && status.value === 'authenticated' && user.value) {
      return user.value
    }

    status.value = 'checking'
    authError.value = ''

    try {
      const response = await $fetch<SessionResponse>('/api/auth/me', {
        credentials: 'same-origin'
      })

      if (!response.user || response.user.privilegeId !== 1) {
        clearSession()
        return null
      }

      user.value = response.user
      status.value = 'authenticated'
      return response.user
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession()
      } else {
        clearSession(getAdminErrorMessage(error, 'Impossible de vérifier la session.'))
      }
      return null
    }
  }

  async function login(email: string, password: string): Promise<AdminUser> {
    authError.value = ''

    try {
      const response = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        body: { email, password }
      })

      user.value = response.user
      status.value = 'authenticated'
      return response.user
    } catch (error) {
      clearSession(getAdminErrorMessage(error, 'Connexion impossible.'))
      throw error
    }
  }

  async function logout(): Promise<void> {
    authError.value = ''

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })
      clearSession()
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession()
        return
      }

      authError.value = getAdminErrorMessage(error, 'Déconnexion impossible.')
      throw error
    }
  }

  function handleUnauthorized(error: unknown): boolean {
    if (getAdminErrorStatus(error) !== 401) {
      return false
    }

    clearSession('Votre session a expiré. Reconnectez-vous pour continuer.')
    return true
  }

  return {
    user,
    status,
    authError,
    isAuthenticated,
    checkSession,
    login,
    logout,
    clearSession,
    handleUnauthorized
  }
}
