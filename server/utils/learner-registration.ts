import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'learner_registration'
const FLOW_DURATION_SECONDS = 30 * 60
const MINIMUM_FORM_AGE_MS = 1500

interface RegistrationFlow {
  id: string
  issuedAt: number
  expiresAt: number
}

function secret() {
  const configured = useRuntimeConfig().learnerSessionSecret
  if (typeof configured === 'string' && configured.length >= 32) return configured
  if (process.env.NODE_ENV === 'production') {
    throw new Error('LEARNER_SESSION_SECRET doit contenir au moins 32 caractères en production')
  }
  return 'development-only-learner-secret-change-me'
}

function signature(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

function safelyEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function encode(flow: RegistrationFlow) {
  const payload = Buffer.from(JSON.stringify(flow)).toString('base64url')
  return `${payload}.${signature(payload)}`
}

function decode(value: string | undefined): RegistrationFlow | null {
  if (!value) return null
  const [payload, receivedSignature, extra] = value.split('.')
  if (!payload || !receivedSignature || extra || !safelyEqual(signature(payload), receivedSignature)) return null
  try {
    const flow = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as RegistrationFlow
    if (
      typeof flow.id !== 'string'
      || !/^[a-f0-9]{32}$/u.test(flow.id)
      || !Number.isFinite(flow.issuedAt)
      || !Number.isFinite(flow.expiresAt)
      || flow.expiresAt <= Date.now()
    ) return null
    return flow
  } catch {
    return null
  }
}

export function createLearnerRegistrationFlow(event: H3Event) {
  const now = Date.now()
  const flow: RegistrationFlow = {
    id: randomBytes(16).toString('hex'),
    issuedAt: now,
    expiresAt: now + FLOW_DURATION_SECONDS * 1000,
  }
  setCookie(event, COOKIE_NAME, encode(flow), {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestURL(event).protocol === 'https:',
    path: '/',
    maxAge: FLOW_DURATION_SECONDS,
  })
  return flow
}

export function requireLearnerRegistrationFlow(event: H3Event, minimumAge = false) {
  const flow = decode(getCookie(event, COOKIE_NAME))
  if (!flow) {
    throw createError({ statusCode: 403, statusMessage: 'Parcours d’inscription expiré' })
  }
  if (minimumAge && Date.now() - flow.issuedAt < MINIMUM_FORM_AGE_MS) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire envoyé trop rapidement' })
  }
  return flow
}

export function clearLearnerRegistrationFlow(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function createUsernameProof(flow: RegistrationFlow, username: string) {
  return signature(`username:${flow.id}:${username}`)
}

export function assertUsernameProof(flow: RegistrationFlow, username: string, proof: unknown) {
  const received = typeof proof === 'string' ? proof : ''
  if (!received || !safelyEqual(createUsernameProof(flow, username), received)) {
    throw createError({ statusCode: 400, statusMessage: 'Proposition de pseudonyme invalide' })
  }
}
