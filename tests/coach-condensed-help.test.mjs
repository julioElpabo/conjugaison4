import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { COACH_CONDENSED_TENSE_RULES, coachCondensedTenseRule } from '../shared/data/coach-condensed-tense-rules.ts'
import { buildCondensedTenseRuleHtml } from '../shared/utils/coach-help.ts'

const expectedKeys = [
  'indicatif:present', 'indicatif:imparfait', 'indicatif:futur', 'indicatif:passe simple',
  'indicatif:passe compose', 'indicatif:futur anterieur', 'indicatif:plus-que-parfait', 'indicatif:passe anterieur',
  'imperatif:present', 'imperatif:passe',
  'subjonctif:present', 'subjonctif:passe', 'subjonctif:imparfait', 'subjonctif:plus-que-parfait',
  'conditionnel:present', 'conditionnel:passe 1', 'conditionnel:passe 2',
  'participe:present', 'participe:passe', 'gerondif:present', 'gerondif:passe',
]

describe('aide très condensée par mode et temps', () => {
  it('couvre tous les 21 couples proposés dans les exercices', () => {
    assert.deepEqual(Object.keys(COACH_CONDENSED_TENSE_RULES).sort(), expectedKeys.sort())
    assert.ok(Object.values(COACH_CONDENSED_TENSE_RULES).every(item => item.rule && item.example))
  })

  it('explique le conditionnel présent avec le radical du futur et les terminaisons de l’imparfait', () => {
    const rule = coachCondensedTenseRule('conditionnel', 'présent')
    assert.equal(rule.rule, 'Radical du futur + terminaison de l’imparfait.')
    assert.equal(rule.example, 'chanter- + -ait = chanterait')
  })

  it('normalise les accents et produit un exemple fixe indépendant de la question', () => {
    assert.equal(coachCondensedTenseRule('gérondif', 'passé').example, 'en + ayant + chanté = en ayant chanté')
    const html = buildCondensedTenseRuleHtml('conditionnel', 'présent')
    assert.match(html, /chanter- \+ -ait = chanterait/u)
    assert.doesNotMatch(html, /manger|mangerait/u)
  })

  it('sépare chaque notion et les remarques particulières dans des paragraphes', () => {
    const imperfect = buildCondensedTenseRuleHtml('indicatif', 'imparfait')
    assert.match(imperfect, /<p>Forme avec « nous »[^<]+<\/p><p>Exception : être → ét-\.<\/p><p><strong>Exemple :<\/strong>/u)

    const imperative = buildCondensedTenseRuleHtml('impératif', 'présent')
    assert.match(imperative, /<p>Forme du présent[^<]+<\/p><p>Avec « tu »[^<]+<\/p><p><strong>Exemple :<\/strong>/u)
  })

  it('décompose clairement la formation du subjonctif imparfait', () => {
    const html = buildCondensedTenseRuleHtml('subjonctif', 'imparfait')
    assert.match(html, /<p>Prends la forme avec « il » au passé simple\.<\/p><p>Enlève le « t » final s’il y en a\.<\/p><p>Puis ajoute la terminaison du subjonctif imparfait\.<\/p>/u)
    assert.match(html, /il finit → fini- \+ -sse = que je finisse/u)
  })
})
