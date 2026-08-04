import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  GUIDED_TOUR_REMINDER_VISIT_COUNT,
  parseGuidedTourReminderState,
  postponedGuidedTourState,
  registerGuidedTourHomepageVisit,
  shouldRemindAboutGuidedTour,
} from '../shared/utils/guided-tour-reminder.ts'

describe('rappel de la visite guidée', () => {
  it('ne repropose la visite qu’à la dixième visite après le report', () => {
    let state = postponedGuidedTourState()

    for (let visit = 1; visit < GUIDED_TOUR_REMINDER_VISIT_COUNT; visit += 1) {
      state = registerGuidedTourHomepageVisit(state)
      assert.equal(shouldRemindAboutGuidedTour(state), false)
    }

    state = registerGuidedTourHomepageVisit(state)
    assert.equal(shouldRemindAboutGuidedTour(state), true)
  })

  it('ne repropose plus automatiquement la visite après le rappel', () => {
    const state = registerGuidedTourHomepageVisit({
      visitsSincePostponement: GUIDED_TOUR_REMINDER_VISIT_COUNT,
      reminderShown: true,
    })

    assert.deepEqual(state, {
      visitsSincePostponement: GUIDED_TOUR_REMINDER_VISIT_COUNT,
      reminderShown: true,
    })
    assert.equal(shouldRemindAboutGuidedTour(state), false)
  })

  it('ignore un état stocké invalide', () => {
    assert.equal(parseGuidedTourReminderState('{"visitsSincePostponement":-1,"reminderShown":false}'), null)
    assert.equal(parseGuidedTourReminderState('invalide'), null)
  })
})
