interface TurnstileRenderOptions {
  sitekey: string
  action: string
  theme: 'auto'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileApiPromise: Promise<TurnstileApi> | null = null

function loadTurnstileApi() {
  if (!import.meta.client) return Promise.reject(new Error('Turnstile est uniquement disponible dans le navigateur.'))
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileApiPromise) return turnstileApiPromise

  turnstileApiPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]')
    const script = existing || document.createElement('script')
    const loaded = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('L’API Turnstile ne s’est pas initialisée.'))
    }
    const failed = () => reject(new Error('Impossible de charger l’API Turnstile.'))

    script.addEventListener('load', loaded, { once: true })
    script.addEventListener('error', failed, { once: true })
    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.turnstileScript = 'true'
      document.head.appendChild(script)
    }
  }).catch((error) => {
    turnstileApiPromise = null
    throw error
  })

  return turnstileApiPromise
}

export function useTurnstileWidget(siteKey: string, action: string, options: { autoRender?: boolean } = {}) {
  const container = ref<HTMLElement | null>(null)
  const token = ref('')
  const unavailable = ref(false)
  let widgetId: string | null = null

  async function render() {
    if (!siteKey || !container.value || widgetId) return
    const target = container.value
    try {
      const turnstile = await loadTurnstileApi()
      if (container.value !== target || widgetId) return
      widgetId = turnstile.render(target, {
        sitekey: siteKey,
        action,
        theme: 'auto',
        callback: (response) => {
          token.value = response
          unavailable.value = false
        },
        'expired-callback': () => { token.value = '' },
        'error-callback': () => {
          token.value = ''
          unavailable.value = true
        },
      })
    }
    catch {
      unavailable.value = true
    }
  }

  async function reset() {
    token.value = ''
    if (!widgetId) {
      await render()
      return
    }
    try {
      const turnstile = await loadTurnstileApi()
      turnstile.reset(widgetId)
    }
    catch {
      unavailable.value = true
    }
  }

  watch(container, (element) => {
    if (element && options.autoRender !== false) void render()
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    if (!widgetId || !window.turnstile) return
    window.turnstile.remove(widgetId)
    widgetId = null
  })

  return { container, token, unavailable, render, reset }
}
