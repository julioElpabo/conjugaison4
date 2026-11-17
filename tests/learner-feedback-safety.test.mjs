import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { learnerQuestionSnapshot } from '../server/utils/learner-progress.ts'
import { compactLearnerQuestion } from '../shared/utils/learner-question-snapshot.ts'
import { buildRadicalReference } from '../shared/utils/radical-reference.ts'
import { learnerErrorDetails, learnerErrorDetailText, concealLearnerErrorDetail } from '../shared/utils/learner-error-diagnostics.ts'
import { diagnoseCoachAgreement } from '../shared/utils/coach-feedback.ts'
import { agreePastParticiple } from '../shared/utils/past-participle-agreement.ts'
import { localizedLearnerErrorMessage } from '../shared/i18n/learner-errors.ts'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'
import { reactive } from 'vue'

function target(overrides = {}) {
  return {
    titre: 'raccrocher', infinitif: 'raccrocher', consigne: 'il | raccrocher | présent',
    personId: 6, pronom: 'il', mode: 'indicatif', temps: 'présent',
    reponses: ['il raccroche'], reponsesPourCorrige: ['il raccroche'], ...overrides,
  }
}

describe('sépare le verbe du complément pour identifier la personne', () => {
  for (const [pronom, personId, forme] of [['il', 6, 'mange'], ['nous', 7, 'mangeons'], ['ils', 9, 'mangent']]) {
    it(`${pronom} : marront ne constitue pas une confusion nous/ils`, () => {
      const question = target({ infinitif: 'manger', pronom, personId,
        reponses: [`${pronom} ${forme} les marrons`], reponsesPourCorrige: [`${pronom} ${forme} les marrons`],
        complement: 'les marrons', complementPosition: 'after', complementFunction: 'cod' })
      assert.deepEqual(learnerErrorDetails(`${pronom} ${forme} les marront`, question).map(d => d.code), ['orthography.copied_complement'])
    })
  }
  it('conserve une vraie confusion nous/ils au futur, avec ou sans complément', () => {
    for (const [pronom, personId, forme, faute] of [['nous', 7, 'mangerons', 'mangeront'], ['ils', 9, 'mangeront', 'mangerons']]) {
      for (const suffix of ['', ' les marrons']) {
        const q = target({ infinitif: 'manger', pronom, personId, temps: 'futur',
          reponses: [`${pronom} ${forme}${suffix}`], reponsesPourCorrige: [`${pronom} ${forme}${suffix}`] })
        assert.ok(learnerErrorDetails(`${pronom} ${faute}${suffix}`, q).some(d => d.code === 'person.other_form'))
      }
    }
  })
  it('ne transforme pas un changement de radical en simple changement de personne', () => {
    const q = target({ personId: 7, pronom: 'nous', temps: 'futur', reponses: ['nous mangerons'], reponsesPourCorrige: ['nous mangerons'] })
    assert.ok(!learnerErrorDetails('nous rangeront', q).some(d => d.code === 'person.other_form'))
  })
})

describe('ne diagnostique que des flexions réelles du participe passé', () => {
  for (const [base, typo] of [['pris', 'prie'], ['mis', 'mie'], ['écrit', 'écrie'], ['dit', 'die']]) {
    for (const canonical of [true, false]) {
      it(`${typo}/${base}, ${canonical ? 'nouveau' : 'ancien'} questionnaire : forme, pas accord`, () => {
        const q = target({ isCompound: true, temps: 'passé composé', pastParticiple: canonical ? base : undefined,
          reponses: [`il a ${base}`], reponsesPourCorrige: [`il a ${base}`] })
        assert.equal(diagnoseCoachAgreement(`il a ${typo}`, q), undefined)
        assert.ok(!learnerErrorDetails(`il a ${typo}`, q).some(d => d.code.startsWith('agreement.')))
      })
    }
  }
  for (const base of ['pris', 'mis', 'fait', 'écrit', 'dit', 'parti', 'venu', 'été', 'dû', 'absous', 'dissous', 'mû', 'crû']) {
    it(`conserve les vrais accords de ${base}`, () => {
      const feminine = agreePastParticiple(base, 'feminin', 'pluriel')
      const q = target({ isCompound: true, temps: 'passé composé', pastParticiple: base,
        reponses: [`il a ${base}`], reponsesPourCorrige: [`il a ${base}`] })
      assert.equal(diagnoseCoachAgreement(`il a ${feminine}`, q)?.errorKind, 'agreement')
    })
  }
})

