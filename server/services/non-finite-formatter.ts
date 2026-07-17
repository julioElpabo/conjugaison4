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

function variants(value: string) {
  return [...new Set(value.split('-').map(part => part.trim()).filter(part => part && part !== '-'))]
}

function hasPresentParticiple(verb: NonFiniteVerbSource) {
  return variants(verb.participe_present).length > 0
}

export function formatNonFiniteQuestion(
  verb: NonFiniteVerbSource,
  tense: NonFiniteTenseSource,
): ExerciseQuestion | null {
  const mode = normalized(tense.mode_name)
  const tenseName = normalized(tense.name)
  const infinitive = upperFirst(verb.infinitif)
  let label: string
  let answers: string[]

  if (mode === 'participe' && tenseName === 'présent') {
    label = 'Le participe présent'
    answers = variants(verb.participe_present).map(upperFirst)
  } else if (mode === 'participe' && tenseName === 'passé') {
    label = 'Le participe passé'
    answers = variants(verb.participe_passe).map(upperFirst)
  } else if (mode === 'gérondif' && tenseName === 'présent' && hasPresentParticiple(verb)) {
    label = 'Le gérondif présent'
    answers = variants(verb.participe_present).map(form => `En ${form}`)
  } else if (mode === 'gérondif' && tenseName === 'passé'
      && hasPresentParticiple(verb) && verb.auxiliaire_participe_present) {
    label = 'Le gérondif passé'
    answers = variants(verb.participe_passe)
      .map(form => `En ${verb.auxiliaire_participe_present} ${form}`)
  } else {
    return null
  }
  if (answers.length === 0) return null

  return {
    id: `n-${verb.id}-${tense.id}`,
    verbeId: Number(verb.id),
    tenseId: Number(tense.id),
    personId: null,
    titre: infinitive,
    consigne: `${label} de ${infinitive}`,
    reponses: answers,
    reponsesPourCorrige: answers,
    infinitif: verb.infinitif,
    temps: tense.name,
    mode: tense.mode_name,
    conjugaison1: answers[0]!,
    conjugaison2: answers[1] || '',
    conjugaison3: answers[2] || '',
  }
}
