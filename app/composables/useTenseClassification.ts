import type { LearnerPreferences, TenseClassification } from '~~/shared/types/learner-preferences'

// Une file par application évite qu’une bascule rapide soit enregistrée dans le mauvais ordre.
const saveQueues = new WeakMap<object, Promise<void>>()

export function useTenseClassification() {
  const classification = useState<TenseClassification>('tense-classification', () => 'traditional')
  const loadedAccount = useState<number | null>('tense-classification-account', () => null)
  const revision = useState('tense-classification-revision', () => 0)
  const saveError = useState('tense-classification-save-error', () => false)
  const { user } = useLearnerAuth()
  const requestFetch = useRequestFetch()
  const app = useNuxtApp()

  async function restoreClassification() {
    const accountId = user.value?.id ?? null
    if (accountId === loadedAccount.value) return
    loadedAccount.value = accountId
    classification.value = 'traditional'
    saveError.value = false
    const requestRevision = ++revision.value
    if (accountId === null) return
    try {
      const preferences = await requestFetch<LearnerPreferences>('/api/learner/preferences')
      if (user.value?.id === accountId && revision.value === requestRevision) {
        classification.value = preferences.tenseClassification === 'modern' ? 'modern' : 'traditional'
      }
    } catch {
      if (loadedAccount.value === accountId) loadedAccount.value = null
    }
  }

  async function setClassification(next: TenseClassification) {
    classification.value = next
    saveError.value = false
    const changeRevision = ++revision.value
    const accountId = user.value?.id
    if (!accountId) return
    const queued = (saveQueues.get(app) ?? Promise.resolve()).catch(() => {}).then(async () => {
      if (user.value?.id !== accountId) return
      await $fetch('/api/learner/preferences', { method: 'PUT', body: { tenseClassification: next } })
    })
    saveQueues.set(app, queued)
    try {
      await queued
    } catch {
      if (revision.value === changeRevision && user.value?.id === accountId) saveError.value = true
    }
  }

  return { classification, restoreClassification, setClassification, saveError }
}
