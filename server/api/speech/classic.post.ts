import { readClassicSpeechToken } from '../../services/classic-speech-token'
import { synthesizeClassicSpeech } from '../../services/azure-speech'
import type { AzureSpeechVoiceGender } from '../../services/azure-speech'
import { coachSpeechVoiceGender } from '../../services/coach-speech-voice'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.speech)
  const body = await readLimitedJsonBody<{ token?: unknown, coachId?: unknown, voiceGender?: unknown }>(event, 8 * 1024)
  if (typeof body?.token !== 'string' || body.token.length > 4096) throw createError({ statusCode: 400, statusMessage: 'Jeton audio invalide' })
  const coachId = Number(body.coachId)
  if (body.coachId !== undefined && (!Number.isInteger(coachId) || coachId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Coach audio invalide' })
  }
  if (body.voiceGender !== undefined && !['female', 'male'].includes(String(body.voiceGender))) {
    throw createError({ statusCode: 400, statusMessage: 'Voix audio invalide' })
  }
  try {
    const voiceGender = body.coachId !== undefined
      ? await coachSpeechVoiceGender(coachId)
      : body.voiceGender as AzureSpeechVoiceGender | undefined
    const result = await synthesizeClassicSpeech(
      readClassicSpeechToken(body.token),
      voiceGender,
    )
    setResponseHeaders(event, {
      'Content-Type': result.mimeType,
      'Cache-Control': 'private, max-age=3600',
      'X-Speech-Cache': result.cached ? 'HIT' : 'MISS',
      'X-Speech-Voice': result.voice,
    })
    return result.audio
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('[speech] Lecture Azure impossible.', error)
    throw createError({ statusCode: 503, statusMessage: 'Lecture audio momentanément indisponible' })
  }
})
