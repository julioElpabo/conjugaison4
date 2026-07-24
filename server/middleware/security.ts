const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function isProtectedMutation(path: string, method: string) {
  if (!UNSAFE_METHODS.has(method.toUpperCase())) return false
  return path === '/api/auth/login'
    || path === '/api/auth/logout'
    || path === '/api/admin'
    || path.startsWith('/api/admin/')
}

function assertSameOrigin(event: Parameters<typeof getRequestURL>[0]) {
  const origin = getHeader(event, 'origin')
  const expectedOrigin = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  }).origin

  if (!origin) {
    throw createError({ statusCode: 403, statusMessage: 'Origine de la requête manquante' })
  }

  try {
    if (new URL(origin).origin !== expectedOrigin) {
      throw createError({ statusCode: 403, statusMessage: 'Origine de la requête refusée' })
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 403, statusMessage: 'Origine de la requête invalide' })
  }
}

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] || '/'
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ')

  setResponseHeaders(event, {
    'Content-Security-Policy': contentSecurityPolicy,
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  })

  if (process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  if (
    path.startsWith('/api/admin')
    || path.startsWith('/api/auth/')
    || /^\/(?:fr|de|en|it|es)\/admin(?:\/|$)/u.test(path)
    || path === '/admin'
    || path.startsWith('/admin/')
  ) {
    setResponseHeader(event, 'Cache-Control', 'no-store')
  }

  if (isProtectedMutation(path, event.method)) assertSameOrigin(event)
})
