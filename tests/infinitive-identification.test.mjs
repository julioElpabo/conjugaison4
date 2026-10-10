import assert from 'node:assert/strict'
import test from 'node:test'
import { exerciseKindsFor, questionExerciseKind, SELECTABLE_EXERCISE_KINDS } from '../shared/utils/exercise-kinds.ts'
import { parseDefiDefinition, parseQuestionnaireRequest, serializeDefi } from '../server/services/public-api-validation.ts'
import { learnerChallengeSnapshot, learnerQuestionSnapshot, learnerFormKey } from '../server/utils/learner-progress.ts'
import { infinitiveFormKey, infinitiveHelpVerb, infinitiveIdentificationGroupHints, infinitiveIdentificationEndingHints, infinitiveIdentificationHint, infinitiveIdentificationFeedback } from '../shared/utils/infinitive-identification.ts'
import { infinitiveIdentificationQuestion } from '../server/services/infinitive-identification.ts'
import { generateMixedQuestionnaire } from '../server/services/questionnaire.ts'
import { printableQuestionParts, printableCorrectionAnswers } from '../shared/utils/print-question.ts'
import { coachQuestionBubbles } from '../shared/utils/coach-question.ts'
import { validateAnswer } from '../shared/utils/answer.ts'

const source = {
  id: '1', verbeId: 1, tenseId: 1, personId: 4,
  titre: 'être', infinitif: 'être', consigne: 'je suis', pronom: 'je',
  temps: 'présent', mode: 'indicatif', conjugaison1: 'suis',
  reponses: ['présent indicatif'], reponsesPourCorrige: ['Le présent de l’indicatif'],
  radicalReference: { radical: 's', form: 'être' },
}
const base = parseDefiDefinition([[1], [1], 20])

test('les sept combinaisons survivent au partage et au suivi', () => {
  for (let mask = 1; mask < 8; mask++) {
    const exerciseKinds = SELECTABLE_EXERCISE_KINDS.filter((_, index) => mask & (1 << index))
    const config = parseDefiDefinition({ ...base, exerciseKinds })
    const restored = parseDefiDefinition(JSON.parse(serializeDefi(config)))
    assert.deepEqual(exerciseKindsFor(restored), exerciseKinds)
    assert.deepEqual(learnerChallengeSnapshot(restored).exerciseKinds, exerciseKinds)
    assert.deepEqual(parseQuestionnaireRequest(restoredWithoutPrint(config)).exerciseKinds, exerciseKinds)
  }
  assert.deepEqual(exerciseKindsFor({ exerciseKind: 'mixed' }), ['conjugation', 'tense-identification'])
})

function restoredWithoutPrint(config) {
  const { version, printOptions, ...request } = config
  return request
}

test('une sélection vide, dupliquée ou inconnue est refusée', () => {
  for (const exerciseKinds of [[], ['conjugation', 'conjugation'], ['other'], 'conjugation']) {
    assert.throws(() => parseDefiDefinition({ ...base, exerciseKinds }))
  }
})

test('les mélanges répartissent et entrelacent tous les types sélectionnés', async () => {
  for (let mask = 1; mask < 8; mask++) {
    const exerciseKinds = SELECTABLE_EXERCISE_KINDS.filter((_, index) => mask & (1 << index))
    for (const questionCount of [1, 2, 3, 20]) {
      const questions = await generateMixedQuestionnaire({ ...base, exerciseKinds, questionCount }, async request => {
        assert.equal(request.exerciseKinds, undefined)
        return Array.from({ length: request.questionCount }, (_, index) => ({ ...source, id: `${request.exerciseKind}-${index}` }))
      })
      assert.equal(questions.length, questionCount)
      const counts = exerciseKinds.map(kind => questions.filter(question => question.exerciseKind === kind).length)
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1)
      if (exerciseKinds.length > 1) {
        for (let index = 1; index < questions.length; index++) assert.notEqual(questions[index].exerciseKind, questions[index - 1].exerciseKind)
      }
    }
  }
})

test('une forme ambiguë accepte chaque infinitif et conserve toutes les corrections', () => {
  const question = infinitiveIdentificationQuestion(source, ['suivre', 'être'])
  assert.equal(question.exerciseKind, 'infinitive-identification')
  assert.deepEqual(question.reponsesPourCorrige, ['être', 'suivre'])
  assert.equal(validateAnswer(' SUIVRE ', question.reponses).isCorrect, true)
  assert.equal(validateAnswer('être', question.reponses).isCorrect, true)
  assert.equal(validateAnswer('avoir', question.reponses).isCorrect, false)
  assert.equal(question.radicalReference, undefined)
  assert.doesNotMatch(question.titre, /être|suivre/u)
  assert.equal(learnerQuestionSnapshot(question).exerciseKind, 'infinitive-identification')
  assert.notEqual(learnerFormKey(question, 'mixed'), learnerFormKey({ ...question, exerciseKind: 'conjugation' }, 'mixed'))
  assert.equal(printableQuestionParts(question, 'mixed').fillBlank, false)
  assert.match(printableQuestionParts(question, 'mixed').completion, /Trouver l’infinitif.*je suis/u)
  assert.equal(coachQuestionBubbles(question).formula, 'je suis')
  assert.deepEqual(printableCorrectionAnswers({ ...question, isCompound: true }), ['être', 'suivre'])
})

