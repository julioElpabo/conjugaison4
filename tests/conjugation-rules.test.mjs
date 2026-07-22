import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatNonFiniteQuestion } from '../server/services/non-finite-formatter.ts'
import { formatAnswer, formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { getAlternativeCorrections, isAnswerCorrect } from '../shared/utils/answer.ts'

function row(overrides = {}) {
  return {
    id: 1,
    verbe_id: 45,
    personne_id: 4,
    temp_id: 1,
    conjugaison1: 'assieds',
    conjugaison2: 'assois',
    conjugaison3: '',
    infinitif: 'asseoir',
    auxiliaire: 'avoir',
    participe_passe: 'assis',
    temps_name: 'présent',
    is_compound: 0,
    mode_name: 'indicatif',
    ...overrides,
  }
}

describe('formes multiples reconnues par le correcteur', () => {
  it('accepte assieds et assois et propose l’autre solution', () => {
    const question = formatConjugationQuestion(row(), 'je')
    assert.ok(question.reponses.includes("j'assieds"))
    assert.ok(question.reponses.includes("j'assois"))
    assert.equal(isAnswerCorrect("j'assieds", question.reponses), true)
    assert.equal(isAnswerCorrect("j'assois", question.reponses), true)
    assert.deepEqual(getAlternativeCorrections("j'assieds", question.reponsesPourCorrige), ["j'assois"])
  })

  for (const testCase of [
    { forms: ['paie', 'paye'], answer: 'paye', label: 'paie ou paye' },
    { forms: ['essaie', 'essaye'], answer: 'essaye', label: 'essaie ou essaye' },
    { forms: ['peux', 'puis'], answer: 'puis', label: 'peux ou puis' },
  ]) {
    it(`accepte les variantes ${testCase.label}`, () => {
      assert.equal(isAnswerCorrect(testCase.answer, testCase.forms), true)
      assert.deepEqual(getAlternativeCorrections(testCase.answer, testCase.forms), [testCase.forms[0]])
    })
  }

  it('sépare les variantes historiques du participe présent', () => {
    const question = formatNonFiniteQuestion({
      id: -3,
      infinitif: "s'asseoir",
      participe_present: "s'asseyant-s'assoyant",
      participe_passe: 'assis',
      auxiliaire_participe_present: "s'étant",
    }, { id: 20, name: 'présent', mode_name: 'participe' })
    assert.deepEqual(question?.reponsesPourCorrige, ["S'asseyant", "S'assoyant"])
  })
})

describe('apostrophes et élisions françaises', () => {
  it("élide je devant une voyelle : j’aime", () => {
    assert.equal(formatAnswer('je', 'aime', 'indicatif'), "j'aime")
  })

  it("élide je devant un h muet : j’habite", () => {
    assert.equal(formatAnswer('je', 'habite', 'indicatif'), "j'habite")
  })

  it("conserve je devant un h aspiré : je hais", () => {
    assert.equal(formatAnswer('je', 'hais', 'indicatif'), 'je hais')
  })

  it("forme correctement qu’il, qu’elle et qu’elles", () => {
    assert.equal(formatAnswer('il', 'aille', 'subjonctif'), "qu'il aille")
    assert.equal(formatAnswer('elle', 'aille', 'subjonctif'), "qu'elle aille")
    assert.equal(formatAnswer('elles', 'aillent', 'subjonctif'), "qu'elles aillent")
  })
})

describe('compléments d’objet dans les questions', () => {
  it('affiche une phrase naturelle et accepte la forme seule ou la phrase complète', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'mangeait',
      conjugaison2: '',
      temps_name: 'imparfait',
      complement_phrase: 'des pommes',
    }), 'il')

    assert.equal(question.consigne, 'il … des pommes | manger | imparfait (indicatif)')
    assert.ok(question.reponses.includes('mangeait'))
    assert.ok(question.reponses.includes('il mangeait'))
    assert.ok(question.reponses.includes('mangeait des pommes'))
    assert.ok(question.reponses.includes('il mangeait des pommes'))
    assert.deepEqual(question.reponsesPourCorrige, ['il mangeait des pommes'])
    assert.equal(question.complement, 'des pommes')
    assert.equal(question.saisiePrefixe, 'il')
  })

  it('place le complément avant la ponctuation de l’impératif', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'mange',
      conjugaison2: '',
      mode_name: 'impératif',
      complement_phrase: 'une pomme',
    }), 'tu')
    assert.ok(question.reponses.includes('mange une pomme !'))
    assert.equal(isAnswerCorrect('mange une pomme!', question.reponses), true)
    assert.equal(isAnswerCorrect('mange une pomme', question.reponses), true)
    assert.deepEqual(question.reponsesPourCorrige, ['mange une pomme !'])
    assert.equal(question.consigne, '… une pomme | manger | présent (impératif)')
    assert.equal(question.saisiePrefixe, '')
  })

  it('prépare un préfixe naturel devant le champ pour les formes élidées', () => {
    const indicative = formatConjugationQuestion(row({
      infinitif: 'aimer',
      conjugaison1: 'aime',
      complement_phrase: 'ce morceau',
    }), 'je')
    const subjunctive = formatConjugationQuestion(row({
      infinitif: 'aimer',
      conjugaison1: 'aime',
      mode_name: 'subjonctif',
      complement_phrase: 'ce morceau',
    }), 'elle')

    assert.equal(indicative.saisiePrefixe, "j'")
    assert.equal(subjunctive.saisiePrefixe, "qu'elle")
  })

  it('antépose le COD et accorde le participe passé employé avec avoir', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'avez mangé',
      conjugaison2: '',
      temps_name: 'passé composé',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'mangé',
      complement_phrase: 'des pommes',
      complement_position: 'before',
      complement_anteposed: 'les pommes',
      complement_gender: 'feminin',
      complement_number: 'pluriel',
    }), 'vous')

    assert.equal(question.consigne, 'les pommes que vous … | manger | passé composé (indicatif)')
    assert.equal(question.complement, 'les pommes')
    assert.equal(question.complementPosition, 'before')
    assert.equal(question.saisiePrefixe, 'que vous')
    assert.ok(question.reponses.includes('avez mangées'))
    assert.equal(question.reponses.includes('avez mangé'), false)
    assert.deepEqual(question.reponsesPourCorrige, ['les pommes que vous avez mangées'])
  })

  it('donne au COD antéposé un contexte qui justifie le subjonctif', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'démolir',
      conjugaison1: 'aies démoli',
      conjugaison2: '',
      temps_name: 'passé',
      mode_name: 'subjonctif',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'démoli',
      complement_position: 'before',
      complement_anteposed: "l'autre maison",
      complement_gender: 'feminin',
      complement_number: 'singulier',
      complement_function: 'cod',
    }), 'tu')

    assert.equal(question.consigne, "C'est la seule autre maison que tu … | démolir | passé (subjonctif)")
    assert.deepEqual(question.reponsesPourCorrige, ["C'est la seule autre maison que tu aies démolie"])
    assert.ok(question.reponses.includes("C'est la seule autre maison que tu aies démolie"))
  })

  for (const { pronoun, form } of [
    { pronoun: 'il', form: 'eût apaisé' },
    { pronoun: 'ils', form: 'eussent apaisé' },
    { pronoun: 'elle', form: 'eût apaisé' },
    { pronoun: 'elles', form: 'eussent apaisé' },
    { pronoun: 'on', form: 'eût apaisé' },
    { pronoun: 'iel', form: 'eût apaisé' },
    { pronoun: 'iels', form: 'eussent apaisé' },
  ]) {
    it(`élide que devant ${pronoun} dans une relative au subjonctif`, () => {
      const question = formatConjugationQuestion(row({
        infinitif: 'apaiser',
        conjugaison1: form,
        conjugaison2: '',
        temps_name: 'plus-que-parfait',
        mode_name: 'subjonctif',
        is_compound: 1,
        auxiliaire: 'avoir',
        participe_passe: 'apaisé',
        complement_position: 'before',
        complement_anteposed: 'les enfants inquiets',
        complement_gender: 'masculin',
        complement_number: 'pluriel',
        complement_function: 'cod',
      }), pronoun)

      assert.equal(
        question.consigne,
        `Ce sont les seuls enfants inquiets qu'${pronoun} … | apaiser | plus-que-parfait (subjonctif)`,
      )
      assert.deepEqual(
        question.reponsesPourCorrige,
        [`Ce sont les seuls enfants inquiets qu'${pronoun} ${form.replace(/apaisé$/u, 'apaisés')}`],
      )
    })
  }

  it('donne aussi au COI antéposé un contexte qui justifie le subjonctif', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'participer',
      conjugaison1: 'ait participé',
      conjugaison2: '',
      temps_name: 'passé',
      mode_name: 'subjonctif',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'participé',
      complement_position: 'before',
      complement_anteposed: 'la réunion',
      complement_relative_pronoun: 'à laquelle',
      complement_function: 'coi',
    }), 'il')

    assert.equal(question.consigne, "C'est la seule réunion à laquelle il … | participer | passé (subjonctif)")
    assert.deepEqual(question.reponsesPourCorrige, ["C'est la seule réunion à laquelle il ait participé"])
  })

  it('laisse le complément de lieu après le verbe lorsque le COD est antéposé', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'envoyer',
      conjugaison1: 'avions envoyés',
      conjugaison2: '',
      temps_name: 'plus-que-parfait',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'envoyé',
      complement_phrase: 'des enfants à l’école',
      complement_position: 'before',
      complement_anteposed: 'les enfants à l’école',
      complement_gender: 'masculin',
      complement_number: 'pluriel',
    }), 'nous')

    assert.equal(
      question.consigne,
      'les enfants que nous … à l’école | envoyer | plus-que-parfait (indicatif)'
    )
    assert.deepEqual(
      question.reponsesPourCorrige,
      ['les enfants que nous avions envoyés à l’école']
    )
  })

  for (const testCase of [
    {
      label: 'un complément de manière',
      infinitive: 'ranger',
      anteposed: 'les livres par ordre alphabétique d’auteurs',
      expectedPrompt: 'les livres que nous … par ordre alphabétique d’auteurs | ranger | plus-que-parfait (indicatif)',
    },
    {
      label: 'un complément de but',
      infinitive: 'utiliser',
      anteposed: 'les chutes de tissu pour confectionner une poupée',
      expectedPrompt: 'les chutes de tissu que nous … pour confectionner une poupée | utiliser | plus-que-parfait (indicatif)',
    },
    {
      label: 'un complément de moyen',
      infinitive: 'croiser',
      anteposed: 'les vergues avec le mât',
      expectedPrompt: 'les vergues que nous … avec le mât | croiser | plus-que-parfait (indicatif)',
    },
  ]) {
    it(`replace ${testCase.label} après la zone de réponse`, () => {
      const question = formatConjugationQuestion(row({
        infinitif: testCase.infinitive,
        conjugaison1: 'avions rangés',
        conjugaison2: '',
        temps_name: 'plus-que-parfait',
        is_compound: 1,
        auxiliaire: 'avoir',
        participe_passe: 'rangé',
        complement_phrase: testCase.anteposed,
        complement_position: 'before',
        complement_anteposed: testCase.anteposed,
        complement_gender: 'masculin',
        complement_number: 'pluriel',
      }), 'nous')

      assert.equal(question.consigne, testCase.expectedPrompt)
    })
  }

  it('conserve un adjectif composé commençant par « sous- » dans le COD', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'explorer',
      conjugaison1: 'avions explorés',
      conjugaison2: '',
      temps_name: 'plus-que-parfait',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'exploré',
      complement_phrase: 'les fonds sous-marins',
      complement_position: 'before',
      complement_anteposed: 'les fonds sous-marins',
      complement_gender: 'masculin',
      complement_number: 'pluriel',
    }), 'nous')

    assert.equal(
      question.consigne,
      'les fonds sous-marins que nous … | explorer | plus-que-parfait (indicatif)'
    )
  })
})

