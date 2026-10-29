import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { diagnoseCoachAgreement, diagnoseCoachAnswer } from '../shared/utils/coach-feedback.ts'
import { diagnoseLearnerError, learnerErrorDetails } from '../shared/utils/learner-error-diagnostics.ts'
import { agreePastParticiple } from '../shared/utils/past-participle-agreement.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'

const verbs = [
  ['savoir', 'su'], ['voir', 'vu'], ['lire', 'lu'], ['prendre', 'pris'],
  ['comprendre', 'compris'], ['apprendre', 'appris'], ['faire', 'fait'], ['dire', 'dit'],
  ['écrire', 'écrit'], ['mettre', 'mis'], ['ouvrir', 'ouvert'], ['recevoir', 'reçu'],
  ['connaître', 'connu'], ['finir', 'fini'], ['aimer', 'aimé'], ['manger', 'mangé'],
]

function target(infinitive = 'savoir', participle = 'su', overrides = {}) {
  return {
    titre: infinitive, consigne: `elles | ${infinitive} | passé composé`,
    reponses: [`elles ont ${participle}`], reponsesPourCorrige: [`elles ont ${participle}`],
    infinitif: infinitive, pronom: 'elles', personId: 9, temps: 'passé composé', mode: 'indicatif',
    isCompound: true, voice: 'active', ...overrides,
  }
}