test('les graphies d’asseoir sont admises et les accents restent distinctifs', () => {
  const question = infinitiveIdentificationQuestion({ ...source, infinitif: 'asseoir' }, [])
  assert.equal(validateAnswer('assoir', question.reponses).isCorrect, true)
  assert.notEqual(infinitiveFormKey('il croit'), infinitiveFormKey('il croît'))
  assert.equal(infinitiveFormKey('Je m’assieds !'), infinitiveFormKey("je m'assieds"))
})

test('les indices ne révèlent pas le verbe et respectent toutes les réponses ambiguës', () => {
  const ambiguous = infinitiveIdentificationQuestion(source, ['suivre'])
  assert.match(infinitiveIdentificationHint(ambiguous), /plusieurs verbes/u)
  assert.doesNotMatch(infinitiveIdentificationHint(ambiguous), /être|suivre|-re/u)
  const compound = infinitiveIdentificationQuestion({ ...source, infinitif: 'comprendre', isCompound: true }, [])
  assert.match(infinitiveIdentificationHint(compound), /participe passé/u)
  assert.doesNotMatch(infinitiveIdentificationHint(compound), /comprendre/u)
  assert.match(infinitiveIdentificationFeedback(compound, 'avoir'), /Tu as donné l’infinitif de l’auxiliaire/u)
  const pronominal = infinitiveIdentificationQuestion({ ...source, verbeId: -12, infinitif: 'se souvenir' }, [])
  assert.match(infinitiveIdentificationHint(pronominal), /pronominal/u)
  assert.equal(validateAnswer('souvenir', pronominal.reponses).isCorrect, false)
  assert.equal(validateAnswer('se souvenir', pronominal.reponses).isCorrect, true)
  assert.equal(learnerQuestionSnapshot(pronominal).verbeId, -12)
  assert.deepEqual(learnerChallengeSnapshot({ ...base, verbIds: [-12] }).verbIds, [-12])
})

test('le groupe vient du catalogue et les terminaisons distinguent -ir, -oir et -ïr', () => {
  const verbs = [
    { infinitif: 'finir', groupeConjugaison: 2 },
    { infinitif: 'partir', groupeConjugaison: 3 },
    { infinitif: 'aller', groupeConjugaison: 3 },
    { infinitif: 'voir', groupeConjugaison: 3 },
    { infinitif: 'haïr', groupeConjugaison: 2 },
  ]
  for (const [infinitif, group, ending] of [['finir', 2, 'ir'], ['partir', 3, 'ir'], ['aller', 3, 'er'], ['voir', 3, 'oir'], ['haïr', 2, 'ïr']]) {
    const question = infinitiveIdentificationQuestion({ ...source, infinitif }, [])
    const hints = infinitiveIdentificationGroupHints(question, verbs)
    assert.deepEqual(hints, [`Ce verbe fait partie du ${group}e groupe.`])
    assert.deepEqual(infinitiveIdentificationEndingHints(question), [`Son infinitif se termine par « -${ending} ».`])
    assert.doesNotMatch(hints.join(' '), new RegExp(infinitif, 'u'))
  }
  assert.deepEqual(infinitiveIdentificationGroupHints({ ...source, reponsesPourCorrige: ['finir', 'partir'] }, verbs), [
    'Ce verbe fait partie du 2e groupe.', 'Ce verbe fait partie du 3e groupe.',
  ])
  assert.deepEqual(infinitiveIdentificationEndingHints({ ...source, reponsesPourCorrige: ['finir', 'partir', 'voir'] }), [
    'Son infinitif se termine par « -ir ».',
    'Son infinitif se termine par « -oir ».',
  ])
  assert.deepEqual(infinitiveIdentificationGroupHints({ ...source, reponsesPourCorrige: ['finir'] }, []), [])
})

test('les indices pronominaux réutilisent le verbe de base et préservent les accents', () => {
  const verbs = [{ infinitif: 'croître', meaning: 'Devenir plus grand.', groupeConjugaison: 3 }, { infinitif: 'croitre', meaning: 'Autre graphie.' }, { infinitif: 'écrire', groupeConjugaison: 3 }]
  assert.equal(infinitiveHelpVerb('se croître', verbs), verbs[0])
  assert.equal(infinitiveHelpVerb('s’écrire', verbs), verbs[2])
  const question = { ...source, reponsesPourCorrige: ['se croître'] }
  assert.deepEqual(infinitiveIdentificationGroupHints(question, verbs), ['Ce verbe fait partie du 3e groupe.'])
})

test('la correction ne propose plus de compléter « je dois » ou « il va »', () => {
  for (const infinitif of ['prendre', 'falloir']) {
    const question = infinitiveIdentificationQuestion({ ...source, infinitif }, [])
    assert.match(infinitiveIdentificationFeedback(question), /dictionnaire/u)
    assert.doesNotMatch(infinitiveIdentificationFeedback(question), /je dois|il va/u)
  }
})

test('les anciens historiques mixtes reconnaissent le type grâce à leur consigne', () => {
  assert.equal(questionExerciseKind({ instruction: 'Quel est le mode et le temps de cette forme conjuguée ?' }, 'mixed'), 'tense-identification')
  assert.equal(questionExerciseKind({}, 'mixed'), 'conjugation')
  assert.equal(printableQuestionParts({ ...source, instruction: 'Quel est le mode et le temps de cette forme conjuguée ?' }, 'mixed').fillBlank, false)
})
