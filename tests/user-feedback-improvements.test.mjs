import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { repairMissingVerbAccentForm } from '../server/services/mail-request-repairs.ts'
import { allowsPedagogicalComplement } from '../shared/utils/pedagogical-complements.ts'
import { condensedConjugationExample } from '../shared/utils/condensed-conjugation-example.ts'
import { buildCondensedTenseRuleHtml } from '../shared/utils/coach-help.ts'
import { buildCompleteConjugationAdviceHtml } from '../shared/utils/conjugation-help.ts'
import { subjectPronounIssue, subjectPronounFeedback } from '../shared/utils/subject-pronoun-feedback.ts'
import { coachHelpProgressionNotice } from '../shared/utils/coach-help-progression.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'
import { learnerErrorDetails } from '../shared/utils/learner-error-diagnostics.ts'
import { createCoachDialogueState, createVariedCoachReaction } from '../shared/utils/coach-dialogue.ts'

describe('retours utilisateurs : accents du paradigme entier', () => {
  for (const [before, after, form, expected, coordinate] of [
    ['celebrer', 'célébrer', 'celebre', 'célèbre', { mode_name: 'indicatif', temps_name: 'présent', personne_id: 4 }],
    ['celebrer', 'célébrer', 'celebrons', 'célébrons', { mode_name: 'indicatif', temps_name: 'présent', personne_id: 7 }],
    ['celebrer', 'célébrer', 'celebrais', 'célébrais', { mode_name: 'indicatif', temps_name: 'imparfait', personne_id: 4 }],
    ['celebrer', 'célébrer', 'celebre', 'célèbre', { mode_name: 'impératif', temps_name: 'présent', personne_id: 5 }],
    ['celebrer', 'célébrer', 'celebrent', 'célèbrent', { mode_name: 'subjonctif', temps_name: 'présent', personne_id: 9 }],
    ['celebrer', 'célébrer', 'aurions celebré', 'aurions célébré', {}],
    ['celebrer', 'célébrer', 'célèbrerai', 'célèbrerai', { mode_name: 'indicatif', temps_name: 'futur', personne_id: 4 }],
    ['celebrer', 'célébrer', 'célébrerai', 'célébrerai', { mode_name: 'indicatif', temps_name: 'futur', personne_id: 4 }],
    ['caracteriser', 'caractériser', 'caracterisaient', 'caractérisaient', {}],
    ['controler', 'contrôler', 'ont controlé', 'ont contrôlé', {}],
  ]) {
    it(`répare ${form} et reste idempotent`, () => {
      assert.equal(repairMissingVerbAccentForm(form, before, after, coordinate), expected)
      assert.equal(repairMissingVerbAccentForm(expected, before, after, coordinate), expected)
    })
  }
})

describe('retours utilisateurs : aides utiles sans réponse finale', () => {
  it('donne une méthode exploitable pour nous fûmes sans afficher la réponse', () => {
    const question = { titre: 'être', consigne: 'nous | être | passé simple', infinitif: 'être', mode: 'indicatif', temps: 'passé simple', pronom: 'nous', personId: 7, conjugaison1: 'fûmes', reponses: ['nous fûmes'], reponsesPourCorrige: ['nous fûmes'], radicalReference: { kind: 'past-simple-il', form: 'fut', removableEnding: 'ut', radical: 'f', targetEnding: 'ûmes', validated: true } }
    const html = buildCompleteConjugationAdviceHtml(question)
    assert.match(html, /il fut/u)
    assert.match(html, /Enlève la terminaison <strong>-ut/u)
    assert.match(html, /-ûmes/u)
    assert.doesNotMatch(html, /fûmes|le radical à trouver|Résultat/u)
  })
  for (const [infinitive, group, tense, subject, model, example] of [
    ['finir', 2, 'présent', 'elle', 'grandir', 'elle grandit'],
    ['appeler', 1, 'futur', 'elle', 'jeter', 'jettera'],
    ['faire', 3, 'futur', 'je', 'prendre', 'je prendrai'],
    ['venir', 3, 'futur', 'vous', 'tenir', 'vous tiendrez'],
    ['ranger', 1, 'imparfait', 'je', 'chanter', 'je chantais'],
    ['chanter', 1, 'présent', 'elles', 'parler', 'elles parlent'],
  ]) {
    it(`adapte le modèle pour ${subject} ${infinitive} au ${tense}`, () => {
      const verb = { infinitif: infinitive, groupeConjugaison: group }
      const result = condensedConjugationExample('indicatif', tense, verb, subject)
      assert.equal(result.infinitive, model)
      assert.ok(result.example.includes(example), result.example)
      const html = buildCondensedTenseRuleHtml('indicatif', tense, verb, 'fr', subject)
      assert.match(html, new RegExp(`« ${model} »`))
      assert.ok(html.includes(example))
      assert.ok(!result.example.includes(infinitive), 'Le modèle ne révèle pas la réponse du verbe demandé')
    })
  }
  it('annonce la progression dans toutes les langues', () => {
    for (const locale of ['fr', 'en', 'de', 'it', 'es', 'nl', 'nl-NL']) {
      assert.ok(coachHelpProgressionNotice(locale, false))
      assert.notEqual(coachHelpProgressionNotice(locale, false), coachHelpProgressionNotice(locale, true))
    }
  })
})