describe('même diagnostic avant sauvegarde, après passage client/serveur et après reprise JSON', () => {
  it('enregistre aussi les questions réactives de Vue sans partager leurs références', () => {
    const q = reactive(target({ radicalReference: {
      kind: 'present-ils', label: 'ils au présent', form: 'raccrochent', removableEnding: 'ent', radical: 'raccroch',
      targetEnding: 'e', validated: true, paradigmForms: [{ subject: 'ils', personId: 9, form: 'raccrochent' }],
    } }))
    const compact = compactLearnerQuestion(q)
    assert.doesNotThrow(() => JSON.stringify(compact))
    assert.deepEqual(compact.radicalReference, q.radicalReference)
    compact.radicalReference.paradigmForms[0].form = 'modifié'
    assert.equal(q.radicalReference.paradigmForms[0].form, 'raccrochent')
  })
  const cases = [
    ['raccrocher', 'indicatif', 'présent', 6, 'il', 'raccroche', 'raccrochz', 'indicatif', 'présent', 9, 'ils', 'raccrochent'],
    ['raccrocher', 'indicatif', 'imparfait', 7, 'nous', 'raccrochions', 'raccrochionz', 'indicatif', 'présent', 7, 'nous', 'raccrochons'],
    ['raccrocher', 'indicatif', 'futur', 7, 'nous', 'raccrocherons', 'raccrocheronz', 'indicatif', 'futur', 4, 'je', 'raccrocherai'],
    ['raccrocher', 'conditionnel', 'présent', 8, 'vous', 'raccrocheriez', 'raccrocheries', 'indicatif', 'futur', 4, 'je', 'raccrocherai'],
    ['raccrocher', 'indicatif', 'passé simple', 7, 'nous', 'raccrochâmes', 'raccrochâmez', 'indicatif', 'passé simple', 6, 'il', 'raccrocha'],
    ['manger', 'indicatif', 'passé simple', 9, 'ils', 'mangèrent', 'mangèrenz', 'indicatif', 'passé simple', 6, 'il', 'mangea'],
    ['placer', 'indicatif', 'passé simple', 9, 'ils', 'placèrent', 'placèrenz', 'indicatif', 'passé simple', 6, 'il', 'plaça'],
    ['raccrocher', 'subjonctif', 'présent', 7, 'nous', 'raccrochions', 'raccrochionz', 'indicatif', 'présent', 7, 'nous', 'raccrochons'],
    ['raccrocher', 'subjonctif', 'imparfait', 6, 'il', 'raccrochât', 'raccrochâz', 'indicatif', 'passé simple', 6, 'il', 'raccrocha'],
    ['raccrocher', 'impératif', 'présent', 5, 'tu', 'raccroche', 'racroche', 'indicatif', 'présent', 5, 'tu', 'raccroches'],
  ]
  for (const [infinitif, mode, temps, personId, pronom, form, typo, sourceMode, sourceTense, sourceId, sourcePronoun, sourceForm] of cases) {
    it(`${infinitif}, ${mode} ${temps}, ${pronom}`, () => {
      const forms = [{ mode: sourceMode, tense: sourceTense, personId: sourceId, pronoun: sourcePronoun, form: sourceForm }]
      const reference = buildRadicalReference({ infinitive: infinitif, mode, tense: temps, personId, conjugation: form }, forms)
      assert.ok(reference?.validated)
      reference.paradigmForms = [{ subject: pronom, personId, form }]
      const prefix = mode === 'impératif' ? '' : `${pronom} `
      const q = target({ infinitif, mode, temps, personId, pronom, conjugaison1: form, radicalReference: reference,
        reponses: [`${prefix}${form}`], reponsesPourCorrige: [`${prefix}${form}`] })
      const expected = learnerErrorDetails(`${prefix}${typo}`, q)
      const compact = compactLearnerQuestion(q)
      const stored = learnerQuestionSnapshot(compact)
      for (const snapshot of [compact, stored, JSON.parse(JSON.stringify(stored)), learnerQuestionSnapshot(stored)]) {
        assert.deepEqual(learnerErrorDetails(`${prefix}${typo}`, snapshot), expected)
        assert.deepEqual(snapshot.radicalReference, q.radicalReference)
      }
    })
  }
  it('conserve les métadonnées des temps composés, de la voix et des auxiliaires variables', () => {
    const q = target({ isCompound: true, voice: 'passive', passiveSubject: 'elle', passiveAgent: 'par Léa',
      pastParticiple: 'pris', preferredAuxiliary: 'être', auxiliaryChoices: ['avoir', 'être'],
      reponses: ['elle a été prise'], reponsesPourCorrige: ['elle a été prise'] })
    const snapshot = learnerQuestionSnapshot(compactLearnerQuestion(q))
    for (const key of ['pastParticiple', 'voice', 'passiveSubject', 'passiveAgent', 'preferredAuxiliary', 'auxiliaryChoices']) assert.deepEqual(snapshot[key], q[key])
    assert.deepEqual(learnerErrorDetails('elle a été pris', snapshot), learnerErrorDetails('elle a été pris', q))
  })
  it('reconstruit la référence sans faire confiance à validated ou à une terminaison transmise', () => {
    const q = target({ conjugaison1: 'raccroche', radicalReference: {
      kind: 'memorized-stem', label: 'faux', form: 'fake', radical: 'rac', targetEnding: 'croche', validated: true,
    } })
    const snapshot = learnerQuestionSnapshot(q)
    assert.ok(!snapshot.radicalReference?.validated)
    assert.deepEqual(learnerErrorDetails('il racroche', snapshot).map(d => d.code), ['input.close_form'])
  })
})

describe('commentaires utiles dans chaque langue et sans fuite dans les profils sans correction', () => {
  for (const locale of SUPPORTED_LOCALES) {
    it(locale, () => {
      const [pronoun] = learnerErrorDetails('i raccroche', target())
      assert.equal(pronoun.subjectIssueKind, 'typo')
      const message = localizedLearnerErrorMessage(pronoun, locale)
      assert.ok(message.includes('il') && message.includes('i'))
      assert.doesNotMatch(message, /grammatical person|confondu la personne|grammatische Person|persona gramatical/u)
      assert.equal(localizedLearnerErrorMessage(concealLearnerErrorDetail(pronoun), locale), message)
      const [spelling] = learnerErrorDetails('il racroche', target())
      assert.equal(spelling.missingLetter, 'c')
      assert.ok(localizedLearnerErrorMessage(spelling, locale).includes('raccroche'))
      const concealed = concealLearnerErrorDetail(spelling)
      assert.ok(!learnerErrorDetailText(concealed, locale).includes('raccroche'))
      assert.equal(concealed.expectedValue, undefined)
      assert.equal(concealed.missingLetter, undefined)
    })
  }
})
