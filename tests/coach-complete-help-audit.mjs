import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { coachHelpQuestionVariables, conditionalCoachHelpBlocks, renderCoachHelpContent } from '../shared/utils/coach-help.ts'

function verb(infinitif, overrides = {}) {
  return {
    id: 1, infinitif, meaning: `Définition de ${infinitif}.`, participePresent: '', participePasse: '', auxiliaire: 'avoir',
    groupeConjugaison: 3, familleConjugaison: '', terminaison: infinitif.slice(-2), typePronominal: 'aucun',
    estImpersonnel: false, estDefectif: false, personnesDisponibles: [], typeHInitial: null, niveauDifficulte: 2,
    niveauCecrl: 'A2', rangFrequence: null, registrePrincipal: 'courant', formeCanonique: infinitif,
    statutValidation: 'valide', particularites: [], niveauxScolaires: [], parcoursCif: [], categoriesSemantiques: [],
    ...overrides,
  }
}

function question(infinitif, answer, overrides = {}) {
  const subject = overrides.pronom ?? 'nous'
  return {
    titre: 'Question', consigne: '', reponses: [answer], reponsesPourCorrige: [subject ? `${subject} ${answer}` : answer],
    infinitif, pronom: subject, saisiePrefixe: subject, mode: 'indicatif', temps: 'présent', conjugaison1: answer,
    isCompound: false, ...overrides,
  }
}

