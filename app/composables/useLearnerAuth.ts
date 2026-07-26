export interface LearnerUser {
  id: number
  username: string
}

type LearnerAuthStatus = 'unknown' | 'checking' | 'authenticated' | 'anonymous'

interface LearnerSessionResponse {
  user: LearnerUser
}

function learnerErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return undefined
  const candidate = error as {
    status?: number
    statusCode?: number
    data?: { status?: number, statusCode?: number }
    response?: { status?: number }
  }
  return candidate.statusCode
    ?? candidate.status
    ?? candidate.data?.statusCode
    ?? candidate.data?.status
    ?? candidate.response?.status
}

export function useLearnerAuth() {
  const user = useState<LearnerUser | null>('learner-user', () => null)
  const status = useState<LearnerAuthStatus>('learner-auth-status', () => 'unknown')

  function setUser(nextUser: LearnerUser) {
    user.value = nextUser
    status.value = 'authenticated'
  }

  function clearUser() {
    user.value = null
    status.value = 'anonymous'
  }

  async function checkSession(force = false) {
    if (!force && status.value === 'authenticated' && user.value) return user.value
    if (!force && status.value === 'anonymous') return null

    status.value = 'checking'
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const response = await $fetch<LearnerSessionResponse>('/api/learner/me', {
        credentials: 'same-origin',
        headers,
      })
      setUser(response.user)
      return response.user
    }
    catch (error) {
      clearUser()
      if (learnerErrorStatus(error) !== 401) {
        console.error('[learner] Impossible de vérifier la session.', error)
      }
      return null
    }
  }

  async function logout() {
    try {
      await $fetch('/api/learner/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    }
    finally {
      clearUser()
    }
  }

  return {
    user,
    status,
    isAuthenticated: computed(() => status.value === 'authenticated' && Boolean(user.value)),
    setUser,
    clearUser,
    checkSession,
    logout,
  }
}
