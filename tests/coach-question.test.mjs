import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  coachQuestionBubbles,
  COMPOUND_TENSE_BLANK,
  COMPOUND_TENSE_GAP,
  PAST_GERUND_BLANK,
  PRESENT_GERUND_BLANK,
  SIMPLE_TENSE_BLANK,
} from '../shared/utils/coach-question.ts'
import { formatConjugationQuestion } from '../server/services/question-formatter.ts'

function blankGroups(sentence) {
  return sentence.match(/\.{3,}/gu) || []
}

describe('questions affichées dans le chat', () => {
  it('affiche la personne de l’impératif dans la question sans l’ajouter devant la réponse', () => {
    const cases = [
      { pronoun: 'tu', personId: 5, tense: 'présent', form: 'mange', compound: 0, blank: SIMPLE_TENSE_BLANK },
      { pronoun: 'nous', personId: 9, tense: 'présent', form: 'mangeons', compound: 0, blank: SIMPLE_TENSE_BLANK },
      { pronoun: 'vous', personId: 10, tense: 'présent', form: 'mangez', compound: 0, blank: SIMPLE_TENSE_BLANK },
      { pronoun: 'tu', personId: 5, tense: 'passé', form: 'aie mangé', compound: 1, blank: COMPOUND_TENSE_BLANK },
      { pronoun: 'nous', personId: 9, tense: 'passé', form: 'ayons mangé', compound: 1, blank: COMPOUND_TENSE_BLANK },
      { pronoun: 'vous', personId: 10, tense: 'passé', form: 'ayez mangé', compound: 1, blank: COMPOUND_TENSE_BLANK },
    ]

    for (const testCase of cases) {
      const question = formatConjugationQuestion({
        id: testCase.personId,
        verbe_id: 12,
        personne_id: testCase.personId,
        temp_id: testCase.compound ? 10 : 9,
        conjugaison1: testCase.form,
        conjugaison2: '',
        conjugaison3: '',
        infinitif: 'manger',
        auxiliaire: 'avoir',
        participe_passe: 'mangé',
        temps_name: testCase.tense,
        is_compound: testCase.compound,
        mode_name: 'impératif',
      }, testCase.pronoun)
      const result = coachQuestionBubbles(question)

      assert.equal(question.saisiePrefixe, '')
      assert.equal(question.consigne, `manger | ${testCase.tense} (impératif)`)
      assert.equal(result.formula, `${testCase.pronoun} | manger | impératif ${testCase.tense}`)
      assert.equal(result.sentence, testCase.blank)
    }
  })

  it('affiche explicitement la personne pour voir à l’impératif présent', () => {
    const result = coachQuestionBubbles({
      consigne: 'voir | présent (impératif)',
      pronom: 'vous',
      saisiePrefixe: '',
      infinitif: 'voir',
      mode: 'impératif',
      temps: 'présent',
      conjugaison1: 'voyez',
      isCompound: false,
    })

    assert.equal(result.formula, 'vous | voir | impératif présent')
    assert.equal(result.sentence, SIMPLE_TENSE_BLANK)
  })

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

  it('affiche un seul champ pour « il prend »', () => {
    const result = coachQuestionBubbles({
      consigne: 'il … | prendre | présent (indicatif)',
      pronom: 'il',
      infinitif: 'prendre',
      mode: 'indicatif',
      temps: 'présent',
      isCompound: false,
      conjugaison1: 'prend',
    })

    assert.equal(result.sentence, `Il ${SIMPLE_TENSE_BLANK}`)
    assert.deepEqual(blankGroups(result.sentence), [SIMPLE_TENSE_BLANK])
  })

  it('affiche un seul champ pour « mangeant » au participe présent', () => {
    const result = coachQuestionBubbles({
      consigne: 'Le participe présent de Manger',
      infinitif: 'manger',
      mode: 'participe',
      temps: 'présent',
      isCompound: false,
      conjugaison1: 'Mangeant',
    })

    assert.equal(result.sentence, SIMPLE_TENSE_BLANK)
    assert.deepEqual(blankGroups(result.sentence), [SIMPLE_TENSE_BLANK])
  })

  it('affiche deux champs séparés pour « en mangeant » au gérondif présent', () => {
    const result = coachQuestionBubbles({
      consigne: 'Le gérondif présent de Manger',
      infinitif: 'manger',
      mode: 'gérondif',
      temps: 'présent',
      isCompound: false,
      conjugaison1: 'En mangeant',
    })

    assert.equal(result.sentence, PRESENT_GERUND_BLANK)
    assert.deepEqual(blankGroups(result.sentence), ['............', '.......................'])
  })

  it('affiche trois champs séparés pour « en ayant pris » au gérondif passé', () => {
    const result = coachQuestionBubbles({
      consigne: 'Le gérondif passé de Prendre',
      infinitif: 'prendre',
      mode: 'gérondif',
      temps: 'passé',
      isCompound: true,
      conjugaison1: 'En ayant pris',
    })

    assert.equal(result.sentence, PAST_GERUND_BLANK)
    assert.deepEqual(blankGroups(result.sentence), ['............', '............', '.......................'])
  })

  it('compte aussi les mots d’une forme pronominale comme « en se lavant »', () => {
    const result = coachQuestionBubbles({
      consigne: 'Le gérondif présent de Se laver',
      infinitif: 'se laver',
      mode: 'gérondif',
      temps: 'présent',
      isCompound: false,
      conjugaison1: 'En se lavant',
    })

    assert.deepEqual(blankGroups(result.sentence), ['............', '............', '.......................'])
  })

  it('garde exactement deux champs pour « il a pris »', () => {
    const result = coachQuestionBubbles({
      consigne: 'il … | prendre | passé composé (indicatif)',
      pronom: 'il',
      infinitif: 'prendre',
      mode: 'indicatif',
      temps: 'passé composé',
      isCompound: true,
      conjugaison1: 'a pris',
    })

    assert.equal(result.sentence, `Il${COMPOUND_TENSE_GAP}${COMPOUND_TENSE_BLANK}`)
    assert.deepEqual(blankGroups(result.sentence), ['............', '.......................'])
  })

  it('introduit le subjonctif présent avec « Il faut que »', () => {
    const result = coachQuestionBubbles({
      consigne: 'je | prendre | présent (subjonctif)',
      pronom: 'je',
      infinitif: 'prendre',
      mode: 'subjonctif',
      temps: 'présent',
      isCompound: false,
      conjugaison1: 'prenne',
    })

    assert.equal(result.sentence, `Il faut que je ${SIMPLE_TENSE_BLANK}`)
  })

  it('introduit le subjonctif passé avec « Il faut qu’il » et deux champs', () => {
    const result = coachQuestionBubbles({
      consigne: 'il | prendre | passé (subjonctif)',
      pronom: 'il',
      infinitif: 'prendre',
      mode: 'subjonctif',
      temps: 'passé',
      isCompound: true,
      conjugaison1: 'ait pris',
    })

    assert.equal(result.sentence, `Il faut qu'il${COMPOUND_TENSE_GAP}${COMPOUND_TENSE_BLANK}`)
  })

  it('introduit le subjonctif imparfait avec « Il fallait qu’elle »', () => {
    const result = coachQuestionBubbles({
      consigne: 'elle … | prendre | imparfait (subjonctif)',
      pronom: 'elle',
      infinitif: 'prendre',
      mode: 'subjonctif',
      temps: 'imparfait',
      isCompound: false,
      conjugaison1: 'prît',
    })

    assert.equal(result.sentence, `Il fallait qu'elle ${SIMPLE_TENSE_BLANK}`)
  })

  it('introduit le subjonctif plus-que-parfait avec « Il fallait que »', () => {
    const result = coachQuestionBubbles({
      consigne: 'nous | prendre | plus-que-parfait (subjonctif)',
      pronom: 'nous',
      infinitif: 'prendre',
      mode: 'subjonctif',
      temps: 'plus-que-parfait',
      isCompound: true,
      conjugaison1: 'eussions pris',
    })

    assert.equal(result.sentence, `Il fallait que nous${COMPOUND_TENSE_GAP}${COMPOUND_TENSE_BLANK}`)
  })

  it('conserve le cadre naturel d’une relative au subjonctif', () => {
    const question = formatConjugationQuestion({
      id: 1,
      verbe_id: 12,
      personne_id: 5,
      temp_id: 10,
      conjugaison1: 'aies démoli',
      conjugaison2: '',
      conjugaison3: '',
      infinitif: 'démolir',
      auxiliaire: 'avoir',
      participe_passe: 'démoli',
      temps_name: 'passé',
      is_compound: 1,
      mode_name: 'subjonctif',
      complement_position: 'before',
      complement_anteposed: "l'autre maison",
      complement_gender: 'feminin',
      complement_number: 'singulier',
      complement_function: 'cod',
    }, 'tu')

    const result = coachQuestionBubbles(question)
    assert.equal(result.sentence, `C'est la seule autre maison que tu${COMPOUND_TENSE_GAP}${COMPOUND_TENSE_BLANK}`)
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
