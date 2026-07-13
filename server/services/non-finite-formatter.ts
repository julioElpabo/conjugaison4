import type { ExerciseQuestion } from '../types/public-api'

export interface NonFiniteVerbSource {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire_participe_present: string | null
}

export interface NonFiniteTenseSource {
  id: number
  name: string
  mode_name: string
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

function upperFirst(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase('fr-CH') + value.slice(1) : value
}

export function formatNonFiniteQuestion(
  verb: NonFiniteVerbSource,
  tense: NonFiniteTenseSource,
): ExerciseQuestion | null {
  const mode = normalized(tense.mode_name)
  const tenseName = normalized(tense.name)
  const infinitive = upperFirst(verb.infinitif)
  let label: string
  let answer: string

  if (mode === 'participe' && tenseName === 'présent') {
    label = 'Le participe présent'
    answer = upperFirst(verb.participe_present)
  } else if (mode === 'participe' && tenseName === 'passé') {
    label = 'Le participe passé'
    answer = upperFirst(verb.participe_passe)
  } else if (mode === 'gérondif' && tenseName === 'présent') {
    label = 'Le gérondif présent'
    answer = `En ${verb.participe_present}`
  } else if (mode === 'gérondif' && tenseName === 'passé' && verb.auxiliaire_participe_present) {
    label = 'Le gérondif passé'
    answer = `En ${verb.auxiliaire_participe_present} ${verb.participe_passe}`
  } else {
    return null
  }

  return {
    id: `n-${verb.id}-${tense.id}`,
    verbeId: Number(verb.id),
    tenseId: Number(tense.id),
    personId: null,
    titre: infinitive,
    consigne: `${label} de ${infinitive}`,
    reponses: [answer],
    reponsesPourCorrige: [answer],
    infinitif: verb.infinitif,
    temps: tense.name,
    mode: tense.mode_name,
    conjugaison1: answer,
    conjugaison2: '',
    conjugaison3: '',
  }
}
