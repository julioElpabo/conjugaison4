import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { formatNonFiniteQuestion } from '../server/services/non-finite-formatter.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'
import { diagnoseCoachAnswer } from '../shared/utils/coach-feedback.ts'
import { learnerErrorDetails } from '../shared/utils/learner-error-diagnostics.ts'
import { coachHelpQuestionVariables } from '../shared/utils/coach-help.ts'
import { buildCompleteConjugationAdviceHtml, buildConjugationBaseHtml } from '../shared/utils/conjugation-help.ts'
import {
  resolveVariableAuxiliary,
  useEtreForIntransitiveCompound,
} from '../server/services/compound-auxiliary.ts'

const auxiliaries = [
  { personne_id: 4, mode_name: 'indicatif', temps_name: 'imparfait', conjugaison1: 'étais' },
  { personne_id: 6, mode_name: 'conditionnel', temps_name: 'présent', conjugaison1: 'serait' },
  { personne_id: 9, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'sont' },
]

function source(overrides = {}) {
  return {
    id: 1,
    verbe_id: 66,
    personne_id: 4,
    temp_id: 7,
    conjugaison1: 'avais sorti',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'sortir',
    auxiliaire: 'avoir',
    participe_passe: 'sorti',
    pronom: 'je',
    temps_name: 'plus-que-parfait',
    is_compound: 1,
    mode_name: 'indicatif',
    ...overrides,
  }
}

