import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { useDatabase } from '../server/utils/database.ts'
import { generateQuestionnaire } from '../server/services/questionnaire.ts'
import { identifyInfinitives } from '../server/services/infinitive-identification.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let database
let verbs
let tenses
let pronominals
before(async () => {
  if (!configured) return
  globalThis.useRuntimeConfig = () => ({ dbHost: process.env.DB_HOST, dbPort: Number(process.env.DB_PORT || 3306), dbName: process.env.DB_NAME, dbUser: process.env.DB_USER, dbPassword: process.env.DB_PASSWORD })
  database = useDatabase()
  ;[verbs] = await database.query("SELECT id,infinitif FROM verbes WHERE est_archive=0 AND infinitif IN ('être','suivre','voir','vivre','prendre','chanter','croire','croître')")
  ;[tenses] = await database.query('SELECT t.id,t.name,t.code,m.name AS mode FROM temps t JOIN modes m ON m.id=t.mode_id')
  ;[pronominals] = await database.query("SELECT id,infinitif_pronominal FROM emplois_pronominaux WHERE actif=1 AND verbe_id IS NOT NULL AND infinitif_pronominal IN ('se souvenir','se lever')")
})
after(async () => { await database?.end(); if (configured) delete globalThis.useRuntimeConfig })

const config = (infinitive, selected) => ({
  verbIds: [Number(verbs.find(verb => verb.infinitif === infinitive).id)],
  tenseIds: tenses.filter(selected).map(tense => Number(tense.id)), questionCount: 100,
  exerciseKind: 'infinitive-identification', identificationSource: 'selected-verbs',
  pastSimplePronouns: 'all', inclusivePronouns: false, includeOnPronoun: false,
  learningSupportMode: 'normal', voiceMode: 'active', includeComplements: false,
  complementPlacement: 'after', complementOptions: [],
})

test('la base reconnaît les infinitifs hors sélection et hors temps sélectionnés', { skip: !configured }, async () => {
  const present = tense => tense.mode === 'indicatif' && tense.name === 'présent'
  const etre = await generateQuestionnaire(config('être', present))
  assert.deepEqual(etre.find(question => question.consigne === 'je suis').reponsesPourCorrige, ['être', 'suivre'])
  const vivre = await generateQuestionnaire(config('vivre', present))
  assert.ok(vivre.find(question => question.consigne === 'il vit').reponses.includes('voir'))
  assert.ok(vivre.every(question => question.exerciseKind === 'infinitive-identification'))
})

test('les temps composés, participes et gérondifs demandent le verbe principal', { skip: !configured }, async () => {
  const questions = await generateQuestionnaire(config('prendre', tense =>
    (tense.mode === 'indicatif' && tense.name === 'passé composé') || ['participe', 'gérondif'].includes(tense.mode)))
  for (const question of questions) {
    assert.ok(question.reponses.includes('prendre'))
    assert.ok(!question.reponses.includes('avoir'))
    assert.doesNotMatch(question.consigne, /prendre/u)
  }
  assert.ok(questions.some(question => question.mode === 'participe'))
  assert.ok(questions.filter(question => question.mode === 'participe').every(question => !question.isCompound))
  assert.ok(questions.some(question => question.mode === 'gérondif'))
  assert.ok(questions.filter(question => question.temps === 'passé composé').every(question => question.isCompound))
})

test('les infinitifs déjà visibles sont exclus et une sélection inutilisable est expliquée', { skip: !configured }, async () => {
  const questions = await generateQuestionnaire(config('chanter', tense => tense.mode === 'indicatif' || tense.mode === 'infinitif'))
  assert.ok(questions.every(question => question.mode !== 'infinitif' && question.temps !== 'futur proche'))
  await assert.rejects(generateQuestionnaire(config('chanter', tense => tense.mode === 'infinitif' || tense.code === 'near-future')), /choisis un temps autre/u)
})

test('les formes pronominales gardent leur infinitif pronominal', { skip: !configured }, async () => {
  const use = pronominals.find(use => use.infinitif_pronominal === 'se souvenir') || pronominals[0]
  assert.ok(use)
  const questions = await generateQuestionnaire({ ...config('être', tense => tense.mode === 'indicatif' && tense.name === 'présent'), verbIds: [-Number(use.id)] })
  assert.ok(questions.length)
  assert.ok(questions.every(question => question.reponses.includes(use.infinitif_pronominal) && !question.reponses.includes(use.infinitif_pronominal.replace(/^se /u, ''))))
})

test('les citations ambiguës attendent une validation du contexte', { skip: !configured }, async () => {
  const question = {
    id: 'citation', titre: 'être', infinitif: 'être', consigne: 'Je suis ici.',
    pronom: 'je', mode: 'indicatif', temps: 'présent', conjugaison1: 'suis',
    reponses: [], reponsesPourCorrige: [],
    literaryCitation: { before: 'Je ', target: 'suis', after: ' ici.', author: '', work: '', sourceUrl: '' },
  }
  assert.deepEqual(await identifyInfinitives([question]), [])
})

test('les citations non ambiguës et le mélange réel des trois types sont disponibles', { skip: !configured }, async () => {
  const request = config('prendre', tense => ['indicatif', 'subjonctif', 'conditionnel', 'impératif'].includes(tense.mode))
  const literary = await generateQuestionnaire({ ...request, identificationSource: 'literary-corpus', questionCount: 10 })
  assert.ok(literary.length)
  assert.ok(literary.every(question => question.literaryCitation && question.reponsesPourCorrige.length === 1))
  const mixed = await generateQuestionnaire({ ...request, questionCount: 20, exerciseKind: 'mixed', exerciseKinds: ['conjugation', 'tense-identification', 'infinitive-identification'] })
  assert.equal(mixed.length, 20)
  const counts = ['conjugation', 'tense-identification', 'infinitive-identification'].map(kind => mixed.filter(question => question.exerciseKind === kind).length)
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1)
})
