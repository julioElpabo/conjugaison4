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
    assert.ok(
      suggestHelp.indexOf('helpOpen.value = true') < suggestHelp.indexOf("addCoachReaction('help-announcement'"),
      'le panneau doit s’ouvrir avant l’annonce du coach',
    )
    assert.match(component, /void suggestHelp\(true\)/u)
    assert.match(suggestHelp, /Tu veux consulter la conjugaison du verbe \{verb\} \?/u)
    assert.ok(
      suggestHelp.indexOf("addCoachReaction('help-announcement'") < suggestHelp.indexOf('consultVerbId: verbId'),
      'la proposition de consultation doit suivre le message d’inactivité',
    )
  })
})
