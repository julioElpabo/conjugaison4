import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { SavedChallenge } from '~~/shared/types/saved-challenge'

export function useSavedChallengeRemoval(challenges: Ref<SavedChallenge[]>, readOnly: MaybeRefOrGetter<boolean>) {
  const selecting = ref(false)
  const selectedCodes = ref<string[]>([])
  const targets = ref<SavedChallenge[]>([])
  const pending = ref(false)
  const failed = ref(false)
  const removedCount = ref(0)
  const selected = computed(() => challenges.value.filter(challenge => selectedCodes.value.includes(challenge.code)))
  const allSelected = computed(() => challenges.value.length > 0 && selected.value.length === challenges.value.length)

  function toggleSelecting() {
    if (toValue(readOnly) || pending.value) return
    selecting.value = !selecting.value
    selectedCodes.value = []
  }

  function toggle(code: string) {
    if (toValue(readOnly) || pending.value || !selecting.value || !challenges.value.some(item => item.code === code)) return
    selectedCodes.value = selectedCodes.value.includes(code)
      ? selectedCodes.value.filter(item => item !== code) : [...selectedCodes.value, code]
  }

  function toggleAll() {
    if (toValue(readOnly) || pending.value || !selecting.value) return
    selectedCodes.value = allSelected.value ? [] : challenges.value.map(item => item.code)
  }

  function requestRemoval(items: SavedChallenge[]) {
    if (toValue(readOnly) || pending.value) return
    targets.value = challenges.value.filter(item => items.some(target => target.code === item.code))
    failed.value = false
    removedCount.value = 0
  }

  function cancel() {
    if (pending.value) return
    targets.value = []
    failed.value = false
  }

  async function confirm() {
    if (toValue(readOnly) || pending.value || !targets.value.length) return false
    const codes = targets.value.map(item => item.code)
    pending.value = true
    failed.value = false
    try {
      await $fetch('/api/learner/saved-challenges', {
        method: 'DELETE', credentials: 'same-origin', body: { codes },
      })
      // Mettre à jour uniquement après la réussite ; une nouvelle tentative
      // reste possible même si la réponse précédente s'est perdue en réseau.
      challenges.value = challenges.value.filter(item => !codes.includes(item.code))
      selectedCodes.value = selectedCodes.value.filter(code => !codes.includes(code))
      removedCount.value = codes.length
      targets.value = []
      if (!challenges.value.length) selecting.value = false
      return true
    } catch {
      failed.value = true
      return false
    } finally {
      pending.value = false
    }
  }

  return { selecting, selectedCodes, selected, allSelected, targets, pending, failed, removedCount,
    toggleSelecting, toggle, toggleAll, requestRemoval, cancel, confirm }
}
