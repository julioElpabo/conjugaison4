import type { CoachEvent, CoachMessageContext, CoachProfile } from '../types/coach'
import { createCoachDialogueState, createVariedCoachReaction } from './coach-dialogue'

export interface CoachCredibilityCheck {
  id: string
  label: string
  passed: boolean
  expected: string
  actual: string
}

export interface CoachCredibilityReport {
  coachId: number
  coachName: string
  characterName: string
  score: number
  passed: boolean
  checks: CoachCredibilityCheck[]
}

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

function unresolvedPlaceholders(texts: string[]) {
  return texts.filter(text => /\{[a-zA-Z]+\}/u.test(text))
}

function immediateDuplicates<T>(values: T[]) {
  return values.filter((value, index) => index > 0 && value === values[index - 1]).length
}

function eventChecks(coach: CoachProfile, eventType: 'question' | 'correct' | 'incorrect', seed: number): CoachCredibilityCheck[] {
  const state = createCoachDialogueState()
  const random = seededRandom(seed)
  const context: CoachMessageContext = {
    verb: 'manger', mode: 'indicatif', tense: 'passé composé', expectedAnswer: 'nous avons mangé',
    complement: 'les pommes', participle: 'mangées', score: 80, correctCount: 16, questionCount: 20, questionNumber: 3,
  }
  const reactions = Array.from({ length: 20 }, () => createVariedCoachReaction(coach, eventType, context, state, {
    random,
    allowMotion: true,
    mediaAllowed: eventType !== 'question',
    animatedOnly: eventType === 'correct',
  }))
  const texts = reactions.map(reaction => reaction.text)
  const distinct = new Set(texts).size
  const maximumFrequency = Math.max(...[...new Set(texts)].map(text => texts.filter(value => value === text).length))
  const label = eventType === 'question' ? 'relances' : eventType === 'correct' ? 'réussites' : 'corrections'
  const checks: CoachCredibilityCheck[] = [
    {
      id: `${eventType}-variety`, label: `Diversité des ${label}`, passed: distinct >= 10,
      expected: 'au moins 10 formulations sur 20 interventions', actual: `${distinct} formulation(s)`,
    },
    {
      id: `${eventType}-frequency`, label: `Fréquence des ${label}`, passed: maximumFrequency <= 2,
      expected: 'une formulation utilisée au maximum 2 fois', actual: `maximum ${maximumFrequency} fois`,
    },
    {
      id: `${eventType}-consecutive`, label: `Répétitions consécutives des ${label}`, passed: immediateDuplicates(texts) === 0,
      expected: 'aucune répétition immédiate', actual: `${immediateDuplicates(texts)} répétition(s)`,
    },
    {
      id: `${eventType}-context`, label: `Contexte résolu dans les ${label}`, passed: unresolvedPlaceholders(texts).length === 0,
      expected: 'aucune variable technique visible', actual: `${unresolvedPlaceholders(texts).length} variable(s) non remplacée(s)`,
    },
  ]
  if (eventType === 'correct') {
    const mediaIds = reactions.map(reaction => reaction.media?.id).filter((id): id is number => Boolean(id))
    checks.push(
      {
        id: 'correct-animation', label: 'GIF après une réussite', passed: mediaIds.length === 20,
        expected: 'un GIF animé validé pour chaque réussite', actual: `${mediaIds.length}/20 réaction(s) avec GIF`,
      },
      {
        id: 'correct-media-repeat', label: 'Variété des GIF', passed: immediateDuplicates(mediaIds) === 0,
        expected: 'jamais deux fois le même GIF de suite', actual: `${immediateDuplicates(mediaIds)} répétition(s)`,
      },
    )
  }
  return checks
}

export function auditCoachCredibility(coach: CoachProfile, seed = 1): CoachCredibilityReport {
  const unverifiableCorrections = coach.replies.filter(reply => reply.isActive && reply.eventType === 'incorrect'
    && /(?:le mode|le temps|la personne) (?:était|est) correct/iu.test(reply.content))
  const checks = [
    ...eventChecks(coach, 'question', seed + 11),
    ...eventChecks(coach, 'correct', seed + 23),
    ...eventChecks(coach, 'incorrect', seed + 37),
    {
      id: 'character-profile', label: 'Caractère identifiable',
      passed: Boolean(coach.characterName.trim() && coach.pedagogicalStyle.trim()),
      expected: 'un caractère et une manière d’aider renseignés',
      actual: coach.characterName && coach.pedagogicalStyle ? `${coach.characterName} — ${coach.pedagogicalStyle}` : 'profil incomplet',
    },
    {
      id: 'verifiable-feedback', label: 'Corrections crédibles',
      passed: unverifiableCorrections.length === 0,
      expected: 'aucune affirmation sur ce que l’élève aurait correctement identifié',
      actual: unverifiableCorrections.length ? unverifiableCorrections.map(reply => `« ${reply.content} »`).join(', ') : 'aucune affirmation invérifiable',
    },
  ]
  const score = Math.round(checks.filter(check => check.passed).length / checks.length * 100)
  return {
    coachId: coach.id,
    coachName: `${coach.firstName} ${coach.lastName}`,
    characterName: coach.characterName,
    score,
    passed: checks.every(check => check.passed),
    checks,
  }
}
