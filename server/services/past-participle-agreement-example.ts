import type { RowDataPacket } from 'mysql2/promise'
import type { VerbConsultation } from '../../shared/types/verb-consultation'
import { inferAnteposedComplement } from './complement-placement'
import {
  agreePastParticiple,
  splitPastParticipleAgreement,
  type AgreementGender,
  type AgreementNumber,
} from '../../shared/utils/past-participle-agreement'

export interface AgreementComplementRow extends RowDataPacket {
  texte: string
  texte_antepose: string | null
  genre: string | null
  nombre: string | null
}

function cleanPhrase(value: string) {
  return value.replace(/\s+/gu, ' ').replace(/[.!?]+$/gu, '').trim()
}

function sentenceCase(value: string) {
  return value.charAt(0).toLocaleUpperCase('fr') + value.slice(1)
}

function normalizedGender(value: string | null): AgreementGender | null {
  if (!value) return null
  const normalized = value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
  if (normalized === 'feminin') return 'feminin'
  if (normalized === 'masculin') return 'masculin'
  return null
}

function normalizedNumber(value: string | null): AgreementNumber | null {
  if (!value) return null
  const normalized = value.toLocaleLowerCase('fr')
  if (normalized === 'singulier' || normalized === 'pluriel') return normalized
  return null
}

function splitAnteposedComplement(value: string) {
  const complement = cleanPhrase(value)
  const match = complement.match(
    /^(.+?)\s+((?:à\s+(?:l['’]|la\b|le\b|un\b|une\b|des\b)|au\b|aux\b|dans\b|sur\b|sous(?!-)\b|chez\b|vers\b|en\b|pour\b|par\b|avec\b|sans\b).*)$/iu,
  )
  return match
    ? { cod: match[1]!.trim(), following: match[2]!.trim() }
    : { cod: complement, following: '' }
}

export function buildPastParticipleAgreementExample(
  participle: string,
  complements: readonly AgreementComplementRow[],
): VerbConsultation['pastParticipleAgreement'] {
  for (const complement of complements) {
    const inferred = inferAnteposedComplement(complement.texte)
    const gender = normalizedGender(complement.genre) ?? inferred?.gender ?? null
    const number = normalizedNumber(complement.nombre) ?? inferred?.number ?? null
    if (!gender || !number || (gender === 'masculin' && number === 'singulier')) continue

    const agreedParticiple = agreePastParticiple(participle, gender, number)
    const splitParticiple = splitPastParticipleAgreement(participle, agreedParticiple)
    if (!splitParticiple.agreement) continue

    const afterComplement = cleanPhrase(complement.texte)
    const beforeComplement = splitAnteposedComplement(complement.texte_antepose || inferred?.text || '')
    if (!afterComplement || !beforeComplement.cod) continue

    return {
      afterSentence: `Il a ${participle} ${afterComplement}.`,
      beforeSentenceStart: `${sentenceCase(beforeComplement.cod)} qu’il a `,
      agreedParticipleStart: splitParticiple.unchanged,
      agreementLetters: splitParticiple.agreement,
      beforeSentenceEnd: `${beforeComplement.following ? ` ${beforeComplement.following}` : ''}.`,
      cod: beforeComplement.cod,
      gender,
      number,
    }
  }
  return undefined
}
