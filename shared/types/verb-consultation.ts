import type { Verb, VerbId } from './conjugation'
import type { AgreementGender, AgreementNumber } from '../utils/past-participle-agreement'

export interface ConsultedConjugation {
  id: number
  personId: number
  tenseId: number
  pronoun: string
  forms: string[]
}

export interface VerbConsultation {
  verb: Pick<Verb,
    | 'id'
    | 'infinitif'
    | 'participePresent'
    | 'participePasse'
    | 'auxiliaire'
    | 'groupeConjugaison'
    | 'estImpersonnel'
    | 'estDefectif'
    | 'typePronominal'
  > & { id: VerbId }
  conjugations: ConsultedConjugation[]
  /** COD validé de la base, utilisé pour construire les phrases pédagogiques. */
  trapExampleComplement?: string
  pastParticipleAgreement?: {
    afterSentence: string
    beforeSentenceStart: string
    agreedParticipleStart: string
    agreementLetters: string
    beforeSentenceEnd: string
    cod: string
    gender: AgreementGender
    number: AgreementNumber
  }
}
