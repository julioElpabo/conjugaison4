import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { useDatabase } from '../server/utils/database.ts'
import { generateQuestionnaire } from '../server/services/questionnaire.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let db
let verbs
let tenses
let pronominalId
const base = {
  questionCount: 100, exerciseKind: 'conjugation', identificationSource: 'selected-verbs',
  pastSimplePronouns: 'all', inclusivePronouns: true, includeOnPronoun: true,
  learningSupportMode: 'normal', voiceMode: 'active', includeComplements: false,
  complementPlacement: 'after', complementOptions: [],
}

before(async () => {
  if (!configured) return
  globalThis.useRuntimeConfig = () => ({ dbHost: process.env.DB_HOST, dbPort: Number(process.env.DB_PORT || 3306), dbName: process.env.DB_NAME, dbUser: process.env.DB_USER, dbPassword: process.env.DB_PASSWORD })
  db = useDatabase()
  ;[verbs] = await db.query("SELECT id, infinitif FROM verbes WHERE infinitif IN ('aimer', 'laver', 'pleuvoir') AND est_archive=0")
  ;[tenses] = await db.query("SELECT t.id, t.name, m.name AS mode FROM temps t JOIN modes m ON m.id=t.mode_id WHERE m.name IN ('indicatif', 'impératif', 'infinitif')")
  const [uses] = await db.query("SELECT id FROM emplois_pronominaux WHERE infinitif_pronominal='se laver' AND actif=1 AND verbe_id IS NOT NULL LIMIT 1")
  pronominalId = uses[0] ? -Number(uses[0].id) : undefined
})
after(async () => {
  await db?.end()
  if (configured) delete globalThis.useRuntimeConfig
})
const verb = name => Number(verbs.find(item => item.infinitif === name)?.id)
const tense = (name, mode = 'indicatif') => Number(tenses.find(item => item.name === name && item.mode === mode)?.id)

describe('sélection des personnes avec les données réelles (lecture seule)', { skip: !configured }, () => {
  for (const exerciseKind of ['conjugation', 'tense-identification', 'infinitive-identification']) {
    it(`${exerciseKind} : je, tu et vous, y compris au futur proche`, async () => {
      const tenseIds = [tense('présent'), tense('futur proche'), tense('passé simple')]
      assert.ok(verb('aimer') && tenseIds.every(Boolean))
      const questions = await generateQuestionnaire({ ...base, exerciseKind, verbIds: [verb('aimer')], tenseIds, personIds: [4, 5, 8] })
      assert.ok(questions.length)
      assert.ok(questions.every(question => [4, 5, 8].includes(question.personId)))
      assert.deepEqual(new Set(questions.map(question => question.personId)), new Set([4, 5, 8]))
      for (const id of tenseIds.slice(0, exerciseKind === 'infinitive-identification' ? 1 : 3)) {
        assert.ok(questions.some(question => question.tenseId === id))
      }
    })
  }
  it('filtre aussi les verbes pronominaux', async () => {
    assert.ok(pronominalId)
    const questions = await generateQuestionnaire({ ...base, verbIds: [pronominalId], tenseIds: [tense('présent'), tense('futur proche')], personIds: [4, 5, 8] })
    assert.ok(questions.length)
    assert.ok(questions.every(question => [4, 5, 8].includes(question.personId)))
    assert.equal(new Set(questions.map(question => question.tenseId)).size, 2)
  })
  it('l’impératif ne fournit que les personnes compatibles', async () => {
    const tenseIds = [tense('présent', 'impératif')]
    assert.ok(tenseIds[0])
    const questions = await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds, personIds: [4, 5, 8] })
    assert.deepEqual(new Set(questions.map(question => question.personId)), new Set([5, 8]))
    assert.deepEqual(await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds, personIds: [4] }), [])
  })
  it('ne remplace pas une personne interdite pour un impersonnel', async () => {
    assert.ok(verb('pleuvoir'))
    const request = { ...base, verbIds: [verb('pleuvoir')], tenseIds: [tense('présent'), tense('futur proche')] }
    assert.deepEqual(await generateQuestionnaire({ ...request, personIds: [4, 5, 8] }), [])
    const questions = await generateQuestionnaire({ ...request, personIds: [6] })
    assert.ok(questions.length)
    assert.ok(questions.every(question => question.personId === 6 && question.pronom === 'il'))
  })
  it('conserve les formes sans personne', async () => {
    const questions = await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds: [tense('présent', 'infinitif')], personIds: [4] })
    assert.ok(questions.length)
    assert.ok(questions.every(question => question.personId == null))
  })
  it('conserve la restriction historique par temps', async () => {
    const questions = await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds: [tense('présent'), tense('passé simple'), tense('passé antérieur')], pastSimplePronouns: 'third-person-only' })
    assert.ok(questions.some(question => question.temps === 'présent' && question.personId === 4))
    assert.ok(questions.some(question => question.temps === 'passé simple'))
    assert.ok(questions.filter(question => ['passé simple', 'passé antérieur'].includes(question.temps)).every(question => [6, 9].includes(question.personId)))
  })
  it('applique les personnes aux citations littéraires avant leur tirage', async () => {
    const [targets] = await db.query("SELECT DISTINCT tense_id FROM literary_targets WHERE review_status='validated' AND person_id=4")
    assert.ok(targets.length)
    const questions = await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds: targets.map(row => Number(row.tense_id)), exerciseKind: 'tense-identification', identificationSource: 'literary-corpus', personIds: [4] })
    assert.ok(questions.length)
    assert.ok(questions.every(question => question.personId === 4 && question.literaryCitation))
  })
  it('conserve les personnes dans un mélange de types d’exercice', async () => {
    const questions = await generateQuestionnaire({ ...base, verbIds: [verb('aimer')], tenseIds: [tense('présent')], questionCount: 6, exerciseKinds: ['conjugation', 'tense-identification'], personIds: [4, 5, 8] })
    assert.equal(questions.length, 6)
    assert.equal(new Set(questions.map(question => question.exerciseKind)).size, 2)
    assert.ok(questions.every(question => [4, 5, 8].includes(question.personId)))
  })
})
