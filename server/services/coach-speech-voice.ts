import type { RowDataPacket } from 'mysql2/promise'
import type { AzureSpeechVoiceGender } from './azure-speech'
import { useDatabase } from '../utils/database'

interface CoachVoiceRow extends RowDataPacket {
  gender: string
}

export async function coachSpeechVoiceGender(coachId: number): Promise<AzureSpeechVoiceGender> {
  const [rows] = await useDatabase().execute<CoachVoiceRow[]>(`
    SELECT gender
    FROM coaches
    WHERE id=? AND status='published'
    LIMIT 1
  `, [coachId])
  const gender = rows[0]?.gender
  if (gender !== 'female' && gender !== 'male') {
    throw createError({ statusCode: 400, statusMessage: 'Coach audio invalide' })
  }
  return gender
}
