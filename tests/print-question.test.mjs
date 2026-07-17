import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  printableCorrectionAnswers,
  printableCorrectionLabel,
  printableCorrectionText,
  printableQuestion,
  printableQuestionParts,
} from '../shared/utils/print-question.ts'

describe('questions imprimables', () => {
  it('place le verbe et le temps avant une phrase avec complément', () => {
    assert.equal(
      printableQuestion({
        titre: 'danser',
        consigne: 'elles … sa ronde | danser | présent (conditionnel)',
        reponses: [],
        reponsesPourCorrige: [],
      }, 'conjugation'),
      'danser | présent (conditionnel) : elles ................................. sa ronde',
    )
  })

  it('sépare le repère grammatical de la partie à remplir', () => {
    assert.deepEqual(
      printableQuestionParts({
        titre: 'danser',
        consigne: 'elles … sa ronde | danser | présent (conditionnel)',
        reponses: [],
        reponsesPourCorrige: [],
      }, 'conjugation'),
      {
        label: 'danser | présent (conditionnel) :',
        completion: 'elles ................................. sa ronde',
        completionPrefix: 'elles',
        completionSuffix: 'sa ronde',
        fillBlank: true,
        suffixOnNextLine: false,
        blankWidthPercent: 100,
      },
    )
  })

  it('ajoute la zone de réponse après le sujet sans complément', () => {
    assert.equal(
      printableQuestion({
        titre: "s'affaiblir",
        consigne: "je | s'affaiblir | présent (indicatif)",
        reponses: [],
        reponsesPourCorrige: [],
      }, 'conjugation'),
      "s'affaiblir | présent (indicatif) : je .................................",
    )
  })

  it("utilise j’ devant une forme qui commence par une voyelle", () => {
    const parts = printableQuestionParts({
      titre: 'aimer',
      consigne: 'je … ce morceau | aimer | présent (indicatif)',
      reponses: ["j'aime", "j'aime ce morceau"],
      reponsesPourCorrige: ["j'aime ce morceau"],
      infinitif: 'aimer',
      temps: 'présent',
      mode: 'indicatif',
      complementPosition: 'after',
      saisiePrefixe: "j'",
    }, 'conjugation')

    assert.equal(parts.completionPrefix, "j'")
    assert.equal(parts.completion, "j' ................................. ce morceau")
  })

  it('conserve je devant un h aspiré', () => {
    const parts = printableQuestionParts({
      titre: 'haïr',
      consigne: 'je … cette injustice | haïr | présent (indicatif)',
      reponses: ['je hais', 'je hais cette injustice'],
      reponsesPourCorrige: ['je hais cette injustice'],
      infinitif: 'haïr',
      temps: 'présent',
      mode: 'indicatif',
      complementPosition: 'after',
      saisiePrefixe: 'je',
    }, 'conjugation')

    assert.equal(parts.completionPrefix, 'je')
  })

  it('termine une phrase à l’impératif par un point d’exclamation', () => {
    const parts = printableQuestionParts({
      titre: 'manger',
      consigne: '… une pomme | manger | présent (impératif)',
      reponses: ['mange !', 'mange une pomme !'],
      reponsesPourCorrige: ['mange une pomme !'],
      infinitif: 'manger',
      temps: 'présent',
      mode: 'impératif',
      complementPosition: 'after',
      saisiePrefixe: '',
    }, 'conjugation')

    assert.equal(parts.completionSuffix, 'une pomme !')
    assert.equal(parts.completion, '................................. une pomme !')
  })

  it('conserve la consigne pour l’identification du temps', () => {
    assert.equal(
      printableQuestion({
        titre: 'danser',
        consigne: 'elles dansent | préciser le mode et le temps',
        reponses: [],
        reponsesPourCorrige: [],
      }, 'tense-identification'),
      'elles dansent | préciser le mode et le temps',
    )
  })

  it('ne montre que la forme canonique d’un accord à un temps composé', () => {
    const question = {
      titre: 'allumer',
      consigne: 'vous | allumer | plus-que-parfait (subjonctif)',
      reponses: [],
      reponsesPourCorrige: [
        'que vous vous fussiez allumés',
        'que vous vous fussiez allumé',
        'que vous vous fussiez allumée',
        'que vous vous fussiez allumées',
      ],
      isCompound: true,
    }
    assert.deepEqual(printableCorrectionAnswers(question), ['que vous vous fussiez allumés'])
  })

  it('affiche les véritables variantes de conjugaison sur plusieurs lignes', () => {
    const question = {
      titre: "s'asseoir",
      consigne: "il | s'asseoir | présent (indicatif)",
      reponses: [],
      reponsesPourCorrige: ["il s'assied", "il s'assoit"],
      isCompound: false,
    }
    assert.deepEqual(printableCorrectionAnswers(question), ["il s'assied", "il s'assoit"])
    assert.equal(printableCorrectionText(question), "il s'assied\nil s'assoit")
  })

  it('affiche le gérondif avec « en » et une zone à compléter dans la fiche élève', () => {
    const question = {
      titre: 'Aimer',
      consigne: 'Le gérondif présent de Aimer',
      reponses: ['En aimant'],
      reponsesPourCorrige: ['En aimant'],
      infinitif: 'aimer',
      temps: 'présent',
      mode: 'gérondif',
    }
    assert.deepEqual(printableQuestionParts(question, 'conjugation'), {
      label: 'aimer | présent (gérondif) :',
      completion: 'en ......................................',
      completionPrefix: 'en',
      completionSuffix: '',
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    })
    assert.equal(printableCorrectionLabel(question, 'conjugation'), 'Le gérondif présent de Aimer')
  })

  it('affiche le participe présent avec une zone à compléter dans la fiche élève', () => {
    const question = {
      titre: 'Décaler',
      consigne: 'Le participe présent de Décaler',
      reponses: ['Décalant'],
      reponsesPourCorrige: ['Décalant'],
      infinitif: 'décaler',
      temps: 'présent',
      mode: 'participe',
    }
    assert.deepEqual(printableQuestionParts(question, 'conjugation'), {
      label: 'décaler | présent (participe) :',
      completion: '.................................',
      completionPrefix: '',
      completionSuffix: '',
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    })
    assert.equal(printableCorrectionLabel(question, 'conjugation'), 'Le participe présent de Décaler')
  })

  it('ajoute « que » devant le sujet au subjonctif sans COD antéposé', () => {
    assert.deepEqual(
      printableQuestionParts({
        titre: 'lire',
        consigne: 'je … ces lettres | lire | présent (subjonctif)',
        reponses: [],
        reponsesPourCorrige: [],
        infinitif: 'lire',
        temps: 'présent',
        mode: 'subjonctif',
        complementPosition: 'after',
      }, 'conjugation'),
      {
        label: 'lire | présent (subjonctif) :',
        completion: 'que je ................................. ces lettres',
        completionPrefix: 'que je',
        completionSuffix: 'ces lettres',
        fillBlank: true,
        suffixOnNextLine: false,
        blankWidthPercent: 100,
      },
    )
  })

  it('ne rajoute pas « que » lorsqu’un COD est déjà antéposé', () => {
    const parts = printableQuestionParts({
      titre: 'lire',
      consigne: "les lettres que j' … | lire | passé antérieur (indicatif)",
      reponses: [],
      reponsesPourCorrige: [],
      infinitif: 'lire',
      temps: 'passé antérieur',
      mode: 'indicatif',
      complementPosition: 'before',
    }, 'conjugation')
    assert.equal(parts.completionPrefix, "les lettres que j'")
  })

  it('place un complément long sous une ligne pointillée plus longue', () => {
    const parts = printableQuestionParts({
      titre: 'ranger',
      consigne: 'il … nos livres par ordre alphabétique d’auteurs | ranger | futur (indicatif)',
      reponses: [],
      reponsesPourCorrige: [],
      infinitif: 'ranger',
      temps: 'futur',
      mode: 'indicatif',
      complementPosition: 'after',
    }, 'conjugation')
    assert.equal(parts.completionPrefix, 'il')
    assert.equal(parts.completionSuffix, 'nos livres par ordre alphabétique d’auteurs')
    assert.equal(parts.suffixOnNextLine, true)
    assert.ok(parts.blankWidthPercent >= 32 && parts.blankWidthPercent <= 58)
  })
})
