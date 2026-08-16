import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { classicComplementChoiceConfig } from '../shared/utils/classic-complement-choice.ts'
import { toSharedChallengeRequest } from '../app/composables/useChallengeApi.ts'

import {
  parseDefiDefinition,
  parseQuestionnaireRequest,
  PublicInputError,
  serializeDefi
} from '../server/services/public-api-validation.ts'

describe('validation des défis partagés', () => {
  it('lit encore le tuple historique et ses options', () => {
    const challenge = parseDefiDefinition([
      [1, 2, 3],
      [1, 4],
      20,
      ['ililsonly'],
      'afficherIel'
    ])

    assert.equal(challenge.version, 1)
    assert.equal(challenge.exerciseKind, 'conjugation')
    assert.equal(challenge.identificationSource, 'selected-verbs')
    assert.equal(challenge.pastSimplePronouns, 'third-person-only')
    assert.equal(challenge.inclusivePronouns, true)
    assert.equal(challenge.includeComplements, true)
    assert.equal(challenge.complementPlacement, 'after')
    assert.deepEqual(challenge.complementOptions, ['cod-after', 'coi-after'])
    assert.equal(challenge.printOptions.title, 'Défi de conjugaison')
  })

  it('conserve toutes les options du format moderne', () => {
    const input = {
      version: 1,
      verbIds: [1, 2],
      tenseIds: [1, 2],
      questionCount: 10,
      exerciseKind: 'tense-identification',
      identificationSource: 'literary-corpus',
      pastSimplePronouns: 'all',
      inclusivePronouns: true,
      includeOnPronoun: true,
      voiceMode: 'mixed',
      includeComplements: true,
      complementPlacement: 'mixed',
      complementOptions: ['cod-after', 'coi-before'],
      printOptions: {
        title: 'Ma fiche',
        questionSpacingMm: 8,
        titleSpacingMm: 18,
        inclusiveDisplay: true,
        showGrade: false,
        showVerbs: true,
        showTenses: true,
        showFirstName: false,
        showLastName: false,
        showDate: true,
        showRandomNumber: true
      }
    }

    const parsed = parseDefiDefinition(input)
    assert.equal(parsed.identificationSource, 'literary-corpus')
    assert.equal(parsed.includeOnPronoun, true)
    assert.equal(parsed.printOptions.inclusiveDisplay, true)
    assert.deepEqual(JSON.parse(serializeDefi(parsed)), parsed)
  })

  it('envoie toutes les options lors de l’enregistrement', () => {
    const challenge = {
      verbIds: [4, 8], tenseIds: [2, 7], questionCount: 42,
      exerciseKind: 'tense-identification', pastSimplePronouns: 'third-person-only',
      identificationSource: 'literary-corpus',
      literaryRegister: 'courant',
      inclusivePronouns: true, includeOnPronoun: true, includeComplements: true, complementPlacement: 'mixed',
      learningSupportMode: 'cif-fle',
      voiceMode: 'mixed',
      complementOptions: ['cod-before', 'coi-after'],
      printOptions: {
        title: 'Défi complet', questionSpacingMm: 6, titleSpacingMm: 20,
        inclusiveDisplay: true,
        showGrade: false, showVerbs: true, showTenses: true, showFirstName: false,
        showLastName: true, showDate: false, showRandomNumber: false,
      },
    }

    assert.deepEqual(toSharedChallengeRequest(challenge), { version: 1, ...challenge })
    assert.equal(toSharedChallengeRequest(challenge, '  Révision du présent  ').title, 'Révision du présent')
    assert.equal(
      toSharedChallengeRequest(challenge, 'Révision', '  À réaliser avant vendredi.  ').description,
      'À réaliser avant vendredi.',
    )
  })

  it('sauvegarde et valide le titre du défi', () => {
    const challenge = parseDefiDefinition({
      version: 1,
      title: '  Révision des verbes en -ir  ',
      description: '  Commence par relire la règle.  ',
      verbIds: [1],
      tenseIds: [1],
      questionCount: 10,
    })

    assert.equal(challenge.title, 'Révision des verbes en -ir')
    assert.equal(challenge.description, 'Commence par relire la règle.')
    assert.throws(
      () => parseDefiDefinition({
        version: 1,
        title: ' '.repeat(5),
        verbIds: [1],
        tenseIds: [1],
        questionCount: 10,
      }),
      /entre 1 et 80 caractères/u,
    )
    assert.throws(
      () => parseDefiDefinition({
        version: 1,
        title: 'Révision',
        description: 'x'.repeat(1001),
        verbIds: [1],
        tenseIds: [1],
        questionCount: 10,
      }),
      /1000 caractères/u,
    )
  })

  it('complète un ancien code avec les valeurs par défaut actuelles', () => {
    const challenge = parseDefiDefinition({ verbIds: [1], tenseIds: [3], questionCount: 12 })

    assert.deepEqual({
      exerciseKind: challenge.exerciseKind,
      identificationSource: challenge.identificationSource,
      pastSimplePronouns: challenge.pastSimplePronouns,
      inclusivePronouns: challenge.inclusivePronouns,
      includeOnPronoun: challenge.includeOnPronoun,
      voiceMode: challenge.voiceMode,
      includeComplements: challenge.includeComplements,
      complementPlacement: challenge.complementPlacement,
      complementOptions: challenge.complementOptions,
    }, {
      exerciseKind: 'conjugation',
      identificationSource: 'selected-verbs',
      pastSimplePronouns: 'all',
      inclusivePronouns: false,
      includeOnPronoun: false,
      voiceMode: 'active',
      includeComplements: true,
      complementPlacement: 'after',
      complementOptions: ['cod-after', 'coi-after'],
    })
    assert.equal(challenge.printOptions.title, 'Défi de conjugaison')
    assert.equal(challenge.printOptions.showGrade, true)
    assert.equal(challenge.printOptions.inclusiveDisplay, false)
  })

  it('rejette les champs inattendus', () => {
    assert.throws(
      () => parseDefiDefinition({ verbIds: [1], tenseIds: [1], questionCount: 5, admin: true }),
      PublicInputError
    )
  })
})