describe('retours utilisateurs : pronoms et évaluation grammaticale', () => {
  const question = { titre: 'pouvoir', consigne: 'vous | pouvoir | plus-que-parfait', reponses: ['vous aviez pu'], reponsesPourCorrige: ['vous aviez pu'], pronom: 'vous', mode: 'indicatif', temps: 'plus-que-parfait', isCompound: true, infinitif: 'pouvoir' }
  it('repère une coquille isolée et ne valide pas automatiquement la réponse', () => {
    const issue = subjectPronounIssue('Vos aviez pu', question)
    assert.deepEqual(issue, { kind: 'typo', learner: 'vos', expected: 'vous' })
    assert.equal(validateConjugationAnswer('Vos aviez pu', question).isCorrect, false)
    assert.equal(validateConjugationAnswer('Vous aviez pu', question).isCorrect, true)
    const details = learnerErrorDetails('Vos aviez pu', question)
    assert.deepEqual(details.map(detail => detail.code), ['person.other_form'])
    assert.match(details[0].message, /conjugaison du verbe est correcte/u)
  })
  it('distingue un autre pronom d’une coquille', () => {
    const issue = subjectPronounIssue('Tu aviez pu', question)
    assert.equal(issue.kind, 'mismatch')
    assert.match(subjectPronounFeedback(issue), /forme verbale correspond à « vous »/u)
  })
  it('ne masque pas une erreur dans le verbe, le participe, le temps ou l’accent', () => {
    for (const answer of ['Vos avais pu', 'Vos aviez pue', 'Vos avez pu', 'Vos aviéz pu']) assert.equal(subjectPronounIssue(answer, question), null, answer)
    assert.equal(subjectPronounIssue('je savais', { ...question, pronom: 'je', reponses: ['je savais'] }), null)
    assert.equal(subjectPronounIssue('vos soyez', { ...question, mode: 'impératif' }), null)
  })
})

describe('retours utilisateurs : cohérence des exemples et rotation des médias', () => {
  it('exclut les compléments nominaux incompatibles à l’impératif de vouloir', () => {
    assert.equal(allowsPedagogicalComplement({ infinitif: 'vouloir', mode_name: 'impératif' }, { fonction_objet: 'cod' }), false)
    assert.equal(allowsPedagogicalComplement({ infinitif: 'vouloir', mode_name: 'indicatif' }, { fonction_objet: 'cod' }), true)
    assert.equal(allowsPedagogicalComplement({ infinitif: 'tomber', mode_name: 'indicatif' }, { fonction_objet: 'cod' }), false)
    assert.equal(allowsPedagogicalComplement({ infinitif: 'lire', mode_name: 'impératif' }, { fonction_objet: 'cod' }), true)
  })
  it('utilise tous les GIFs éligibles avant de les répéter', () => {
    const media = [1, 2, 3, 4, 5].map(id => ({ id, isActive: true, mediaType: 'animation', rightsStatus: id === 5 ? 'pending' : 'verified', safetyStatus: 'approved' }))
    const coach = { replies: [{ id: 1, eventType: 'correct', content: 'Bravo', isActive: true, weight: 1 }], media,
      assignments: media.map(item => ({ mediaId: item.id, eventType: 'correct', isActive: true, weight: 1 })),
      rules: [{ eventType: 'correct', animationProbability: 1, emojiProbability: 0, mediaProbability: 1 }] }
    const state = createCoachDialogueState()
    const sequence = Array.from({ length: 12 }, () => createVariedCoachReaction(coach, 'correct', {}, state, { random: () => 0, mediaAllowed: true }).media.id)
    for (let start = 0; start < 12; start += 4) assert.equal(new Set(sequence.slice(start, start + 4)).size, 4)
    assert.ok(!sequence.includes(5))
  })
})