const scenarios = [
  { name: 'chanter — présent régulier', verb: verb('chanter', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'chanté' }), question: question('chanter', 'chantons'), expected: [/infinitif/iu, /radical/iu, /terminaison/iu] },
  { name: 'manger — imparfait — maintien du e', verb: verb('manger', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'mangé', particularites: ['ger'] }), question: question('manger', 'mangions', { temps: 'imparfait' }), expected: [/radical/iu, /terminaison/iu] },
  { name: 'commencer — présent — cédille', verb: verb('commencer', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'commencé', particularites: ['cer'] }), question: question('commencer', 'commençons'), expected: [/radical/iu, /terminaison/iu] },
  { name: 'finir — présent — deuxième groupe', verb: verb('finir', { groupeConjugaison: 2, terminaison: 'ir', participePasse: 'fini' }), question: question('finir', 'finissons'), expected: [/radical/iu, /terminaison/iu] },
  { name: 'choisir — imparfait — radical en iss', verb: verb('choisir', { groupeConjugaison: 2, terminaison: 'ir', participePasse: 'choisi' }), question: question('choisir', 'choisissiez', { pronom: 'vous', temps: 'imparfait' }), expected: [/radical/iu, /terminaison/iu] },
  { name: 'venir — futur — radical irrégulier', verb: verb('venir', { terminaison: 'ir', participePasse: 'venu', auxiliaire: 'être', familleConjugaison: 'venir-tenir' }), question: question('venir', 'viendras', { pronom: 'tu', temps: 'futur' }), expected: [/radical/iu, /terminaison/iu] },
  { name: 'être — imparfait — radical exceptionnel', verb: verb('être', { terminaison: 're', participePresent: 'étant', participePasse: 'été' }), question: question('être', 'était', { pronom: 'il', temps: 'imparfait' }), expected: [/radical|forme.*modèle/iu, /terminaison|apprends/iu] },
  { name: 'avoir — impératif présent — forme irrégulière', verb: verb('avoir', { terminaison: 'oir', participePresent: 'ayant', participePasse: 'eu' }), question: question('avoir', 'aie', { pronom: 'tu', mode: 'impératif' }), expected: [/impératif/iu, /forme.*repère|apprends/iu] },
  { name: 'savoir — impératif présent — forme irrégulière', verb: verb('savoir', { terminaison: 'oir', participePresent: 'sachant', participePasse: 'su' }), question: question('savoir', 'sachez', { pronom: 'vous', mode: 'impératif' }), expected: [/impératif/iu, /forme.*repère|apprends/iu] },
  { name: 'aller — subjonctif présent — deux radicaux', verb: verb('aller', { terminaison: 'er', participePasse: 'allé', auxiliaire: 'être' }), question: question('aller', 'allions', { mode: 'subjonctif', pronom: 'nous', radicalReference: { kind: 'present-nous', label: 'nous au présent', form: 'allons', removableEnding: 'ons', radical: 'all', targetEnding: 'ions', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous', strategy: 'remove-ending', validated: true, subjunctivePresentReferences: [{ subject: 'ils', form: 'vont' }, { subject: 'nous', form: 'allons' }] } }), expected: [/subjonctif/iu, /forme.*repère/iu, /personne demandée/iu] },
  { name: 'prendre — passé simple — série en i', verb: verb('prendre', { terminaison: 're', participePasse: 'pris', familleConjugaison: 'prendre' }), question: question('prendre', 'prirent', { pronom: 'ils', temps: 'passé simple', radicalReference: { kind: 'past-simple-il', label: 'il au passé simple', form: 'prit', removableEnding: 't', radical: 'pri', targetEnding: 'rent', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il', strategy: 'remove-ending', validated: true } }), expected: [/forme.*repère/iu, /passé simple/iu, /terminaison/iu] },
  { name: 'prendre — conditionnel présent', verb: verb('prendre', { terminaison: 're', participePasse: 'pris' }), question: question('prendre', 'prendraient', { pronom: 'ils', mode: 'conditionnel', temps: 'présent' }), expected: [/radical du futur/iu, /terminaison de l’imparfait/iu, /exemple/iu] },
  { name: 'partir — passé composé avec être', verb: verb('partir', { terminaison: 'ir', participePasse: 'parti', auxiliaire: 'être' }), question: question('partir', 'est partie', { pronom: 'elle', temps: 'passé composé', isCompound: true }), expected: [/auxiliaire/iu, /être/iu, /participe passé/iu, /accord/iu] },
  { name: 'se lever — passé composé pronominal', verb: verb('se lever', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'levé', auxiliaire: 'être', typePronominal: 'essentiel', isPronominalForm: true }), question: question('se lever', 'se sont levées', { pronom: 'elles', temps: 'passé composé', isCompound: true }), expected: [/auxiliaire/iu, /être/iu, /pronominal|pronom réfléchi/iu, /accord/iu] },
  { name: 'manger — passé composé — COD placé avant', verb: verb('manger', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'mangé' }), question: question('manger', 'a mangée', { pronom: 'elle', temps: 'passé composé', isCompound: true, agreementReminder: { kind: 'cod-before', infinitive: 'manger', complement: 'la pomme', participle: 'mangée', gender: 'feminin', number: 'singulier' }, complement: 'la pomme', complementFunction: 'cod', complementPosition: 'before' }), expected: [/COD/iu, /placé avant/iu, /accord/iu, /Ne le confonds pas avec le sujet/iu] },
  { name: 'parler — passé composé — COI sans accord', verb: verb('parler', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'parlé' }), question: question('parler', 'a parlé', { pronom: 'elle', temps: 'passé composé', isCompound: true, agreementReminder: { kind: 'coi', infinitive: 'parler', complement: 'à ses amis', participle: 'parlé', gender: 'masculin', number: 'pluriel' }, complement: 'à ses amis', complementFunction: 'coi', complementPosition: 'before' }), expected: [/COI/iu, /pas.*accord|ne commande pas l’accord/iu] },
  { name: 'être — participe présent', verb: verb('être', { terminaison: 're', participePresent: 'étant', participePasse: 'été' }), question: question('être', 'étant', { pronom: '', mode: 'participe', temps: 'présent' }), expected: [/participe/iu, /apprends|forme.*repère|irrégulier/iu] },
  { name: 'avoir — gérondif présent', verb: verb('avoir', { terminaison: 'oir', participePresent: 'ayant', participePasse: 'eu' }), question: question('avoir', 'en ayant', { pronom: '', mode: 'gérondif', temps: 'présent' }), expected: [/gérondif|participe présent/iu, /apprends|forme.*repère|irrégulier/iu] },
  { name: 'falloir — conditionnel — impersonnel', verb: verb('falloir', { terminaison: 'oir', participePasse: 'fallu', estImpersonnel: true, estDefectif: true }), question: question('falloir', 'faudrait', { pronom: 'il', mode: 'conditionnel' }), expected: [/radical du futur/iu, /terminaison de l’imparfait/iu] },
  { name: 'payer — futur — variantes admises', verb: verb('payer', { groupeConjugaison: 1, terminaison: 'er', participePasse: 'payé', particularites: ['formes-alternatives'] }), question: question('payer', 'paiera', { pronom: 'il', temps: 'futur', reponses: ['paiera', 'payera'], reponsesPourCorrige: ['il paiera', 'il payera'] }), answers: ['paiera', 'payera'], expected: [/radical/iu, /terminaison/iu] },
]

function renderScenario(scenario) {
  const values = coachHelpQuestionVariables(scenario.question, scenario.verb)
  const conditional = conditionalCoachHelpBlocks('complete', values)
    .map(block => renderCoachHelpContent(block.content, values, block.explanationApproach))
    .join('')
  return `${renderCoachHelpContent('{completeAdviceHelp}', values, 'cif-falc')}${conditional}`
}

function visibleText(html) {
  return html.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
}

function normalized(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
}

function containsWholeAnswer(text, answer) {
  const escaped = normalized(answer).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&').replace(/\s+/gu, '\\s+')
  return new RegExp(`(^|[^a-z])${escaped}(?=$|[^a-z])`, 'u').test(normalized(text))
}

describe('audit pédagogique de l’aide complète sans réponses', () => {
  it('couvre vingt cas de groupes, temps et difficultés différents', () => {
    assert.equal(scenarios.length, 20)
    assert.deepEqual([...new Set(scenarios.map(item => item.verb.groupeConjugaison))].sort(), [1, 2, 3])
    assert.ok(scenarios.some(item => item.question.isCompound))
    assert.ok(scenarios.some(item => item.verb.typePronominal !== 'aucun'))
    assert.ok(scenarios.some(item => item.question.mode === 'subjonctif'))
  })

  for (const scenario of scenarios) {
    describe(scenario.name, () => {
      const html = renderScenario(scenario)
      const text = visibleText(html)

      it('présente une démarche structurée et lisible', () => {
        assert.doesNotMatch(html, /undefined|null|\{[^}]+\}|<p>\s*<\/p>/u)
        assert.doesNotMatch(text, /\bau (?:imparfait|impératif)\b/iu)
        assert.ok((text.match(/\S+/gu) || []).length <= 520, `Aide trop longue : ${text}`)
        assert.match(html, /<(?:ol|figure|table|blockquote)>/u)
        assert.match(text, /apprends|pars|repère|trouve|ajoute|conjugue|choisis|vérifie/iu)
        if (text.includes('Ajoute la terminaison qui correspond à la personne demandée au radical que tu as trouvé')) {
          assert.match(text, /Ajoute la terminaison qui correspond à la personne demandée au radical que tu as trouvé\./u)
        }
      })

      it('donne des indications grammaticalement pertinentes', () => {
        for (const expectation of scenario.expected) {
          assert.match(text, expectation, `Élément grammatical absent dans : ${text}`)
        }
      })

      it('ne montre pas la réponse finale', () => {
        assert.doesNotMatch(html, /<mark>|Résultat|<i>✓<\/i>/u)
        for (const answer of scenario.answers || [scenario.question.conjugaison1]) {
          assert.equal(containsWholeAnswer(text, answer), false, `La réponse « ${answer} » est visible dans : ${text}`)
        }
      })
    })
  }
})