describe('validation des questionnaires', () => {
  it('accepte le catalogue complet quand il dépasse 500 verbes', () => {
    const verbIds = Array.from({ length: 535 }, (_, index) => index + 1)
    const request = parseQuestionnaireRequest({
      verbIds,
      tenseIds: [1],
      questionCount: 100,
      exerciseKind: 'conjugation',
      pastSimplePronouns: 'all',
      inclusivePronouns: false,
    })

    assert.deepEqual(request.verbIds, verbIds)
    assert.deepEqual(parseDefiDefinition({ verbIds, tenseIds: [1], questionCount: 100 }).verbIds, verbIds)
  })

  it('accepte la description d’un défi enregistré sans la transmettre au générateur', () => {
    const request = parseQuestionnaireRequest({
      description: '  À retravailler avant vendredi.  ',
      verbIds: [1],
      tenseIds: [4],
      questionCount: 5,
      exerciseKind: 'conjugation',
      pastSimplePronouns: 'all',
      inclusivePronouns: false,
    })

    assert.equal('description' in request, false)
    assert.throws(
      () => parseQuestionnaireRequest({
        description: 'x'.repeat(1001),
        verbIds: [1],
        tenseIds: [4],
        questionCount: 5,
        exerciseKind: 'conjugation',
        pastSimplePronouns: 'all',
        inclusivePronouns: false,
      }),
      /1000 caractères/u,
    )
  })

  it('normalise les alias historiques', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [1],
      tenseIds: [4],
      questionCount: 5,
      exerciseKind: 'normal',
      pastSimplePronouns: 'ililsonly',
      inclusivePronouns: false
    })

    assert.equal(request.exerciseKind, 'conjugation')
    assert.equal(request.pastSimplePronouns, 'third-person-only')
    assert.equal(request.includeComplements, false)
    assert.equal(request.complementPlacement, 'after')
    assert.deepEqual(request.complementOptions, [])
    assert.equal(request.learningSupportMode, 'normal')
  })

  it('valide le mode d’aide CIF/FLE et garde les anciens défis en mode normal', () => {
    const base = {
      verbIds: [1], tenseIds: [1], questionCount: 5,
      exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: false,
    }
    assert.equal(parseQuestionnaireRequest({ ...base, learningSupportMode: 'cif-fle' }).learningSupportMode, 'cif-fle')
    assert.equal(parseDefiDefinition(base).learningSupportMode, 'normal')
    assert.throws(() => parseQuestionnaireRequest({ ...base, learningSupportMode: 'audio' }), PublicInputError)
  })

  it('valide les options de présence et de position des compléments', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [1], tenseIds: [5], questionCount: 5,
      exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: false,
      includeComplements: true, complementPlacement: 'before'
    })
    assert.equal(request.includeComplements, true)
    assert.equal(request.complementPlacement, 'before')
    assert.deepEqual(request.complementOptions, ['cod-before'])
    const independent = parseQuestionnaireRequest({
      ...request,
      complementOptions: ['cod-after', 'coi-after', 'coi-before'],
    })
    assert.deepEqual(independent.complementOptions, ['cod-after', 'coi-after', 'coi-before'])
    assert.throws(
      () => parseQuestionnaireRequest({ ...request, complementPlacement: 'partout' }),
      PublicInputError
    )
    assert.throws(
      () => parseQuestionnaireRequest({ ...request, complementOptions: ['ailleurs'] }),
      PublicInputError
    )
  })

  it('accepte un emploi pronominal représenté par un identifiant virtuel négatif', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [-66],
      tenseIds: [1],
      questionCount: 5,
      exerciseKind: 'conjugation',
      pastSimplePronouns: 'all',
      inclusivePronouns: false
    })

    assert.deepEqual(request.verbIds, [-66])
  })

  it('continue de refuser zéro et les identifiants de temps négatifs', () => {
    const base = {
      verbIds: [1], tenseIds: [1], questionCount: 5,
      exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: false
    }
    assert.throws(() => parseQuestionnaireRequest({ ...base, verbIds: [0] }), PublicInputError)
    assert.throws(() => parseQuestionnaireRequest({ ...base, tenseIds: [-1] }), PublicInputError)
  })
})

describe('menu de lancement de l’exercice classique', () => {
  it('traduit les quatre choix en options de questionnaire', () => {
    assert.deepEqual(classicComplementChoiceConfig('none'), {
      includeComplements: false,
      complementPlacement: 'after',
    })
    assert.deepEqual(classicComplementChoiceConfig('after'), {
      includeComplements: true,
      complementPlacement: 'after',
    })
    assert.deepEqual(classicComplementChoiceConfig('before'), {
      includeComplements: true,
      complementPlacement: 'before',
    })
    assert.deepEqual(classicComplementChoiceConfig('mixed'), {
      includeComplements: true,
      complementPlacement: 'mixed',
    })
  })
})
