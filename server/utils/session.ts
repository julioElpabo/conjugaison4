import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { AppLocale } from '../../shared/i18n/locales'

const COOKIE_NAME = 'conjugaison_session'
const SESSION_DURATION_SECONDS = 8 * 60 * 60

export interface SessionUser {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  privilegeId: number
  interfaceLocale?: AppLocale
  explanationLocale?: AppLocale
}

interface SessionPayload extends SessionUser {
  expiresAt: number
}

function getSecret(): string {
  const secret = useRuntimeConfig().sessionSecret

  if (typeof secret !== 'string' || secret.length < 4) {
    throw new Error('SESSION_SECRET doit être configuré pour utiliser l’administration')
  }

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('SESSION_SECRET doit contenir au moins 32 caractères en production')
  }

  return secret
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url')
}

function encode(payload: SessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload)}`
}

function decode(token: string): SessionPayload | null {
  const [encodedPayload, signature, extra] = token.split('.')

  if (!encodedPayload || !signature || extra) {
    return null
  }

  const expected = Buffer.from(sign(encodedPayload))
  const received = Buffer.from(signature)

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload

    if (!Number.isInteger(payload.id) || payload.expiresAt <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function createAdminSession(event: H3Event, user: SessionUser): void {
  const payload: SessionPayload = {
    ...user,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000
  }

  setCookie(event, COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  })
  if (user.interfaceLocale) {
    setCookie(event, 'interface_locale', user.interfaceLocale, { sameSite: 'lax', path: '/', maxAge: 365 * 24 * 60 * 60 })
  }
  if (user.explanationLocale) {
    setCookie(event, 'explanation_locale', user.explanationLocale, { sameSite: 'lax', path: '/', maxAge: 365 * 24 * 60 * 60 })
  }
}

export function clearAdminSession(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getAdminSession(event: H3Event): SessionUser | null {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) {
    return null
  }

  const payload = decode(token)
  if (!payload) {
    return null
  }

  const { expiresAt: _expiresAt, ...user } = payload
  return user
}

export function requireAdministrator(event: H3Event): SessionUser {
  const user = getAdminSession(event)

  if (!user || user.privilegeId !== 1) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  }

  return user
}
