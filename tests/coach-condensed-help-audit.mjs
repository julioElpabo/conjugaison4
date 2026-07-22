import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildCondensedTenseRuleHtml, buildCondensedVerbGroupHtml } from '../shared/utils/coach-help.ts'

const scenarios = [
  {
    name: 'chanter — 1er groupe — présent — débutant',
    verb: { infinitif: 'chanter', groupeConjugaison: 1 },
    mode: 'indicatif', tense: 'présent', subject: 'nous', answer: 'chantons',
    expected: [/1er groupe/u, /radical/u, /terminaison/u],
  },
  {
    name: 'manger — 1er groupe — imparfait — difficulté orthographique',
    verb: { infinitif: 'manger', groupeConjugaison: 1 },
    mode: 'indicatif', tense: 'imparfait', subject: 'nous', answer: 'mangions',
    expected: [/forme avec « nous »/iu, /sans « -ons »/u],
  },
  {
    name: 'commencer — 1er groupe — présent — cédille',
    verb: { infinitif: 'commencer', groupeConjugaison: 1 },
    mode: 'indicatif', tense: 'présent', subject: 'nous', answer: 'commençons',
    expected: [/radical/u, /terminaison/u],
  },
  {
    name: 'finir — 2e groupe — présent — intermédiaire',
    verb: { infinitif: 'finir', groupeConjugaison: 2 },
    mode: 'indicatif', tense: 'présent', subject: 'nous', answer: 'finissons',
    expected: [/2e groupe/u, /modèle de « finir »/u, /-iss-/u],
  },
  {
    name: 'choisir — 2e groupe — imparfait — radical en -iss-',
    verb: { infinitif: 'choisir', groupeConjugaison: 2 },
    mode: 'indicatif', tense: 'imparfait', subject: 'vous', answer: 'choisissiez',
    expected: [/forme avec « nous »/iu, /-iss-/u],
  },
  {
    name: 'venir — 3e groupe — futur — radical irrégulier',
    verb: { infinitif: 'venir', groupeConjugaison: 3 },
    mode: 'indicatif', tense: 'futur', subject: 'tu', answer: 'viendras',
    expected: [/3e groupe/u, /irréguli/u, /formes repères/iu],
  },
  {
    name: 'écrire — 3e groupe en -re — futur — retrait du e final',
    verb: { infinitif: 'écrire', groupeConjugaison: 3 },
    mode: 'indicatif', tense: 'futur', subject: 'nous', answer: 'écrirons',
    expected: [/sans le « e » final/u, /formes repères/iu],
  },
  {
    name: 'prendre — 3e groupe — passé simple — série irrégulière',
    verb: { infinitif: 'prendre', groupeConjugaison: 3 },
    mode: 'indicatif', tense: 'passé simple', subject: 'ils', answer: 'prirent',
    expected: [/radical du passé simple/iu, /terminaison de sa série/iu, /formes repères/iu],
  },
  {
    name: 'être — 3e groupe — imparfait — exception explicite',
    verb: { infinitif: 'être', groupeConjugaison: 3 },
    mode: 'indicatif', tense: 'imparfait', subject: 'il', answer: 'était',
    expected: [/Exception : être → ét-/u],
  },
  {
    name: 'avoir — 3e groupe — impératif — forme exceptionnelle',
    verb: { infinitif: 'avoir', groupeConjugaison: 3 },
    mode: 'impératif', tense: 'présent', subject: 'tu', answer: 'aie',
    expected: [/exception|irréguli/iu],
    forbidden: [/Forme du présent avec « tu », « nous » ou « vous »/u],
  },
  {
    name: 'savoir — 3e groupe — impératif — forme exceptionnelle',
    verb: { infinitif: 'savoir', groupeConjugaison: 3 },
    mode: 'impératif', tense: 'présent', subject: 'vous', answer: 'sachez',
    expected: [/exception|irréguli/iu],
    forbidden: [/Forme du présent avec « tu », « nous » ou « vous »/u],
  },
  {
    name: 'aller — 3e groupe — subjonctif — double radical',
    verb: { infinitif: 'aller', groupeConjugaison: 3 },
    mode: 'subjonctif', tense: 'présent', subject: 'nous', answer: 'allions',
    expected: [/formes avec « ils » et « nous »/iu, /irréguli|formes repères/iu],
  },
  {
    name: 'partir — 3e groupe — passé composé avec être',
    verb: { infinitif: 'partir', groupeConjugaison: 3, auxiliaire: 'être', typePronominal: 'aucun' },
    mode: 'indicatif', tense: 'passé composé', subject: 'elle', answer: 'est partie',
    expected: [/auxiliaire/u, /participe passé/u, /être/u, /accord/iu],
  },
  {
    name: 'se lever — pronominal — passé composé avec être',
    verb: { infinitif: 'se lever', groupeConjugaison: 1, auxiliaire: 'être', typePronominal: 'essentiel' },
    mode: 'indicatif', tense: 'passé composé', subject: 'elles', answer: 'se sont levées',
    expected: [/auxiliaire/iu, /participe passé/u, /être/u, /accord/iu],
  },
  {
    name: 'naître — 3e groupe — plus-que-parfait avec être',
    verb: { infinitif: 'naître', groupeConjugaison: 3, auxiliaire: 'être', typePronominal: 'aucun' },
    mode: 'indicatif', tense: 'plus-que-parfait', subject: 'elles', answer: 'étaient nées',
    expected: [/auxiliaire.*à l’imparfait/iu, /être/u, /accord/iu],
  },
  {
    name: 'se souvenir — pronominal — impératif passé avec être',
    verb: { infinitif: 'se souvenir', groupeConjugaison: 3, auxiliaire: 'être', typePronominal: 'essentiel' },
    mode: 'impératif', tense: 'passé', subject: 'vous', answer: 'soyez-vous souvenus',
    expected: [/auxiliaire.*à l’impératif présent/iu, /être/u, /accord/iu],
  },
  {
    name: 'être — participe présent — exception étant',
    verb: { infinitif: 'être', groupeConjugaison: 3 },
    mode: 'participe', tense: 'présent', subject: '', answer: 'étant',
    expected: [/exception|étant/iu],
    forbidden: [/Forme avec « nous » au présent, sans « -ons »/u],
  },
  {
    name: 'avoir — gérondif présent — exception ayant',
    verb: { infinitif: 'avoir', groupeConjugaison: 3 },
    mode: 'gérondif', tense: 'présent', subject: '', answer: 'en ayant',
    expected: [/participe présent/iu, /exception|ayant/iu],
  },
  {
    name: 'falloir — impersonnel — conditionnel présent',
    verb: { infinitif: 'falloir', groupeConjugaison: 3 },
    mode: 'conditionnel', tense: 'présent', subject: 'il', answer: 'faudrait',
    expected: [/radical du futur/iu, /irréguli|formes repères/iu],
  },
  {
    name: 'pleuvoir — impersonnel — futur',
    verb: { infinitif: 'pleuvoir', groupeConjugaison: 3 },
    mode: 'indicatif', tense: 'futur', subject: 'il', answer: 'pleuvra',
    expected: [/radical du futur/iu, /irréguli|formes repères/iu],
  },
  {
    name: 'payer — 1er groupe — futur — deux graphies admises',
    verb: { infinitif: 'payer', groupeConjugaison: 1 },
    mode: 'indicatif', tense: 'futur', subject: 'il', answer: 'paiera', alternatives: ['payera'],
    expected: [/radical du futur/iu, /terminaison du futur/iu],
  },
]

