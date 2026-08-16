import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { ExerciseQuestion } from '../../shared/types/conjugation'

export type ClassicSpeechPurpose = 'question' | 'answer'

export interface ClassicSpeechPayload {
  version: 1
  purpose: ClassicSpeechPurpose
  segments: string[]
  expiresAt: number
}

function tokenKey() {
  const config = useRuntimeConfig()
  const secret = String(
    process.env.CLASSIC_SPEECH_TOKEN_SECRET
      || process.env.SESSION_SECRET
      || process.env.AZURE_SPEECH_KEY
      || process.env.AZURE_SPEECH_KEY1
      || process.env.DB_PASSWORD
      || config.classicSpeechTokenSecret
      || '',
  )
  if (secret.length < 16) throw new Error('Un secret serveur robuste est requis pour sécuriser les jetons audio.')
  return createHash('sha256').update(`classic-speech:${secret}`).digest()
}

export function createClassicSpeechToken(payload: Omit<ClassicSpeechPayload, 'version' | 'expiresAt'>) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', tokenKey(), iv)
  const clear = Buffer.from(JSON.stringify({ ...payload, version: 1, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }))
  const encrypted = Buffer.concat([cipher.update(clear), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map(part => part.toString('base64url')).join('.')
}

export function readClassicSpeechToken(token: string): ClassicSpeechPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Jeton audio invalide.')
  const [iv, tag, encrypted] = parts.map(part => Buffer.from(part!, 'base64url'))
  const decipher = createDecipheriv('aes-256-gcm', tokenKey(), iv!)
  decipher.setAuthTag(tag!)
  const payload = JSON.parse(Buffer.concat([decipher.update(encrypted!), decipher.final()]).toString('utf8')) as ClassicSpeechPayload
  if (payload.version !== 1 || !['question', 'answer'].includes(payload.purpose) || !Array.isArray(payload.segments)) throw new Error('Jeton audio invalide.')
  if (payload.expiresAt < Date.now()) throw new Error('Jeton audio expiré.')
  if (!payload.segments.length || payload.segments.some(segment => typeof segment !== 'string' || segment.length > 180)) throw new Error('Phrase audio invalide.')
  return payload
}

function normalized(value?: string | null) {
  return (value || '').trim().toLocaleLowerCase('fr')
}

export function spokenTenseAndMode(tense?: string, mode?: string) {
  const tenseLabel = normalized(tense)
  const modeLabel = normalized(mode)
  const tensePrefix = /^[aeiouyhàâäéèêëîïôöùûü]/u.test(tenseLabel) ? `à l’${tenseLabel}` : `au ${tenseLabel}`
  const modePhrase: Record<string, string> = {
    indicatif: 'de l’indicatif',
    conditionnel: 'du conditionnel',
    subjonctif: 'du subjonctif',
    impératif: 'de l’impératif',
    imperatif: 'de l’impératif',
    infinitif: 'de l’infinitif',
    participe: 'du participe',
  }
  return [tensePrefix, modePhrase[modeLabel] || (modeLabel ? `du ${modeLabel}` : '')].filter(Boolean).join(' ')
}

export function addClassicSpeechTokens(question: ExerciseQuestion): ExerciseQuestion {
  const answer = question.reponsesPourCorrige[0] || question.reponses[0]
  if (!answer) return question
  const questionSegments = question.infinitif && question.temps && question.mode
    ? [
        ...(question.pronom ? [question.pronom] : []),
        question.infinitif,
        spokenTenseAndMode(question.temps, question.mode),
      ]
    : question.consigne
      ? [question.consigne]
      : []
  return {
    ...question,
    speech: {
      ...(questionSegments.length
        ? { questionToken: createClassicSpeechToken({ purpose: 'question', segments: questionSegments }) }
        : {}),
      answerToken: createClassicSpeechToken({ purpose: 'answer', segments: answer.trim().split(/\s+/u) }),
    },
  }
}
