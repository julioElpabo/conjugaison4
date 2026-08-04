import assert from 'node:assert/strict'
import { test } from 'node:test'

import { balancedIdentificationQuestions, balancedModeIdentificationQuestions, identificationQuestion } from '../server/services/questionnaire.ts'
import { MODE_IDENTIFICATION_INSTRUCTION, TENSE_IDENTIFICATION_INSTRUCTION } from '../shared/utils/exercise-instructions.ts'

test('utilise la même question pour identifier le mode et le temps', () => {
  const question = identificationQuestion({
    id: 1,
    verbe_id: 12,
    personne_id: 6,
    temp_id: 2,
    conjugaison1: 'abandonnait',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'abandonner',
    auxiliaire: 'avoir',
    participe_present: 'abandonnant',
    participe_passe: 'abandonné',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: 'il',
    temps_name: 'imparfait',
    is_compound: 0,
    mode_name: 'indicatif',
  })

  assert.equal(question.instruction, TENSE_IDENTIFICATION_INSTRUCTION)
  assert.equal(question.instruction, 'Quel est le mode et le temps de cette forme conjuguée ?')
  assert.equal(question.consigne, 'il abandonnait')
  assert.deepEqual(question.reponsesPourCorrige, ["L'imparfait de l'indicatif"])
})

test('utilise une citation littéraire validée en mettant précisément la forme en évidence', () => {
  const question = identificationQuestion({
    id: 1,
    verbe_id: 12,
    personne_id: 6,
    temp_id: 3,
    conjugaison1: 'commencera',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'commencer',
    auxiliaire: 'avoir',
    participe_present: 'commençant',
    participe_passe: 'commencé',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: 'il',
    temps_name: 'futur',
    is_compound: 0,
    mode_name: 'indicatif',
  }, {
    id: 91,
    verb_id: 12,
    tense_id: 3,
    person_id: 6,
    sentence_text: 'Il commencera ses devoirs demain.',
    target_text: 'commencera',
    target_start: 3,
    target_end: 13,
    author: 'Une autrice',
    work: 'Une œuvre',
    chapter: 'Chapitre 1',
    source_url: 'https://example.test/source',
  })

  assert.equal(question.id, 'lt-91')
  assert.equal(question.consigne, 'Il commencera ses devoirs demain.')
  assert.deepEqual(question.literaryCitation, {
    before: 'Il ',
    target: 'commencera',
    after: ' ses devoirs demain.',
    author: 'Une autrice',
    work: 'Une œuvre',
    chapter: 'Chapitre 1',
    sourceUrl: 'https://example.test/source',
  })
  assert.deepEqual(question.reponsesPourCorrige, ["Le futur de l'indicatif"])
})

test('ne demande et ne corrige que le mode dans un exercice de reconnaissance des modes', () => {
  const question = identificationQuestion({
    id: 1,
    verbe_id: 12,
    personne_id: 6,
    temp_id: 3,
    conjugaison1: 'commencera',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'commencer',
    auxiliaire: 'avoir',
    participe_present: 'commençant',
    participe_passe: 'commencé',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: 'il',
    temps_name: 'futur',
    is_compound: 0,
    mode_name: 'indicatif',
  }, {
    id: 91,
    verb_id: 12,
    tense_id: 3,
    person_id: 6,
    sentence_text: 'Il commencera ses devoirs demain.',
    target_text: 'commencera',
    target_start: 3,
    target_end: 13,
    author: 'Une autrice',
    work: 'Une œuvre',
    chapter: null,
    source_url: 'https://example.test/source',
  }, true)

  assert.equal(question.instruction, MODE_IDENTIFICATION_INSTRUCTION)
  assert.equal(question.consigne, 'Il commencera ses devoirs demain.')
  assert.deepEqual(question.reponsesPourCorrige, ["L'indicatif"])
  assert.ok(question.reponses.includes('indicatif'))
  assert.ok(question.reponses.every(answer => !answer.includes('futur')))
  assert.equal(question.literaryCitation?.target, 'commencera')
})