function renderedHelp(scenario) {
  return [
    buildCondensedVerbGroupHtml(scenario.verb, scenario),
    buildCondensedTenseRuleHtml(scenario.mode, scenario.tense, scenario.verb),
  ].join('')
}

function visibleText(html) {
  return html.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
}

function normalized(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
}

describe('audit pédagogique de l’aide très condensée', () => {
  it('couvre plusieurs groupes, niveaux et difficultés grammaticales', () => {
    assert.equal(scenarios.length, 21)
    assert.deepEqual([...new Set(scenarios.map(item => item.verb.groupeConjugaison))].sort(), [1, 2, 3])
    assert.ok(scenarios.some(item => item.mode === 'impératif'))
    assert.ok(scenarios.some(item => item.mode === 'subjonctif'))
    assert.ok(scenarios.some(item => item.tense.includes('passé composé')))
    assert.ok(scenarios.some(item => item.verb.infinitif.startsWith('se ')))
  })

  for (const scenario of scenarios) {
    describe(scenario.name, () => {
      const html = renderedHelp(scenario)
      const text = visibleText(html)

      it('structure l’aide en blocs courts et lisibles', () => {
        assert.doesNotMatch(html, /undefined|null|\{[^}]+\}/u)
        assert.doesNotMatch(text, /\bau (?:imparfait|impératif)\b/iu, `Article incorrect dans : ${text}`)
        assert.equal((html.match(/<p>/gu) || []).length, (html.match(/<\/p>/gu) || []).length)
        assert.ok((text.match(/\S+/gu) || []).length <= 145, `Aide trop longue : ${text}`)
        assert.match(html, /<strong>/u)
        assert.match(html, /<code>/u)
      })

      it('donne une règle grammaticalement pertinente pour ce cas', () => {
        for (const expectation of scenario.expected) {
          assert.match(text, expectation, `Élément grammatical absent dans : ${text}`)
        }
        for (const forbidden of scenario.forbidden || []) {
          assert.doesNotMatch(text, forbidden, `Règle trompeuse pour ce verbe dans : ${text}`)
        }
      })

      it('aide sans révéler la réponse demandée', () => {
        const normalizedText = normalized(text)
        for (const answer of [scenario.answer, ...(scenario.alternatives || [])]) {
          assert.equal(normalizedText.includes(normalized(answer)), false, `La réponse « ${answer} » est révélée dans : ${text}`)
        }
      })
    })
  }
})
