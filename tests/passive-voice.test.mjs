import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  agreePassiveParticiple,
  formatPassiveQuestion,
  passiveAuxiliaryForm,
} from '../server/services/passive-voice.ts'
import { isPassivizableInfinitive } from '../shared/utils/passive-voice.ts'
import {
  buildCompleteConjugationAdviceHtml,
  buildConjugationBaseHtml,
} from '../shared/utils/conjugation-help.ts'

const row = (overrides = {}) => ({
  id: 12,
  verbe_id: 7,
  personne_id: 6,
  temp_id: 1,
  conjugaison1: 'abandonne',
  infinitif: 'abandonner',
  participe_passe: 'abandonné',
  temps_name: 'présent',
  tense_code: 'present',
  is_compound: 0,
  mode_name: 'indicatif',
  mode_code: 'indicative',
  ...overrides,
})

const complement = (overrides = {}) => ({
  id: 31,
  texte_antepose: 'la mission',
  genre: 'feminin',
  nombre: 'singulier',
  ...overrides,
})

const auxiliaryForms = [
  { personne_id: 6, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'est' },
  { personne_id: 6, mode_name: 'indicatif', temps_name: 'passé composé', conjugaison1: 'a été' },
  { personne_id: 9, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'sont' },
  { personne_id: 6, mode_name: 'subjonctif', temps_name: 'présent', conjugaison1: 'soit' },
]

describe('accord du participe à la voix passive', () => {
  it('accorde les quatre genres et nombres sans redoubler s ou x', () => {
    assert.equal(agreePassiveParticiple('écrit', 'feminin', 'singulier'), 'écrite')
    assert.equal(agreePassiveParticiple('écrit', 'masculin', 'pluriel'), 'écrits')
    assert.equal(agreePassiveParticiple('pris', 'masculin', 'pluriel'), 'pris')
    assert.equal(agreePassiveParticiple('pris', 'feminin', 'pluriel'), 'prises')
  })
})

describe('éligibilité sémantique à la voix passive', () => {
  it('écarte les passifs artificiels malgré la présence d’un COD', () => {
    assert.equal(isPassivizableInfinitive('avoir'), false)
    assert.equal(isPassivizableInfinitive('falloir'), false)
    assert.equal(isPassivizableInfinitive('Pleuvoir'), false)
    assert.equal(isPassivizableInfinitive('Savoir'), false)
    assert.equal(isPassivizableInfinitive('abandonner'), true)
  })

  it('conserve les verbes compatibles quand des impersonnels sont sélectionnés avec eux', () => {
    const selected = ['falloir', 'abandonner', 'pleuvoir', 'écrire']
    assert.deepEqual(selected.filter(isPassivizableInfinitive), ['abandonner', 'écrire'])
    assert.equal(selected.some(isPassivizableInfinitive), true)
    assert.equal(['falloir', 'pleuvoir'].some(isPassivizableInfinitive), false)
  })
})

describe('questions à la voix passive', () => {
  it('transforme le COD en sujet et ajoute un complément d’agent', () => {
    const question = formatPassiveQuestion(row(), complement(), auxiliaryForms)

    assert.equal(question.voice, 'passive')
    assert.equal(question.consigne, 'La mission … par quelqu’un | abandonner | présent (indicatif)')
    assert.ok(question.reponses.includes('est abandonnée'))
    assert.deepEqual(question.reponsesPourCorrige, ['La mission est abandonnée par quelqu’un.'])
  })

  it('conjugue être au temps composé demandé', () => {
    const question = formatPassiveQuestion(row({
      conjugaison1: 'a abandonné', temps_name: 'passé composé', is_compound: 1,
    }), complement(), auxiliaryForms)

    assert.equal(question.conjugaison1, 'a été abandonnée')
    assert.deepEqual(question.reponsesPourCorrige, ['La mission a été abandonnée par quelqu’un.'])
  })

  it('forme aussi le futur proche passif', () => {
    const future = row({
      personne_id: 9,
      conjugaison1: 'vont écrire',
      infinitif: 'écrire',
      participe_passe: 'écrit',
      temps_name: 'futur proche',
      tense_code: 'near-future',
    })
    assert.equal(passiveAuxiliaryForm(future, []), 'vont être')
    const question = formatPassiveQuestion(future, complement({
      texte_antepose: 'les lettres', genre: 'feminin', nombre: 'pluriel',
    }), [])
    assert.equal(question.conjugaison1, 'vont être écrites')

    const singular = formatPassiveQuestion(row({
      conjugaison1: 'va écrire', infinitif: 'écrire', participe_passe: 'écrit',
      temps_name: 'futur proche', tense_code: 'near-future',
    }), complement({ texte_antepose: 'la lettre' }), [])
    assert.equal(singular.conjugaison1, 'va être écrite')
  })

  it('introduit correctement un sujet vocalique au subjonctif', () => {
    const question = formatPassiveQuestion(row({
      conjugaison1: 'abandonne', mode_name: 'subjonctif', mode_code: 'subjunctive',
    }), complement({ texte_antepose: 'une mission' }), auxiliaryForms)
    assert.equal(question.consigne, "Qu'une mission … par quelqu’un | abandonner | présent (subjonctif)")
    assert.ok(question.reponses.includes("qu'une mission soit abandonnée"))
  })
})

describe('aide pédagogique du passif', () => {
  it('explique la transformation et l’accord sans révéler la réponse trop tôt', () => {
    const question = formatPassiveQuestion(row(), complement(), auxiliaryForms)
    const verb = { infinitif: 'abandonner', participePasse: 'abandonné' }
    const complete = buildConjugationBaseHtml(question, verb)
    const clue = buildCompleteConjugationAdviceHtml(question, verb)

    assert.match(complete, /COD de la phrase active devient le sujet/u)
    assert.match(complete, /est/u)
    assert.match(complete, /abandonnée/u)
    assert.match(clue, /Conjugue <strong>être<\/strong>/u)
    assert.doesNotMatch(clue, /est abandonnée/u)
  })
})