describe('accords du participe passé', () => {
  const source = row({
    infinitif: 'aller',
    conjugaison1: 'sont allés',
    conjugaison2: '',
    auxiliaire: 'être',
    participe_passe: 'allé',
    temps_name: 'passé composé',
    is_compound: 1,
  })

  for (const testCase of [
    { pronoun: 'ils', expected: 'ils sont allés' },
    { pronoun: 'elles', expected: 'elles sont allées' },
    { pronoun: 'iels', expected: 'iels sont allé(e)s' },
  ]) {
    it(`accorde avec ${testCase.pronoun}`, () => {
      const question = formatConjugationQuestion(source, testCase.pronoun)
      assert.ok(question.reponsesPourCorrige.includes(testCase.expected))
    })
  }

  it("n’accorde pas le participe avec le sujet après avoir", () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'ouvrir', conjugaison1: 'ont ouvert', conjugaison2: '', participe_passe: 'ouvert',
      temps_name: 'passé composé', is_compound: 1,
    }), 'elles')
    assert.deepEqual(question.reponsesPourCorrige, ['elles ont ouvert'])
  })
})

describe('impératif et ponctuation', () => {
  it('retire le pronom sujet et ajoute la ponctuation', () => {
    assert.equal(formatAnswer('tu', 'mange', 'impératif'), 'mange !')
  })

  it("accepte le point d’exclamation avec ou sans espace, ainsi que son absence", () => {
    const question = formatConjugationQuestion(row({
      conjugaison1: 'mange',
      conjugaison2: '',
      mode_name: 'impératif',
      temp_id: 9,
    }), 'tu')
    assert.equal(isAnswerCorrect('mange !', question.reponses), true)
    assert.equal(isAnswerCorrect('mange!', question.reponses), true)
    assert.equal(isAnswerCorrect('mange', question.reponses), true)
    assert.deepEqual(question.reponsesPourCorrige, ['mange !'])
  })

  it('accepte assieds-toi et assois-toi', () => {
    const question = formatConjugationQuestion(row({
      infinitif: "s'asseoir",
      conjugaison1: 'assieds-toi',
      conjugaison2: 'assois-toi',
      mode_name: 'impératif',
      temp_id: 9,
    }), 'tu')
    assert.equal(isAnswerCorrect('assieds-toi', question.reponses), true)
    assert.equal(isAnswerCorrect('assois-toi !', question.reponses), true)
  })

  it('accepte le s euphonique et les traits d’union de vas-y et manges-en', () => {
    assert.equal(isAnswerCorrect('vas-y', ['vas-y']), true)
    assert.equal(isAnswerCorrect('manges-en', ['manges-en']), true)
    assert.equal(isAnswerCorrect('va-y', ['vas-y']), false)
    assert.equal(isAnswerCorrect('mange-en', ['manges-en']), false)
  })
})

