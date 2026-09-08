import assert from 'node:assert/strict'
import test from 'node:test'
import { parseDefiDefinition, serializeDefi } from '../server/services/public-api-validation.ts'
import { learnerChallengeSnapshot, learnerQuestionSnapshot, learnerFormKey } from '../server/utils/learner-progress.ts'
import { printableQuestionParts, printableCorrectionText } from '../shared/utils/print-question.ts'

const conjugation = {
  exerciseKind: 'conjugation', titre: 'chanter', infinitif: 'chanter',
  consigne: 'il … | chanter | présent (indicatif)',
  reponses: ['chante'], reponsesPourCorrige: ['il chante'],
}
const identification = {
  ...conjugation, exerciseKind: 'tense-identification', consigne: 'il chante',
  reponses: ['présent de l’indicatif'], reponsesPourCorrige: ['Le présent de l’indicatif'],
}

test('un défi mixte conserve son type dans le partage et le suivi', () => {
  const config = { ...parseDefiDefinition([[1], [2], 10]), exerciseKind: 'mixed' }
  const restored = parseDefiDefinition(JSON.parse(serializeDefi(config)))
  assert.equal(restored.exerciseKind, 'mixed')
  assert.equal(learnerChallengeSnapshot(restored).exerciseKind, 'mixed')
})

test('les questions mixtes conservent leur type pour la reprise et la validation', () => {
  for (const question of [conjugation, identification]) {
    const snapshot = learnerQuestionSnapshot(question)
    assert.equal(snapshot.exerciseKind, question.exerciseKind)
    assert.equal(learnerFormKey(snapshot, 'mixed'), learnerFormKey(question, question.exerciseKind))
  }
  assert.notEqual(learnerFormKey(conjugation, 'mixed'), learnerFormKey(identification, 'mixed'))
})

test('l’impression mixte distingue les blancs de conjugaison des formes à identifier et leurs corrigés', () => {
  const conjugationParts = printableQuestionParts(conjugation, 'mixed')
  const identificationParts = printableQuestionParts(identification, 'mixed')
  assert.equal(conjugationParts.fillBlank, true)
  assert.match(conjugationParts.label, /chanter/)
  assert.equal(identificationParts.fillBlank, false)
  assert.equal(identificationParts.completion, 'il chante')
  assert.equal(identificationParts.label, '')
  assert.equal(printableCorrectionText(conjugation), 'il chante')
  assert.equal(printableCorrectionText(identification), 'Le présent de l’indicatif')
})

test('la génération mélange les deux types à parts égales, y compris pour les comptes impairs', async () => {
  const { generateMixedQuestionnaire } = await import('../server/services/questionnaire.ts')
  for (const count of [1, 2, 9, 10, 99]) {
    const requests = []
    const questions = await generateMixedQuestionnaire({
      exerciseKind: 'mixed', questionCount: count, verbIds: [1], tenseIds: [2],
      identificationSource: 'literary-corpus', voiceMode: 'passive',
    }, async (request) => {
      requests.push(request)
      return Array.from({ length: request.questionCount }, () =>
        request.exerciseKind === 'conjugation' ? { ...conjugation } : { ...identification })
    })
    assert.equal(questions.length, count)
    for (let index = 1; index < questions.length; index++) {
      assert.notEqual(questions[index].exerciseKind, questions[index - 1].exerciseKind)
    }
    const conjugations = questions.filter(question => question.exerciseKind === 'conjugation')
    const identifications = questions.filter(question => question.exerciseKind === 'tense-identification')
    assert.ok(Math.abs(conjugations.length - identifications.length) <= 1)
    assert.ok(requests.every(request => request.questionCount > 0))
    assert.ok(requests.every(request => request.identificationSource === 'literary-corpus'))
    assert.ok(requests.every(request => request.voiceMode === 'passive'))
  }
})
