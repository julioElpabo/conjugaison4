import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { SavedChallenge, SavedChallengeFolder, SavedChallengeFolderAction, SavedChallengeFolderFilter } from '~~/shared/types/saved-challenge'
import { filterSavedChallenges } from '~~/shared/utils/saved-challenge-folders'
import { savedChallengeFoldersCopy } from '~~/shared/i18n/saved-challenge-folders'
import { DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR, isSavedChallengeFolderColor, type SavedChallengeFolderColor } from '~~/shared/utils/saved-challenge-folder-colors'

export function useSavedChallengeFolders(challenges: Ref<SavedChallenge[]>, readOnly: MaybeRefOrGetter<boolean>) {
  const { interfaceLocale } = useLanguagePreferences()
  const copy = computed(() => savedChallengeFoldersCopy(interfaceLocale.value))
  const folders = ref<SavedChallengeFolder[]>([])
  const filter = ref<SavedChallengeFolderFilter>('all')
  const visibleChallenges = computed(() => filterSavedChallenges(challenges.value, filter.value))
  const action = ref<SavedChallengeFolderAction | null>(null)
  const pending = ref(false)
  const error = ref('')
  const notice = ref('')
  const sortedFolders = computed(() => [...folders.value].sort((a, b) => a.name.localeCompare(b.name, interfaceLocale.value)))

  function open(value: SavedChallengeFolderAction) {
    if (toValue(readOnly) || pending.value) return
    action.value = value
    error.value = ''
    notice.value = ''
  }

  function close() { if (!pending.value) action.value = null }

  function showError(cause: unknown) {
    const status = Number((cause as { statusCode?: number, response?: { status?: number } })?.statusCode
      || (cause as { response?: { status?: number } })?.response?.status)
    error.value = status === 409 ? copy.value.duplicate : status === 404 ? copy.value.missing : copy.value.error
  }

  async function createMoveFolder(name: string, color: SavedChallengeFolderColor = DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR): Promise<SavedChallengeFolder | null> {
    if (toValue(readOnly) || pending.value || action.value?.kind !== 'move' || !isSavedChallengeFolderColor(color)) return null
    pending.value = true
    error.value = ''
    try {
      const response = await $fetch<{ folder: SavedChallengeFolder }>('/api/learner/challenge-folders', {
        method: 'POST', credentials: 'same-origin', body: { name: name.trim(), color },
      })
      folders.value = [...folders.value, response.folder]
      return response.folder
    } catch (cause) {
      showError(cause)
      return null
    } finally {
      pending.value = false
    }
  }

  async function confirm(values: { name: string, folderId: number | null, color?: SavedChallengeFolderColor }): Promise<boolean> {
    if (toValue(readOnly) || pending.value || !action.value) return false
    const current = action.value
    if (current.kind === 'color' && !isSavedChallengeFolderColor(values.color)) return false
    if (current.kind === 'create' && values.color !== undefined && !isSavedChallengeFolderColor(values.color)) return false
    pending.value = true
    error.value = ''
    try {
      if (current.kind === 'create' || current.kind === 'rename') {
        const response = await $fetch<{ folder: SavedChallengeFolder }>(current.kind === 'create'
          ? '/api/learner/challenge-folders' : `/api/learner/challenge-folders/${current.folder.id}`, {
          method: current.kind === 'create' ? 'POST' : 'PATCH',
          credentials: 'same-origin', body: current.kind === 'create'
            ? { name: values.name.trim(), color: values.color ?? DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR }
            : { name: values.name.trim() },
        })
        folders.value = [...folders.value.filter(folder => folder.id !== response.folder.id), response.folder]
        filter.value = response.folder.id
        notice.value = current.kind === 'create' ? copy.value.created : copy.value.renamed
      } else if (current.kind === 'color') {
        const response = await $fetch<{ folder: SavedChallengeFolder }>(`/api/learner/challenge-folders/${current.folder.id}`, {
          method: 'PATCH', credentials: 'same-origin', body: { color: values.color },
        })
        folders.value = folders.value.map(folder => folder.id === response.folder.id ? response.folder : folder)
        notice.value = copy.value.colorSaved
      } else if (current.kind === 'delete') {
        await $fetch(`/api/learner/challenge-folders/${current.folder.id}`, { method: 'DELETE', credentials: 'same-origin' })
        folders.value = folders.value.filter(folder => folder.id !== current.folder.id)
        challenges.value = challenges.value.map(challenge => challenge.folderId === current.folder.id ? { ...challenge, folderId: null } : challenge)
        filter.value = 'unfiled'
        notice.value = copy.value.deleted
      } else {
        const response = await $fetch<{ codes: string[], folderId: number | null }>('/api/learner/saved-challenges/move', {
          method: 'POST', credentials: 'same-origin',
          body: { codes: current.challenges.map(challenge => challenge.code), folderId: values.folderId },
        })
        const moved = new Set(response.codes)
        challenges.value = challenges.value.map(challenge => moved.has(challenge.code) ? { ...challenge, folderId: response.folderId } : challenge)
        notice.value = copy.value.moved(response.codes.length)
      }
      action.value = null
      return true
    } catch (cause) {
      showError(cause)
      return false
    } finally {
      pending.value = false
    }
  }

  return { folders, sortedFolders, filter, visibleChallenges, action, pending, error, notice, open, close, confirm, createMoveFolder }
}
