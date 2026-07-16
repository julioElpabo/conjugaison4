import type { Verb, VerbId } from './conjugation'

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
}