describe('participe, infinitif et gérondif', () => {
  const verb = {
    id: 87,
    infinitif: 'aimer',
    participe_present: 'aimant',
    participe_passe: 'aimé',
    auxiliaire_participe_present: 'ayant',
  }

  for (const testCase of [
    { id: 20, mode: 'participe', tense: 'présent', expected: 'Aimant' },
    { id: 21, mode: 'participe', tense: 'passé', expected: 'Aimé' },
    { id: 22, mode: 'gérondif', tense: 'présent', expected: 'En aimant' },
    { id: 23, mode: 'gérondif', tense: 'passé', expected: 'En ayant aimé' },
  ]) {
    it(`produit le ${testCase.mode} ${testCase.tense}`, () => {
      const question = formatNonFiniteQuestion(verb, { id: testCase.id, name: testCase.tense, mode_name: testCase.mode })
      assert.deepEqual(question?.reponsesPourCorrige, [testCase.expected])
    })
  }

  it('ne génère ni participe présent ni gérondif pour falloir', () => {
    const falloir = {
      id: 11,
      infinitif: 'falloir',
      participe_present: '-',
      participe_passe: 'fallu',
      auxiliaire_participe_present: 'ayant',
    }
    assert.equal(formatNonFiniteQuestion(falloir, { id: 20, name: 'présent', mode_name: 'participe' }), null)
    assert.equal(formatNonFiniteQuestion(falloir, { id: 22, name: 'présent', mode_name: 'gérondif' }), null)
    assert.equal(formatNonFiniteQuestion(falloir, { id: 23, name: 'passé', mode_name: 'gérondif' }), null)
    assert.deepEqual(
      formatNonFiniteQuestion(falloir, { id: 21, name: 'passé', mode_name: 'participe' })?.reponsesPourCorrige,
      ['Fallu'],
    )
  })
})
