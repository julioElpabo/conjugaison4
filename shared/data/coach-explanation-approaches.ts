import type { CoachExplanationApproach } from '../types/coach'

export interface CoachExplanationApproachOption {
  value: CoachExplanationApproach
  label: string
  objective: string
  length: string
  vocabulary: string
  content: string
  avoids?: string
}

export const COACH_EXPLANATION_APPROACH_OPTIONS: CoachExplanationApproachOption[] = [
  {
    value: 'cif-falc',
    label: 'CIF (FLE) pour allophone',
    objective: 'Apprendre une procédure réutilisable.',
    length: 'Trois étapes.',
    vocabulary: 'FALC, concret et scolaire.',
    content: 'Identifier le temps, trouver la base, choisir la terminaison, puis vérifier.',
  },
  {
    value: 'concise',
    label: 'Très condensée',
    objective: 'Donner un indice immédiatement exploitable.',
    length: 'Une ou deux lignes.',
    vocabulary: 'Simple.',
    content: 'Base + terminaison.',
    avoids: 'Les explications théoriques.',
  },
  {
    value: 'grammatical-technical',
    label: 'Grammatico-technique',
    objective: 'Comprendre le fonctionnement de la langue.',
    length: 'Développée.',
    vocabulary: 'Radical, désinence, alternance et supplétisme.',
    content: 'Règle, famille, exceptions et justification.',
  },
  {
    value: 'guided-discovery',
    label: 'Découverte guidée',
    objective: 'Faire trouver la forme par raisonnement, sans livrer immédiatement la réponse.',
    length: 'Deux à quatre indices progressifs.',
    vocabulary: 'Concret et interrogatif.',
    content: 'Observer une forme connue, comparer, isoler la base, puis choisir la terminaison.',
    avoids: 'Donner la base et la terminaison ensemble dès le premier indice.',
  },
]

export function coachExplanationApproachLabel(value: CoachExplanationApproach) {
  return COACH_EXPLANATION_APPROACH_OPTIONS.find(option => option.value === value)?.label || value
}
