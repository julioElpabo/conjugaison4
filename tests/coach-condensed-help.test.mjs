import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { COACH_CONDENSED_TENSE_RULES, coachCondensedTenseRule } from '../shared/data/coach-condensed-tense-rules.ts'
import { buildCondensedTenseRuleHtml, buildCondensedVerbGroupHtml } from '../shared/utils/coach-help.ts'

const expectedKeys = [
  'indicatif:present', 'indicatif:futur proche', 'indicatif:imparfait', 'indicatif:futur', 'indicatif:passe simple',
  'indicatif:passe compose', 'indicatif:futur anterieur', 'indicatif:plus-que-parfait', 'indicatif:passe anterieur',
  'imperatif:present', 'imperatif:passe',
  'subjonctif:present', 'subjonctif:passe', 'subjonctif:imparfait', 'subjonctif:plus-que-parfait',
  'conditionnel:present', 'conditionnel:passe 1', 'conditionnel:passe 2',
  'participe:present', 'participe:passe', 'gerondif:present', 'gerondif:passe',
]

describe('aide très condensée par mode et temps', () => {
  it('couvre tous les 22 couples proposés dans les exercices', () => {
    assert.deepEqual(Object.keys(COACH_CONDENSED_TENSE_RULES).sort(), expectedKeys.sort())
    assert.ok(Object.values(COACH_CONDENSED_TENSE_RULES).every(item => item.rule && item.example))
  })

  it('explique la construction du futur proche et la place du pronom réfléchi', () => {
    const rule = coachCondensedTenseRule('indicatif', 'futur proche')
    assert.equal(rule.rule, 'Verbe « aller » au présent + infinitif du verbe.')
    assert.deepEqual(rule.notes, ["Ce n'est pas un temps comme les autres. Il est utilisé pour une action proche."])
    const html = buildCondensedTenseRuleHtml('indicatif', 'futur proche', {
      infinitif: 'se lever',
      typePronominal: 'essentiel',
    })
    assert.match(html, /place « me, te, se, nous, vous, se » devant l’infinitif/u)
    assert.match(html, /je vais \+ me lever = je vais me lever/u)
  })

  it('explique le conditionnel présent avec le radical du futur et les terminaisons de l’imparfait', () => {
    const rule = coachCondensedTenseRule('conditionnel', 'présent')
    assert.equal(rule.rule, 'Radical du futur + terminaison de l’imparfait.')
    assert.equal(rule.example, 'chanter- + -ait = chanterait')
  })

  it('traduit les explications condensées et conserve seulement les formes françaises étudiées', () => {
    const verb = { infinitif: 'écouter', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir' }
    const germanGroup = buildCondensedVerbGroupHtml(verb, {}, 'de')
    const germanFuture = buildCondensedTenseRuleHtml('indicatif', 'futur', verb, 'de')
    assert.match(germanGroup, /gehört zur <strong>1\. Verbgruppe<\/strong>/u)
    assert.match(germanGroup, /Die Konjugation ist normalerweise regelmäßig/u)
    assert.doesNotMatch(germanGroup, /appartient|Conjugaison|Attention/u)
    assert.match(germanFuture, /Futurstamm/u)
    assert.match(germanFuture, /<strong>Beispiel:<\/strong>/u)
    assert.match(germanFuture, /chanter- \+ -ons = chanterons/u)
    assert.doesNotMatch(germanFuture, /Radical du futur|Exemple :/u)

    for (const locale of ['de', 'en', 'it', 'es']) {
      const html = buildCondensedTenseRuleHtml('indicatif', 'imparfait', verb, locale)
      assert.doesNotMatch(html, /Forme avec|terminaison de l’imparfait|Exemple :/u)
    }
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
