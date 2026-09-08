export default defineNuxtPlugin(() => {
  const { hostname } = useRequestURL()
  const local = import.meta.dev
    || hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')

  useHead({
    link: [{
      key: 'favicon',
      rel: 'icon',
      type: 'image/svg+xml',
      href: local ? '/favicon-local.svg' : '/favicon.svg',
    }],
  })
})
