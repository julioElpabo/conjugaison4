import type { Ref } from 'vue'
import { nextZazizozuDiscoveryVisit, rememberZazizozuDiscoveryClick, ZAZIZOZU_CLICKED_KEY } from '~~/shared/utils/zazizozu-discovery'

export function useZazizozuDiscovery(eligible: Ref<boolean>) {
  const mounted = ref(false)
  const selected = ref(false)
  const { clicked, rememberClick } = useZazizozuDiscoveryClick()

  watch([mounted, eligible], ([ready, allowed]) => {
    selected.value = false
    if (!ready || !allowed || clicked.value) return
    try {
      selected.value = nextZazizozuDiscoveryVisit(window.localStorage)
    } catch {
      // L’accès au stockage lui-même peut être bloqué.
    }
  })

  function onStorage(event: StorageEvent) {
    if (event.key === ZAZIZOZU_CLICKED_KEY && event.newValue === '1') clicked.value = true
  }

  onMounted(() => {
    mounted.value = true
    window.addEventListener('storage', onStorage)
  })
  onBeforeUnmount(() => window.removeEventListener('storage', onStorage))

  return { visible: computed(() => eligible.value && selected.value && !clicked.value), rememberClick }
}

/** Tous les liens vers Zazizozu mémorisent le même choix, y compris celui du footer. */
export function useZazizozuDiscoveryClick() {
  const clicked = useState('zazizozu-discovery-clicked', () => false)

  function rememberClick() {
    clicked.value = true
    try { rememberZazizozuDiscoveryClick(window.localStorage) } catch { /* Navigation toujours possible. */ }
  }

  return { clicked, rememberClick }
}
