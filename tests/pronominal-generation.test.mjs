import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { generatePronominalRow } from '../server/services/pronominal-formatter.ts'

function source(overrides = {}) {
  return {
    id: 100,
    verbe_id: 126,
    personne_id: 4,
    temp_id: 1,
    conjugaison1: 'joue',
    conjugaison2: '',
    conjugaison3: '',
    base_conjugaison1: 'joue',
    base_conjugaison2: '',
    base_conjugaison3: '',
    infinitif: 'jouer',
    auxiliaire: 'avoir',
    participe_passe: 'joué',
    pronom: 'je',
    temps_name: 'présent',
    is_compound: 0,
    mode_name: 'indicatif',
    nous_form: 'jouons',
    pronominal_use_id: 66,
    infinitif_pronominal: 'se jouer',
    type_h_initial: 'aucun',
    regle_accord: 'avec_sujet',
    ...overrides,
  }
}

const auxiliaries = [
  { personne_id: 4, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'suis' },
  { personne_id: 6, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'est' },
  { personne_id: 7, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'sommes' },
  { personne_id: 9, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'sont' },
  { personne_id: 5, mode_name: 'impératif', temps_name: 'présent', conjugaison1: 'sois' },
]

describe('génération des emplois pronominaux', () => {
  it('forme les clitiques simples et leur élision', () => {
    const row = generatePronominalRow(source(), auxiliaries)
    assert.equal(row.conjugaison1, 'me joue')
    assert.equal(formatConjugationQuestion(row, 'je').nousForm, 'nous jouons')
    assert.equal(generatePronominalRow(source({
      base_conjugaison1: 'amuse', conjugaison1: 'amuse', infinitif_pronominal: "s'amuser"
    }), auxiliaries).conjugaison1, "m'amuse")
  })

  it("forme l'impératif affirmatif avec trait d’union", () => {
    const row = generatePronominalRow(source({
      personne_id: 5, pronom: 'tu', mode_name: 'impératif', base_conjugaison1: 'joue', conjugaison1: 'joue'
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'joue-toi')
  })

  it('utilise être dans les temps composés et accorde quand la règle le demande', () => {
    const row = generatePronominalRow(source({
      personne_id: 9, pronom: 'ils', temp_id: 5, temps_name: 'passé composé',
      mode_name: 'indicatif', is_compound: 1
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'se sont joués')
    assert.equal(formatConjugationQuestion(row, 'ils').nousForm, 'nous sommes joués')
    assert.deepEqual(formatConjugationQuestion(row, 'ils').reponsesPourCorrige, ['ils se sont joués'])
    const question = formatConjugationQuestion(row, 'elles')
    assert.deepEqual(question.reponsesPourCorrige, ['elles se sont jouées'])
  })

  it('conserve le participe invariable quand le pronom est COI', () => {
    const row = generatePronominalRow(source({
      personne_id: 9, pronom: 'ils', temp_id: 5, temps_name: 'passé composé',
      mode_name: 'indicatif', is_compound: 1, regle_accord: 'invariable'
    }), auxiliaries)
    const question = formatConjugationQuestion(row, 'elles')
    assert.deepEqual(question.reponsesPourCorrige, ['elles se sont joué'])
  })

  it('accorde « nous nous sommes protégés » au pluriel sans variante singulière', () => {
    const row = generatePronominalRow(source({
      personne_id: 7,
      pronom: 'nous',
      temp_id: 5,
      temps_name: 'passé composé',
      mode_name: 'indicatif',
      is_compound: 1,
      infinitif_pronominal: 'se protéger',
      participe_passe: 'protégé',
      regle_accord: 'selon_construction',
    }), auxiliaries)
    const question = formatConjugationQuestion(row, 'nous')

    assert.deepEqual(question.reponsesPourCorrige, [
      'nous nous sommes protégés',
      'nous nous sommes protégées',
    ])
    assert.ok(!question.reponses.includes('nous nous sommes protégé'))
  })

  it("place le pronom après l'auxiliaire à l'impératif passé", () => {
    const row = generatePronominalRow(source({
      personne_id: 5, pronom: 'tu', temp_id: 19, temps_name: 'passé',
      mode_name: 'impératif', is_compound: 1
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'sois-toi joué')
  })
})
