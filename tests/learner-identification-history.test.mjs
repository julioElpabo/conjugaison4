import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { learnerChallengeSnapshot, learnerQuestionSnapshot } from '../server/utils/learner-progress.ts'

const [space, classicWorkspace, wizardWorkspace, chat, progress] = await Promise.all([
  readFile(new URL('../app/components/learner/LearnerSpace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/ChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/composables/useLearnerProgress.ts', import.meta.url), 'utf8'),
])

test('enregistre le type et la source des défis de reconnaissance', () => {
  const snapshot = learnerChallengeSnapshot({
    verbIds: [1],
    tenseIds: [2, 3],
    questionCount: 10,
    exerciseKind: 'tense-identification',
    identificationSource: 'literary-corpus',
  })

  assert.equal(snapshot.exerciseKind, 'tense-identification')
  assert.equal(snapshot.identificationSource, 'literary-corpus')
  assert.match(classicWorkspace, /identificationSource: challenge\.value\.identificationSource/u)
  assert.match(wizardWorkspace, /identificationSource: challenge\.value\.identificationSource/u)
})

test('la reprise en chat conserve l’aide d’identification sans révéler la réponse', () => {
  assert.match(chat, /const usesIdentificationHelp = computed\(\(\) => isIdentificationExercise\.value\)/u)
  assert.match(chat, /usesIdentificationHelp\.value[\s\S]*literaryIdentificationCoachHelpBlocks/u)
  assert.match(chat, /:enable-automatic-audit="!usesIdentificationHelp"/u)
  assert.doesNotMatch(chat, /isIdentificationExercise\.value && Boolean\(helpQuestion\.value\?\.literaryCitation\)/u)
  assert.match(space, /reviewQuestions\.value\.map\(question => Number\(question\.verbeId\)\)/u)
})

test('les questions enregistrées conservent leur citation lors d’une reprise', () => {
  const literaryCitation = {
    before: 'Il ', target: 'viendrait', after: ' demain.',
    author: 'Une autrice', work: 'Une œuvre', chapter: null, sourceUrl: 'https://example.test',
  }
  const question = learnerQuestionSnapshot({
    titre: 'venir', consigne: 'Il viendrait demain.',
    reponses: ['conditionnel présent'], reponsesPourCorrige: ['Le présent du conditionnel'],
    literaryCitation,
  })
  assert.deepEqual(question.literaryCitation, literaryCitation)
  assert.match(progress, /literaryCitation: question\.literaryCitation/u)
})

test('les questions enregistrées conservent la forme à surligner lors d’une reprise', () => {
  const question = learnerQuestionSnapshot({
    titre: 'venir', consigne: 'il viendrait',
    reponses: ['conditionnel présent'], reponsesPourCorrige: ['Le présent du conditionnel'],
    conjugaison1: 'viendrait',
  })
  assert.equal(question.conjugaison1, 'viendrait')
  assert.match(progress, /conjugaison1: question\.conjugaison1/u)
})

test('affiche le type du défi sous le titre de la timeline MyPage', () => {
  assert.match(space, /challenge\.challenge\.exerciseKind === 'tense-identification'/u)
  assert.match(space, /ui\('Trouver le mode et les temps'\)/u)
  assert.match(space, /class="challenge-card__exercise-kind"/u)
  assert.match(space, /\{\{ challengeExerciseKindLabel\(challenge\) \}\}/u)
})