test('accepte l’infinitif dans les réponses de reconnaissance du mode et du temps', () => {
  const row = {
    id: 92,
    verbe_id: 12,
    personne_id: 6,
    temp_id: 25,
    conjugaison1: 'commencer',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'commencer',
    auxiliaire: 'avoir',
    participe_present: 'commençant',
    participe_passe: 'commencé',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: 'il',
    temps_name: 'présent',
    is_compound: 0,
    mode_name: 'infinitif',
  }

  const tenseQuestion = identificationQuestion(row)
  assert.ok(tenseQuestion.reponses.includes('infinitif présent'))
  assert.deepEqual(tenseQuestion.reponsesPourCorrige, ["L'infinitif présent"])

  const modeQuestion = identificationQuestion(row, undefined, true)
  assert.ok(modeQuestion.reponses.includes('infinitif'))
  assert.deepEqual(modeQuestion.reponsesPourCorrige, ["L'infinitif"])
})

function identificationCandidate(id, mode, tenseId, temps) {
  return {
    id,
    titre: 'tester',
    consigne: `Question ${id}`,
    reponses: [],
    reponsesPourCorrige: [],
    mode,
    tenseId,
    temps,
  }
}

test('couvre tous les modes disponibles et privilégie un temps rare', () => {
  const questions = [
    ...Array.from({ length: 12 }, (_, index) => identificationCandidate(`pc-${index}`, 'indicatif', 1, 'passé composé')),
    identificationCandidate('fa', 'indicatif', 2, 'futur antérieur'),
    ...Array.from({ length: 5 }, (_, index) => identificationCandidate(`sub-${index}`, 'subjonctif', 3, 'présent')),
    ...Array.from({ length: 5 }, (_, index) => identificationCandidate(`cond-${index}`, 'conditionnel', 4, 'présent')),
    ...Array.from({ length: 5 }, (_, index) => identificationCandidate(`imp-${index}`, 'impératif', 5, 'présent')),
  ]

  const selected = balancedIdentificationQuestions(questions, 4)
  assert.deepEqual(new Set(selected.map(question => question.mode)), new Set(['indicatif', 'subjonctif', 'conditionnel', 'impératif']))
  assert.ok(selected.some(question => question.temps === 'futur antérieur'))
})

test('ne répète pas un couple mode-temps tant que des couples différents restent disponibles', () => {
  const definitions = [
    ['indicatif', 1, 'présent'],
    ['indicatif', 2, 'imparfait'],
    ['indicatif', 3, 'passé composé'],
    ['indicatif', 4, 'passé simple'],
    ['subjonctif', 5, 'présent'],
    ['subjonctif', 6, 'imparfait'],
    ['conditionnel', 7, 'présent'],
    ['conditionnel', 8, 'passé 1'],
    ['impératif', 9, 'présent'],
    ['impératif', 10, 'passé'],
  ]
  const questions = definitions.flatMap(([mode, tenseId, temps], index) => [
    identificationCandidate(`${index}-a`, mode, tenseId, temps),
    identificationCandidate(`${index}-b`, mode, tenseId, temps),
  ])

  const selected = balancedIdentificationQuestions(questions, 10)
  const combinations = selected.map(question => `${question.mode}:${question.tenseId}`)
  assert.equal(new Set(combinations).size, 10)
})

test('mélange aussi la liste finale des questions portant uniquement sur le mode', () => {
  const originalRandom = Math.random
  const randomValues = [0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4]
  let randomIndex = 0
  Math.random = () => randomValues[randomIndex++ % randomValues.length]
  try {
    const questions = ['indicatif', 'subjonctif', 'conditionnel', 'impératif'].flatMap((mode, modeIndex) => (
      Array.from({ length: 2 }, (_, index) => ({
        ...identificationCandidate(`${mode}-${index}`, mode, modeIndex + 1, 'présent'),
        literaryCitation: { before: '', target: mode, after: '', author: 'Auteur', work: 'Œuvre', chapter: null, sourceUrl: '' },
      }))
    ))
    const selected = balancedModeIdentificationQuestions(questions, 8)
    const fixedCycle = ['indicatif', 'subjonctif', 'conditionnel', 'impératif', 'indicatif', 'subjonctif', 'conditionnel', 'impératif']
    assert.notDeepEqual(selected.map(question => question.mode), fixedCycle)
  } finally {
    Math.random = originalRandom
  }
})
