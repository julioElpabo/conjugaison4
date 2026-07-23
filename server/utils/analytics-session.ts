import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'tatitotu_session'

export function analyticsSessionId(event: H3Event) {
  const existing = getCookie(event, COOKIE_NAME)?.trim()
  const sessionId = existing && /^[a-f0-9-]{20,64}$/iu.test(existing) ? existing : randomUUID()
  setCookie(event, COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestURL(event).protocol === 'https:',
    path: '/',
    maxAge: 30 * 60,
  })
  return sessionId
}

export function analyticsDeviceCategory(userAgent = '') {
  if (/ipad|tablet|playbook|silk/iu.test(userAgent)) return 'tablet'
  if (/mobile|iphone|ipod|android/iu.test(userAgent)) return 'mobile'
  return 'desktop'
}

export function safeAnalyticsPath(value: unknown) {
  const path = typeof value === 'string' ? value.trim().slice(0, 255) : '/'
  return path.startsWith('/') ? path : '/'
}

export function safeAnalyticsMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const allowed = ['presentation', 'exerciseKind', 'coach', 'preset', 'mode', 'tense', 'status']
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key, item]) => allowed.includes(key) && ['string', 'number', 'boolean'].includes(typeof item))
    .slice(0, 8)
    .map(([key, item]) => [key, String(item).slice(0, 100)])
  return entries.length ? Object.fromEntries(entries) : null
}
