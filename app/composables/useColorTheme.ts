export type ColorTheme = 'light' | 'dark'

const STORAGE_KEY = 'conjugaison.theme'

export function useColorTheme() {
  const theme = useState<ColorTheme>('color-theme', () => 'light')
  const isDark = computed(() => theme.value === 'dark')

  function applyTheme(nextTheme: ColorTheme, persist = true) {
    theme.value = nextTheme

    if (!import.meta.client) return

    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme

    if (persist) localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, applyTheme, toggleTheme }
}
