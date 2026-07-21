import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { auditRenderedCoachHelp, automaticHelpErrorsForRecording } from '../shared/utils/coach-help-audit.ts'

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

  it('refuse une aide composée qui n’affiche pas l’accord officiel du COD placé avant', () => {
    const compoundQuestion = question({
      reponses: ['a mangée'],
      reponsesPourCorrige: ['elle a mangée'],
      pronom: 'elle',
      saisiePrefixe: 'elle',
      temps: 'passé composé',
      isCompound: true,
      conjugaison1: 'a mangé',
      radicalReference: undefined,
      agreementReminder: {
        kind: 'cod-before',
        infinitive: 'manger',
        complement: 'la pomme',
        participle: 'mangée',
        gender: 'feminin',
        number: 'singulier',
      },
    })
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>Résultat : elle a mangé. Le COD est placé avant.</section>',
      blocks: [block], question: compoundQuestion, verb,
    })

    assert.equal(result.status, 'failed')
    assert.ok(result.issues.some(issue => issue.code === 'official-compound-answer-missing'))
  })

  it('refuse une règle qui nie l’accord avec un COD placé avant', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: '<section>Résultat : elle a mangée. Avec un COD placé avant, pas d’accord.</section>',
      blocks: [block],
      question: question({
        reponses: ['a mangée'], reponsesPourCorrige: ['elle a mangée'], pronom: 'elle', saisiePrefixe: 'elle',
        temps: 'passé composé', isCompound: true, conjugaison1: 'a mangé', radicalReference: undefined,
        agreementReminder: {
          kind: 'cod-before', infinitive: 'manger', complement: 'la pomme', participle: 'mangée',
          gender: 'feminin', number: 'singulier',
        },
      }),
      verb,
    })

    assert.equal(result.status, 'failed')
    assert.ok(result.issues.some(issue => issue.code === 'cod-before-agreement-contradiction'))
  })

  it('ne confond pas l’absence d’accord avec le sujet et l’accord du COD antéposé', () => {
    const result = auditRenderedCoachHelp({
      renderedHtml: `<section>
        <p>Résultat : elle a mangée.</p>
        <figure><figcaption>Accord du participe passé</figcaption>
          <blockquote><strong>Cas général avec avoir</strong>
            <p>Le participe passé ne s’accorde pas avec le sujet.</p>
            <p><em>Elle a mangé. · Ils ont mangé.</em></p>
          </blockquote>
          <blockquote><strong>Si le COD est placé avant</strong>
            <p>Le participe passé s’accorde avec le complément d’objet direct placé avant le verbe.</p>
          </blockquote>
        </figure>
      </section>`,
      blocks: [block],
      question: question({
        reponses: ['a mangée'], reponsesPourCorrige: ['elle a mangée'], pronom: 'elle', saisiePrefixe: 'elle',
        temps: 'passé composé', isCompound: true, conjugaison1: 'a mangé', radicalReference: undefined,
        agreementReminder: {
          kind: 'cod-before', infinitive: 'manger', complement: 'la pomme', participle: 'mangée',
          gender: 'feminin', number: 'singulier',
        },
      }),
      verb,
    })

    assert.equal(result.status, 'passed')
    assert.deepEqual(result.issues, [])
  })

  it('enregistre le désaccord si seul le navigateur affiche l’aide sécurisée', () => {
    const errors = automaticHelpErrorsForRecording(
      { status: 'passed', issues: [] },
      {
        status: 'failed',
        issues: [{
          code: 'cod-before-agreement-contradiction',
          severity: 'error',
          title: 'Règle d’accord contradictoire',
          detail: 'Le navigateur a détecté une contradiction.',
        }],
      },
    )

    assert.deepEqual(errors, [{
      code: 'client-server-audit-mismatch',
      severity: 'error',
      title: 'Audits client et serveur différents',
      detail: 'Le navigateur a affiché l’aide sécurisée pour « cod-before-agreement-contradiction », mais le serveur n’a pas reproduit cette erreur.',
    }])
  })

  it('préfère les erreurs confirmées par le serveur', () => {
    const serverIssue = {
      code: 'official-compound-answer-missing',
      severity: 'error',
      title: 'Réponse absente',
      detail: 'La forme officielle manque.',
    }
    assert.deepEqual(automaticHelpErrorsForRecording(
      { status: 'failed', issues: [serverIssue] },
      { status: 'failed', issues: [{ code: 'autre-erreur', severity: 'error' }] },
    ), [serverIssue])
  })
})
