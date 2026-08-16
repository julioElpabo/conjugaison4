import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import {
  CHAT_HELP_REMINDER_DELAY_MS,
  CHAT_HELP_REMINDER_INCORRECT_COUNT,
  nextConsecutiveIncorrectCount,
} from '../shared/utils/coach-help-reminder.ts'
import { COACH_EVENTS, REQUIRED_COACH_REPLY_EVENTS } from '../shared/types/coach.ts'
import { createCoachReaction } from '../shared/utils/coach-dialogue.ts'

describe('rappel de l’aide dans le chat', () => {
  it('se déclenche après trente secondes ou trois erreurs consécutives', () => {
    assert.equal(CHAT_HELP_REMINDER_DELAY_MS, 30_000)
    assert.equal(CHAT_HELP_REMINDER_INCORRECT_COUNT, 3)
    assert.equal(nextConsecutiveIncorrectCount(0, false), 1)
    assert.equal(nextConsecutiveIncorrectCount(2, false), 3)
    assert.equal(nextConsecutiveIncorrectCount(2, true), 0)
  })

  it('utilise une annonce propre au caractère', () => {
    assert.ok(COACH_EVENTS.includes('help-announcement'))
    assert.ok(REQUIRED_COACH_REPLY_EVENTS.includes('help-announcement'))
    const reaction = createCoachReaction({
      replies: [{ id: 12, eventType: 'help-announcement', content: 'Je vois que c’est un peu difficile.', weight: 1, isActive: true }],
      rules: [], assignments: [], media: [],
    }, 'help-announcement')
    assert.equal(reaction.text, 'Je vois que c’est un peu difficile.')
  })

  it('ouvre systématiquement le panneau de droite pour la question en cours', async () => {
    const component = await readFile(
      new URL('../app/components/exercise/ChatExercise.vue', import.meta.url),
      'utf8',
    )
    const suggestHelp = component.slice(
      component.indexOf('async function suggestHelp('),
      component.indexOf('function addAnswerComparison'),
    )
    assert.match(suggestHelp, /helpQuestionIndex\.value = null/u)
    assert.match(suggestHelp, /helpOpen\.value = true/u)
    assert.doesNotMatch(component, /chat-message--help-reminder/u)
    assert.doesNotMatch(component, /addHelpReminderCard/u)
    assert.match(suggestHelp, /if \(!offerConsultation\) await addCoachReaction\('help-announcement'/u)
    assert.match(component, /void suggestHelp\(true\)/u)
    assert.match(suggestHelp, /Tu veux consulter la conjugaison du verbe \{verb\} \?/u)
    assert.match(suggestHelp, /Tu peux aussi écouter la réponse\./u)
    assert.match(suggestHelp, /spokenAnswer/u)
    assert.match(suggestHelp, /usesDelayedAnswerAudio\.value/u)
    assert.match(suggestHelp, /helpConsultationOfferedQuestions\.has\(questionIndex\)/u)
    assert.match(suggestHelp, /helpConsultationOfferedQuestions\.add\(questionIndex\)/u)
  })

  it('place le porte-voix juste après les consignes avec les aides complètes', async () => {
    const component = await readFile(
      new URL('../app/components/exercise/ChatExercise.vue', import.meta.url),
      'utf8',
    )
    const askQuestion = component.slice(
      component.indexOf('async function askCurrentQuestion('),
      component.indexOf('async function runChatOpening'),
    )
    assert.match(component, /helpApproach === 'complete'[\s\S]*helpApproach === 'complete-avec-reponses'/u)
    assert.match(askQuestion, /speechOnly: true/u)
    assert.ok(
      askQuestion.indexOf('answerLine: true') < askQuestion.indexOf('speechOnly: true'),
      'le porte-voix doit suivre les deux bulles de consigne',
    )
  })

  it('utilise le profil vocal de Gabriel pour tous les coachs hommes', async () => {
    const component = await readFile(
      new URL('../app/components/exercise/ChatExercise.vue', import.meta.url),
      'utf8',
    )
    assert.match(component, /const GABRIEL_VOICE_SEED = 1_273_307_114/u)
    assert.match(component, /if \(props\.coach\.gender === 'male'\) return GABRIEL_VOICE_SEED/u)
  })
})
