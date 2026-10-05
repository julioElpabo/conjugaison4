import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { it } from 'node:test'
import { coachHelpQuestionVariables, automaticOrthographyHelpBlocks, visibleCoachHelpBlocks } from '../shared/utils/coach-help.ts'
import { buildConjugationBaseHtml } from '../shared/utils/conjugation-help.ts'
import { repairFeedbackComplement } from '../server/services/feedback-complement-repairs.ts'
import { withComplementPreposition } from '../shared/utils/complement-preposition.ts'

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/coach-feedback-regressions.json', import.meta.url), 'utf8'))
const values = id => { const { question, verb, tense } = fixtures[id]; return coachHelpQuestionVariables(question, verb, tense) }

it('explique mangèrent avec è, et conserve la bonne forme', () => {
  const v = values('389')
  assert.match(v.contextualBaseHelp, /suivie de <strong>è<\/strong>/u)
  assert.doesNotMatch(v.contextualBaseHelp, /suivie de <strong>i<\/strong>/u)
  const blocks = automaticOrthographyHelpBlocks(v)
  assert.match(blocks[0].content, /devant <strong>è<\/strong>/u)
  assert.deepEqual(fixtures['389'].question.reponsesPourCorrige, ['elles mangèrent'])
})

it('enseigne les impératifs irréguliers sans passer par le présent ni révéler la réponse', () => {
  for (const id of ['402', '403']) {
    const v = values(id)
    assert.match(v.completeAdviceHelp, /Impératif irrégulier|radical particulier/u)
    assert.doesNotMatch(v.completeAdviceHelp, /pars de la forme du présent|on enlève le.*s.*final/u)
    assert.doesNotMatch(v.completeAdviceHelp, /veuillez|ayez|Résultat/u)
  }
})

it('rappelle l’accent grave à l’impératif de élever', () => {
  assert.match(values('391').completeAdviceHelp, /accent grave.*<strong>è<\/strong>/u)
})

it('montre comment assembler les temps composés, puis la phrase complète dans le corrigé', () => {
  for (const id of ['379', '393', '401']) {
    const { question, verb, tense } = fixtures[id]
    const v = values(id)
    assert.match(v.completeAdviceHelp, /Écris le sujet/u)
    for (const answer of question.reponsesPourCorrige) assert.ok(!v.completeAdviceHelp.includes(answer))
    const html = buildConjugationBaseHtml(question, verb, tense)
    for (const answer of question.reponsesPourCorrige) {
      assert.ok(html.toLocaleLowerCase('fr').includes(answer.toLocaleLowerCase('fr')), answer)
    }
  }
  assert.match(values('401').contextualBaseHelp, /entièrement féminin/u)
})

it('rappelle le e de ranger dans l’aide condensée et replie le groupe', () => {
  const v = values('405')
  assert.match(v.condensedTenseRuleHelp, /garde le e devant a ou o/u)
  assert.match(v.condensedVerbGroupHelp, /^<details><summary>Groupe du verbe/u)
  const blocks = visibleCoachHelpBlocks('tres-condensee')
  assert.equal(blocks[0].content, '{condensedTenseRuleHelp}')
})

it('corrige les familles de compléments et les contractions sans généraliser aux usages valides', () => {
  const row = { infinitif: 'élever', texte: 'ma construction', texte_antepose: 'la construction', source: 'Catalogue pédagogique mineurs 2026', actif: 1 }
  assert.deepEqual(repairFeedbackComplement(row), { texte: 'ma poule', texte_antepose: 'la poule', actif: 1 })
  assert.equal(repairFeedbackComplement({ ...row, infinitif: 'tomber', texte: 'notre quille' }).actif, 0)
  assert.equal(repairFeedbackComplement({ ...row, infinitif: 'tomber', texte: 'un adversaire' }).actif, 1)
  assert.equal(repairFeedbackComplement({ ...row, source: 'Académie française' }).texte, row.texte)
  assert.equal(repairFeedbackComplement({ ...row, infinitif: 'souffrir', texte: 'mon attente', texte_antepose: 'l’attente' }).texte, 'ma douleur')
  assert.equal(repairFeedbackComplement({ ...row, infinitif: 'souffrir', texte: 'une autre attente', texte_antepose: 'l’autre attente' }).texte_antepose, 'l’autre douleur')
  for (const [before, after] of [['de des projets', 'de projets'], ['de des amis', 'd’amis'], ['des projets', 'des projets']]) {
    assert.equal(withComplementPreposition(before, 'de'), after)
  }
})
