export const ZAZIZOZU_CLICKED_KEY = 'tatitotu.zazizozu.clicked'
export const ZAZIZOZU_ROTATION_KEY = 'tatitotu.zazizozu.rotation'

interface DiscoveryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Une apparition suivie de trois visites sans bandeau, sauf si le lien a déjà été ouvert. */
export function nextZazizozuDiscoveryVisit(storage: DiscoveryStorage): boolean {
  try {
    if (storage.getItem(ZAZIZOZU_CLICKED_KEY) === '1') return false
    const saved = storage.getItem(ZAZIZOZU_ROTATION_KEY) ?? '0'
    const rotation = /^[0-3]$/u.test(saved) ? Number(saved) : 0
    storage.setItem(ZAZIZOZU_ROTATION_KEY, String((rotation + 1) % 4))
    return rotation === 0
  } catch {
    // Sans compteur fiable, ne pas afficher le bandeau à chaque visite.
    return false
  }
}

export function rememberZazizozuDiscoveryClick(storage: DiscoveryStorage): void {
  try {
    storage.setItem(ZAZIZOZU_CLICKED_KEY, '1')
  } catch {
    // Le lien reste utilisable même si le navigateur bloque le stockage.
  }
}
