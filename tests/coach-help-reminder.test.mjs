import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CHAT_HELP_REMINDER_DELAY_MS,
  CHAT_HELP_REMINDER_INCORRECT_COUNT,
  coachHelpReminderMessage,
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

  it('adapte le conseil à l’état du volet', () => {
    assert.match(coachHelpReminderMessage(true), /regarder l’aide à droite/)
    assert.match(coachHelpReminderMessage(false), /tape « Aide »/)
  })

  it('utilise une annonce propre au caractère avant le conseil visuel', () => {
    assert.ok(COACH_EVENTS.includes('help-announcement'))
    assert.ok(REQUIRED_COACH_REPLY_EVENTS.includes('help-announcement'))
    const reaction = createCoachReaction({
      replies: [{ id: 12, eventType: 'help-announcement', content: 'Je vois que c’est un peu difficile.', weight: 1, isActive: true }],
      rules: [], assignments: [], media: [],
    }, 'help-announcement')
    assert.equal(reaction.text, 'Je vois que c’est un peu difficile.')
  })
})