describe('diagnostic fondé sur la construction réellement saisie', () => {
  it('corrige le cas « elles furent sues » sans inventer un accord avec avoir', () => {
    const question = target()
    assert.equal(validateConjugationAnswer('elles furent sues', question).isCorrect, false)
    assert.equal(diagnoseCoachAgreement('elles furent sues', question), undefined)
    const details = learnerErrorDetails('elles furent sues', question)
    assert.deepEqual(details.map(detail => detail.code), ['compound.auxiliary'])
    assert.equal(details[0].message,
      'Au passé composé, à la voix active, « savoir » se construit avec l’auxiliaire « avoir » : « elles ont su ». Avec avoir, sans COD placé avant, le participe passé reste invariable.')
    assert.doesNotMatch(details[0].message, /Tu as accordé|mal accordé|accord incorrect/iu)
  })

  for (const [infinitive, participle] of verbs) {
    it(`ne juge pas l’accord d’une autre construction de ${infinitive}`, () => {
      const question = target(infinitive, participle)
      const agreed = agreePastParticiple(participle, 'feminin', 'pluriel')
      for (const auxiliary of ['sont', 'étaient', 'furent', 'seront', 'seraient', 'soient', 'fussent']) {
        const answer = `elles ${auxiliary} ${agreed}`
        assert.equal(diagnoseCoachAgreement(answer, question), undefined, answer)
        assert.deepEqual(diagnoseLearnerError(answer, question).map(tag => tag.code), ['compound.auxiliary'], answer)
      }
      const passiveCompound = `elles ont été ${agreed}`
      assert.equal(diagnoseCoachAgreement(passiveCompound, question), undefined)
      assert.deepEqual(diagnoseLearnerError(passiveCompound, question).map(tag => tag.code), ['compound.auxiliary'])
      // Avec avoir effectivement saisi, l’accord indu doit rester signalé.
      const wrongAgreement = `elles ont ${agreed}`
      assert.equal(diagnoseCoachAgreement(wrongAgreement, question)?.agreementSource, 'avoir')
      assert.deepEqual(diagnoseLearnerError(wrongAgreement, question).map(tag => tag.code), ['agreement.avoir_unwarranted'])
    })
  }

  it('couvre les personnes du singulier et du pluriel', () => {
    for (const [pronoun, personId, avoir, etre, participle] of [
      ['je', 4, "j'ai su", 'je fus sue', 'sue'], ['tu', 5, 'tu as su', 'tu fus sue', 'sue'],
      ['elle', 6, 'elle a su', 'elle fut sue', 'sue'], ['nous', 7, 'nous avons su', 'nous fûmes sues', 'sues'],
      ['vous', 8, 'vous avez su', 'vous fûtes sues', 'sues'], ['elles', 9, 'elles ont su', 'elles furent sues', 'sues'],
    ]) {
      const question = target('savoir', 'su', { pronom: pronoun, personId, reponses: [avoir], reponsesPourCorrige: [avoir] })
      assert.deepEqual(diagnoseLearnerError(etre, question).map(tag => tag.code), ['compound.auxiliary'], participle)
    }
  })

  it('couvre les autres temps et modes demandés', () => {
    for (const [mode, temps, answer] of [
      ['indicatif', 'plus-que-parfait', 'elles avaient su'], ['indicatif', 'passé antérieur', 'elles eurent su'],
      ['indicatif', 'futur antérieur', 'elles auront su'], ['conditionnel', 'passé 1', 'elles auraient su'],
      ['subjonctif', 'passé', "qu'elles aient su"], ['subjonctif', 'plus-que-parfait', "qu'elles eussent su"],
    ]) {
      const question = target('savoir', 'su', { mode, temps, reponses: [answer], reponsesPourCorrige: [answer] })
      assert.equal(diagnoseCoachAgreement('elles furent sues', question), undefined)
      assert.deepEqual(diagnoseLearnerError('elles furent sues', question).map(tag => tag.code), ['compound.auxiliary'])
    }
  })

  it('ne compare pas non plus l’accord si avoir remplace être', () => {
    const question = target('partir', 'parties', { reponses: ['elles sont parties'], reponsesPourCorrige: ['elles sont parties'] })
    assert.equal(diagnoseCoachAgreement('elles ont parti', question), undefined)
    assert.deepEqual(diagnoseLearnerError('elles ont parti', question).map(tag => tag.code), ['compound.auxiliary'])
    assert.equal(diagnoseCoachAgreement('elles sont parti', question)?.agreementSource, 'subject')
  })

  it('distingue le passif composé de la construction active avec avoir', () => {
    const question = target('voir', 'vues', { voice: 'passive', reponses: ['elles ont été vues'], reponsesPourCorrige: ['elles ont été vues'] })
    assert.equal(diagnoseCoachAgreement('elles ont vu', question), undefined)
    assert.deepEqual(diagnoseLearnerError('elles ont vu', question).map(tag => tag.code), ['compound.auxiliary'])
    assert.equal(diagnoseCoachAgreement('elles ont été vu', question)?.agreementSource, 'subject')
    assert.deepEqual(diagnoseLearnerError('elles ont été vu', question).map(tag => tag.code), ['agreement.subject'])
  })

  it('ne prend pas un complément final pour le participe passé à vérifier', () => {
    const question = target('écrire', 'écrit', {
      reponses: ['elles ont écrit', 'elles ont écrit les lettres'], reponsesPourCorrige: ['elles ont écrit les lettres'],
      complement: 'les lettres', complementPosition: 'after', complementFunction: 'cod',
      agreementReminder: { kind: 'cod-after', infinitive: 'écrire', complement: 'les lettres', participle: 'écrit' },
    })
    assert.equal(diagnoseCoachAgreement('elles sont écrites les lettres', question), undefined)
    assert.equal(diagnoseCoachAgreement('elles ont écrites les lettres', question)?.agreementSource, 'cod-after')
    const misspelledComplement = 'elles ont écrit les lettre'
    assert.equal(diagnoseCoachAgreement(misspelledComplement, question), undefined)
    assert.deepEqual(diagnoseLearnerError(misspelledComplement, question).map(tag => tag.code), ['orthography.copied_complement'])
    assert.notEqual(diagnoseCoachAnswer(misspelledComplement, question, false).errorKind, 'agreement')
  })

  it('conserve une vraie erreur d’accord lorsque seul le temps du même auxiliaire change', () => {
    const question = target('lire', 'lues', {
      reponses: ['elles avaient lues'], reponsesPourCorrige: ['les lettres qu’elles avaient lues'],
      temps: 'plus-que-parfait',
      agreementReminder: { kind: 'cod-before', infinitive: 'lire', complement: 'les lettres', participle: 'lues' },
      conjugationConfusions: [{ mode: 'indicatif', tense: 'passé composé', answers: ['elles ont lu'] }],
    })
    assert.deepEqual(diagnoseLearnerError('elles ont lu', question).map(tag => tag.code), ['task.wrong_tense', 'agreement.cod_before'])
    assert.equal(diagnoseCoachAnswer('elles furent lues', question, false).errorKind, 'auxiliary')
  })

  it('ne confond pas la présence du pronom réfléchi et un simple accord', () => {
    const question = target('se laver', 'lavées', { reponses: ['elles se sont lavées'], reponsesPourCorrige: ['elles se sont lavées'] })
    assert.equal(diagnoseCoachAgreement('elles sont lavé', question), undefined)
    assert.equal(diagnoseCoachAgreement('elles se sont lavé', question)?.agreementSource, 'subject')
    assert.notEqual(diagnoseCoachAnswer('elles sont lavé', question, false).errorKind, 'auxiliary')
  })

  it('distingue les noms homographes d’un auxiliaire dans un complément placé avant', () => {
    const question = target('voir', 'vus', {
      reponses: ['elles ont vus', 'les avions qu’elles ont vus'], reponsesPourCorrige: ['les avions qu’elles ont vus'],
      agreementReminder: { kind: 'cod-before', infinitive: 'voir', complement: 'les avions', participle: 'vus' },
    })
    assert.equal(diagnoseCoachAgreement('les avions qu’elles ont vu', question)?.agreementSource, 'cod-before')
    assert.equal(diagnoseCoachAgreement('les avions qu’elles furent vues', question), undefined)
    const passive = target('voir', 'vus', { voice: 'passive', pronom: 'les avions', passiveSubject: 'les avions', reponses: ['les avions sont vus'], reponsesPourCorrige: ['les avions sont vus'] })
    assert.equal(diagnoseCoachAgreement('les avions sont vu', passive)?.agreementSource, 'subject')
  })

  it('reconnaît être comme verbe étudié et comme auxiliaire du passif', () => {
    const etre = target('être', 'été')
    assert.equal(diagnoseCoachAgreement('elles ont étées', etre)?.agreementSource, 'avoir')
    const passive = target('lire', 'lues', { voice: 'passive', isCompound: false, temps: 'passé simple', reponses: ['elles furent lues'], reponsesPourCorrige: ['elles furent lues'] })
    assert.equal(diagnoseCoachAgreement('elles furent lu', passive)?.agreementSource, 'subject')
  })
})
