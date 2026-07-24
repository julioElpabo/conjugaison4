const CATALOGUE_MUTATION_PREFIXES = [
  '/api/admin/verbes',
  '/api/admin/challenge-presets',
  '/api/admin/challenge-preset-categories',
]
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler((event) => {
  if (!MUTATION_METHODS.has(event.method.toUpperCase())) return
  const path = event.path.split('?')[0] || '/'
  if (!CATALOGUE_MUTATION_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return

  event.node.res.once('finish', () => {
    if (event.node.res.statusCode < 200 || event.node.res.statusCode >= 400) return
    void import('../services/catalogue').then(({ invalidateCatalogueCache }) => {
      invalidateCatalogueCache()
    })
  })
})
