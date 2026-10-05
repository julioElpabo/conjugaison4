import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { useDatabase } from '../server/utils/database.ts'
import { generateQuestionnaire } from '../server/services/questionnaire.ts'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let database
let verbs = []
let tenses = []
let expectedCoordinates = []

before(async () => {
  if (!databaseConfigured) return
  globalThis.useRuntimeConfig = () => ({
    dbHost: process.env.DB_HOST,
    dbPort: Number(process.env.DB_PORT || 3306),
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
  })
  database = useDatabase()
  ;[verbs] = await database.query('SELECT id, infinitif FROM verbes WHERE est_impersonnel=1 AND est_archive=0')
  ;[tenses] = await database.query(`
    SELECT t.id, t.name, t.code FROM temps t
    JOIN modes m ON m.id=t.mode_id
    WHERE m.name IN ('indicatif', 'subjonctif', 'conditionnel', 'impératif')
  `)
  ;[expectedCoordinates] = await database.query(`
    SELECT vc.verbe_id, vc.temp_id FROM verbesconjugues vc
    JOIN verbes v ON v.id=vc.verbe_id
    JOIN personnes p ON p.id=vc.personne_id
    JOIN temps t ON t.id=vc.temp_id
    JOIN modes m ON m.id=t.mode_id
    WHERE v.est_impersonnel=1 AND v.est_archive=0 AND p.pronom='il'
      AND vc.conjugaison1<>'' AND t.code<>'near-future'
      AND m.name IN ('indicatif', 'subjonctif', 'conditionnel', 'impératif')
  `)
})

after(async () => {
  await database?.end()
  if (databaseConfigured) delete globalThis.useRuntimeConfig
})

describe('questionnaires des verbes impersonnels à tous les temps', { skip: !databaseConfigured }, () => {
  for (const exerciseKind of ['conjugation', 'tense-identification']) {
    for (const inclusivePronouns of [false, true]) {
      for (const includeOnPronoun of [false, true]) {
        it(`${exerciseKind}, inclusifs=${inclusivePronouns}, on=${includeOnPronoun} : seulement il`, async () => {
          assert.ok(verbs.some(verb => verb.infinitif === 'falloir'))
          assert.ok(verbs.some(verb => verb.infinitif === 'pleuvoir'))
          const questions = await generateQuestionnaire({
            verbIds: verbs.map(verb => Number(verb.id)),
            tenseIds: tenses.map(tense => Number(tense.id)),
            questionCount: 500,
            exerciseKind,
            identificationSource: 'selected-verbs',
            pastSimplePronouns: 'all',
            inclusivePronouns,
            includeOnPronoun,
            learningSupportMode: 'normal',
            voiceMode: 'active',
            includeComplements: false,
            complementPlacement: 'after',
            complementOptions: [],
          })
          assert.ok(questions.length > 0)
          for (const question of questions) {
            assert.equal(question.pronom, 'il', question.consigne)
            assert.equal(question.personId, 6, question.consigne)
          }
          const actual = new Set(questions.map(question => `${question.verbeId}:${question.tenseId}`))
          for (const row of expectedCoordinates) {
            assert.ok(actual.has(`${row.verbe_id}:${row.temp_id}`), `Temps perdu : ${JSON.stringify(row)}`)
          }
          const nearFuture = tenses.find(tense => tense.code === 'near-future')
          assert.ok(nearFuture)
          for (const verb of verbs) assert.ok(actual.has(`${verb.id}:${nearFuture.id}`))
          const futurePerfect = tenses.find(tense => tense.name === 'futur antérieur')
          const falloir = verbs.find(verb => verb.infinitif === 'falloir')
          assert.ok(actual.has(`${falloir.id}:${futurePerfect.id}`))
        })
      }
    }
  }
})