describe('auxiliaire variable de sortir', () => {
  it('emploie être sans COD', () => {
    const row = useEtreForIntransitiveCompound(source(), auxiliaries)
    assert.equal(row.auxiliaire, 'être')
    assert.equal(row.conjugaison1, 'étais sorti')
    assert.deepEqual(formatConjugationQuestion(row, 'je').reponsesPourCorrige, ["j'étais sorti", "j'étais sortie"])
  })

  it('accorde les personnes du pluriel avec être', () => {
    const row = useEtreForIntransitiveCompound(source({
      personne_id: 9,
      temp_id: 5,
      conjugaison1: 'ont sorti',
      pronom: 'ils',
      temps_name: 'passé composé',
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'sont sortis')
    assert.deepEqual(formatConjugationQuestion(row, 'elles').reponsesPourCorrige, ['elles sont sorties'])
  })

  it('construit le conditionnel passé avec être', () => {
    const row = useEtreForIntransitiveCompound(source({
      personne_id: 6,
      temp_id: 15,
      conjugaison1: 'aurait sorti',
      pronom: 'il',
      temps_name: 'passé 1',
      mode_name: 'conditionnel',
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'serait sorti')
  })

  it('conserve avoir lorsqu’un COD est proposé', () => {
    const sourceRow = source({ complement_function: 'cod' })
    const row = resolveVariableAuxiliary(sourceRow, auxiliaries)
    assert.equal(row.auxiliaire, 'avoir')
    assert.equal(row.conjugaison1, 'avais sorti')
  })
})

describe('deux auxiliaires admis sans contexte', () => {
  function question(overrides = {}, pronoun = 'je') {
    return formatConjugationQuestion(source({
      infinitif: 'monter', participe_passe: 'monté', conjugaison1: 'ai monté',
      temps_name: 'passé composé', ...overrides,
    }), pronoun)
  }

  it('accepte le cas signalé et distingue les accords des deux auxiliaires', () => {
    const target = question()
    assert.deepEqual(target.reponsesPourCorrige, ['je suis monté', 'je suis montée'])
    for (const answer of ['Je suis monté', 'je suis montée', 'j’ai monté']) {
      assert.equal(validateConjugationAnswer(answer, target).isCorrect, true, answer)
      assert.deepEqual(learnerErrorDetails(answer, target), [])
    }
    for (const answer of ['j’ai montée', 'je suis montés', 'je sont monté', 'suis monté', 'je serai monté']) {
      assert.equal(validateConjugationAnswer(answer, target).isCorrect, false, answer)
    }
  })

  for (const [infinitive, participle] of [
    ['descendre', 'descendu'], ['entrer', 'entré'], ['monter', 'monté'], ['passer', 'passé'],
    ['rentrer', 'rentré'], ['retourner', 'retourné'], ['sortir', 'sorti'], ['demeurer', 'demeuré'],
  ]) {
    it(`accorde les formes de ${infinitive} selon l’auxiliaire`, () => {
      const target = question({ infinitif: infinitive, participe_passe: participle, personne_id: 9 }, 'elles')
      assert.deepEqual(new Set(target.reponsesPourCorrige), new Set(infinitive === 'demeurer'
        ? [`elles ont ${participle}`, `elles sont ${participle}es`] : [`elles sont ${participle}es`]))
      assert.equal(validateConjugationAnswer(`elles ont ${participle}`, target).isCorrect, true)
      assert.equal(validateConjugationAnswer(`elles sont ${participle}`, target).isCorrect, false)
      assert.equal(validateConjugationAnswer(`elles ont ${participle}es`, target).isCorrect, false)
    })
  }

  for (const [mode, tense, avoir, etre] of [
    ['indicatif', 'plus-que-parfait', 'avais', 'étais'],
    ['indicatif', 'passé antérieur', 'eus', 'fus'],
    ['indicatif', 'futur antérieur', 'aurai', 'serai'],
    ['conditionnel', 'passé 1', 'aurais', 'serais'],
    ['conditionnel', 'passé 2', 'eusse', 'fusse'],
    ['subjonctif', 'passé', 'aie', 'sois'],
    ['subjonctif', 'plus-que-parfait', 'eusse', 'fusse'],
  ]) {
    it(`conserve le mode et le temps : ${mode} ${tense}`, () => {
      const target = question({ mode_name: mode, temps_name: tense })
      for (const answer of [`j'${avoir} monté`, `${etre === 'étais' ? "j'" : 'je '}${etre} monté`]) {
        assert.equal(validateConjugationAnswer(answer, target).isCorrect, true, answer)
      }
    })
  }

  it('construit les deux impératifs passés au pluriel', () => {
    const target = question({ mode_name: 'impératif', temps_name: 'passé', personne_id: 7 }, 'nous')
    assert.ok(target.reponses.includes('ayons monté'))
    assert.ok(target.reponses.includes('soyons montés'))
    assert.ok(target.reponses.includes('soyons montées'))
    assert.equal(validateConjugationAnswer('soyons monté', target).isCorrect, false)
  })

  it('ne généralise pas être aux verbes sans COD', () => {
    for (const [infinitive, participle, form, invalid] of [
      ['dormir', 'dormi', 'ai dormi', 'je suis dormi'],
      ['marcher', 'marché', 'ai marché', 'je suis marché'],
      ['partir', 'parti', 'suis parti', "j'ai parti"],
    ]) {
      const target = question({ infinitif: infinitive, participe_passe: participle, conjugaison1: form })
      assert.equal(target.auxiliaryChoices, undefined)
      assert.equal(validateConjugationAnswer(invalid, target).isCorrect, false)
    }
    assert.equal(question({ infinitif: 'se monter' }).auxiliaryChoices, undefined)
  })

  it('respecte le COD affiché, placé avant ou après', () => {
    for (const position of ['after', 'before']) {
      const target = question({
        infinitif: 'descendre', participe_passe: 'descendu', auxiliaire: 'être', conjugaison1: 'suis descendu',
        complement_phrase: 'les valises', complement_anteposed: position === 'before' ? 'les valises que' : null,
        complement_position: position, complement_function: 'cod', complement_gender: 'feminin', complement_number: 'pluriel',
      })
      assert.equal(target.auxiliaryChoices, undefined)
      assert.equal(validateConjugationAnswer('je suis descendu', target).isCorrect, false)
      assert.ok(target.reponses.some(answer => answer.includes(position === 'before' ? 'ai descendues' : 'ai descendu')))
    }
  })

  it('conserve être pour sortir avec un contexte indirect', () => {
    const row = resolveVariableAuxiliary(source({ complement_phrase: 'à mon ami', complement_function: 'coi' }), auxiliaries)
    const target = formatConjugationQuestion(row, 'je')
    assert.equal(target.auxiliaryChoices, undefined)
    assert.ok(target.reponses.includes("j'étais sorti"))
    assert.ok(!target.reponses.includes("j'avais sorti"))
  })

  it('diagnostique l’accord sans remettre en cause un auxiliaire admis', () => {
    const target = question({ personne_id: 9 }, 'elles')
    for (const [answer, code] of [['elles sont monté', 'agreement.subject'], ['elles ont montées', 'agreement.avoir_unwarranted']]) {
      const diagnostic = diagnoseCoachAnswer(answer, target, false)
      assert.equal(diagnostic.errorKind, 'agreement', answer)
      assert.deepEqual(learnerErrorDetails(answer, target).map(detail => detail.code), [code])
      assert.ok(diagnostic.expectedAnswer.startsWith(answer.startsWith('elles sont') ? 'elles sont' : 'elles ont'))
    }
  })

  it('présente le modèle avec être sans imposer deux auxiliaires à apprendre', () => {
    const target = question()
    const verb = { id: 1, infinitif: 'monter', participePasse: 'monté', auxiliaire: 'avoir', groupeConjugaison: 1, typePronominal: 'aucun' }
    assert.equal(target.preferredAuxiliary, 'être')
    assert.equal(target.conjugaison1, 'suis monté')
    const values = coachHelpQuestionVariables(target, verb)
    assert.equal(values.auxiliaryAnswer, 'suis')
    assert.equal(values.auxiliary, 'être')
    for (const html of [buildConjugationBaseHtml(target, verb), buildCompleteConjugationAdviceHtml(target, verb), values.condensedTenseRuleHelp]) {
      assert.doesNotMatch(html, /auxiliaires avoir et être sont acceptés|Choisis avoir ou être|j'ai monté/u)
    }
    assert.doesNotMatch(buildCompleteConjugationAdviceHtml(target, verb), /je suis monté/u)
  })

  it('corrige les accords masculins même si une variante féminine est stockée', () => {
    for (const [subject, person, expected] of [['il', 6, 'il est resté'], ['elle', 6, 'elle est restée'], ['ils', 9, 'ils sont restés'], ['elles', 9, 'elles sont restées']]) {
      const target = question({ infinitif: 'rester', participe_passe: 'resté', auxiliaire: 'être', conjugaison1: person === 9 ? 'sont restées' : 'est restée', personne_id: person }, subject)
      assert.deepEqual(target.reponsesPourCorrige, [expected])
      assert.equal(validateConjugationAnswer(expected, target).isCorrect, true)
      if (subject === 'il') assert.equal(validateConjugationAnswer('il est restée', target).isCorrect, false)
      if (subject === 'ils') assert.equal(validateConjugationAnswer('ils sont restées', target).isCorrect, false)
    }
  })

  it('accepte aussi les deux auxiliaires à l’infinitif passé et au gérondif passé', () => {
    for (const [mode, answers] of [
      ['infinitif', ['avoir monté', 'être monté', 'être montée']],
      ['gérondif', ['en ayant monté', 'en étant monté', 'en étant montées']],
    ]) {
      const target = formatNonFiniteQuestion({ id: 1, infinitif: 'monter', participe_present: 'montant', participe_passe: 'monté', auxiliaire_infinitif: 'avoir', auxiliaire_participe_present: 'ayant' }, { id: 1, name: 'passé', mode_name: mode, is_compound: 1 })
      for (const answer of answers) assert.equal(validateConjugationAnswer(answer, target).isCorrect, true, answer)
      assert.ok(target.reponsesPourCorrige.every(answer => !/^(?:avoir|en ayant) /iu.test(answer)))
    }
  })
})
