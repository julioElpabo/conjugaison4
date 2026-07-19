import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  coachQuestionBubbles,
  COMPOUND_TENSE_BLANK,
  COMPOUND_TENSE_GAP,
  SIMPLE_TENSE_BLANK,
} from '../shared/utils/coach-question.ts'

describe('questions affichées dans le chat', () => {
  it('réserve deux emplacements nettement séparés pour un temps composé', () => {
    const result = coachQuestionBubbles({
      consigne: 'ils … | manger | passé composé (indicatif)',
      pronom: 'ils',
      infinitif: 'manger',
      mode: 'indicatif',
      temps: 'passé composé',
      isCompound: true,
    })

    assert.equal(COMPOUND_TENSE_GAP, '\u00a0'.repeat(4))
    assert.equal(COMPOUND_TENSE_BLANK, `............${COMPOUND_TENSE_GAP}.......................`)
    assert.equal(result.sentence, `Ils${COMPOUND_TENSE_GAP}${COMPOUND_TENSE_BLANK}`)
  })

  it('conserve un seul emplacement pour un temps simple', () => {
    const result = coachQuestionBubbles({
      consigne: 'ils … | manger | imparfait (indicatif)',
      pronom: 'ils',
      infinitif: 'manger',
      mode: 'indicatif',
      temps: 'imparfait',
      isCompound: false,
    })

    assert.equal(result.sentence, `Ils ${SIMPLE_TENSE_BLANK}`)
  })

  it('masque le mode indicatif quand la session ne contient que ce mode', () => {
    const result = coachQuestionBubbles({
      consigne: 'je | aller | futur (indicatif)',
      pronom: 'je',
      infinitif: 'aller',
      mode: 'indicatif',
      temps: 'futur',
      isCompound: false,
    }, { omitIndicativeMode: true })

    assert.equal(result.formula, 'je | aller | futur')
  })
})
