import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { auditRenderedCoachHelp } from '../shared/utils/coach-help-audit.ts'

const block = {
  id: 1, type: 'normal', title: '', content: '{contextualBaseHelp}', explanationApproach: 'cif-falc',
  isActive: true, sortOrder: 1, children: [],
}
const verb = {
  id: 1, infinitif: 'manger', meaning: 'Mettre de la nourriture dans sa bouche.', groupeConjugaison: 1,
  terminaison: 'er', participePresent: 'mangeant', participePasse: 'mangé', auxiliaire: 'avoir',
  familleConjugaison: 'ger', typePronominal: 'aucun', estImpersonnel: false, estDefectif: false,
  personnesDisponibles: [], typeHInitial: null, niveauDifficulte: 1, niveauCecrl: 'A1', rangFrequence: null,
  registrePrincipal: 'courant', formeCanonique: 'manger', statutValidation: 'valide', particularites: [],
  niveauxScolaires: [], parcoursCif: [], categoriesSemantiques: [],
}

function question(overrides = {}) {
  return {
    titre: '', consigne: '', reponses: ['mangions'], reponsesPourCorrige: ['nous mangions'], infinitif: 'manger',
    pronom: 'nous', saisiePrefixe: 'nous', temps: 'imparfait', mode: 'indicatif', conjugaison1: 'mangions',
    radicalReference: {
      kind: 'present-nous', label: 'nous au présent', form: 'mangeons', removableEnding: 'ons', radical: 'mang',
      targetEnding: 'ions', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous',
      strategy: 'remove-ending', validated: true,
    },
    ...overrides,
  }
}

describe('audit déterministe des aides', () => {
  it('valide un rendu cohérent', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>manger nous mangeons <samp>-ions</samp> mangions</section>',
      blocks: [block], question: question(), verb,
    })
    assert.equal(result.status, 'passed')
    assert.deepEqual(result.issues, [])
  })

  it('signale une variable non remplacée et une terminaison invisible', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>{verb} nous mangeons</section>', blocks: [block], question: question(), verb,
    })
    assert.equal(result.status, 'failed')
    assert.ok(result.issues.some(issue => issue.code === 'unresolved-variable'))
    assert.ok(result.issues.some(issue => issue.code === 'target-ending-not-highlighted'))
  })

  it('détecte une explication potentiellement circulaire', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>Pars de la forme repère : nous mangeons. Enlève <samp>-ons</samp>.</section>', blocks: [block],
      question: question({
        temps: 'présent', conjugaison1: 'mangeons',
        radicalReference: { ...question().radicalReference, referenceTense: 'présent', form: 'mangeons', targetEnding: 'ons' },
      }),
      verb,
    })
    assert.equal(result.status, 'warning')
    assert.ok(result.issues.some(issue => issue.code === 'circular-reference'))
  })

  it('accepte une forme demandée identique à la forme repère si elle est présentée comme à mémoriser', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>La forme demandée est justement la <strong>forme repère</strong>. Apprends-la par cœur, c’est très utile : <mark>Nous mangeons</mark>. <samp>-ons</samp></section>',
      blocks: [block],
      question: question({
        temps: 'présent', conjugaison1: 'mangeons',
        radicalReference: { ...question().radicalReference, referenceTense: 'présent', form: 'mangeons', targetEnding: 'ons' },
      }),
      verb,
    })
    assert.equal(result.status, 'passed')
    assert.deepEqual(result.issues, [])
  })
})
