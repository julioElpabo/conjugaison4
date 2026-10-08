import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'
import {
  initializeLearnerPreferenceClassification,
  ensureLearnerPreferenceClassification,
  parseLearnerPreferencesPatch,
  readLearnerPreferences,
  updateLearnerPreferences,
} from '../server/services/learner-preferences.ts'
import { useTenseClassification } from '../app/composables/useTenseClassification.ts'

function database() {
  const columns = new Set(['account_id', 'interface_locale', 'color_theme'])
  const rows = new Map([[1, { interface_locale: 'de', color_theme: 'dark' }]])
  const statements = []
  return {
    statements,
    async query(sql) {
      statements.push(sql)
      if (sql.startsWith('SHOW')) return [[...columns].map(Field => ({ Field }))]
      assert.match(sql, /^ALTER TABLE learner_preferences ADD COLUMN tense_classification/u)
      columns.add('tense_classification')
      for (const row of rows.values()) row.tense_classification = 'traditional'
      return [[]]
    },
    async execute(sql, params) {
      statements.push(sql)
      assert.ok(columns.has('tense_classification'))
      const insertion = sql.match(/INSERT INTO learner_preferences \(account_id, ([^)]+)\)/u)
      if (insertion) {
        const row = rows.get(params[0]) ?? { interface_locale: 'fr', color_theme: 'light', tense_classification: 'traditional' }
        insertion[1].split(', ').forEach((name, index) => { row[name] = params[index + 1] })
        rows.set(params[0], row)
        return [{}]
      }
      const row = rows.get(params[0])
      return [row ? [{ interfaceLocale: row.interface_locale, colorTheme: row.color_theme, tenseClassification: row.tense_classification }] : []]
    },
  }
}

test('la migration au démarrage est idempotente et conserve les préférences existantes', async () => {
  const db = database()
  assert.equal(await initializeLearnerPreferenceClassification(db), true)
  assert.equal(await initializeLearnerPreferenceClassification(db), false)
  assert.equal(db.statements.filter(sql => sql.startsWith('ALTER')).length, 1)
  assert.deepEqual(await readLearnerPreferences(db, 1), { interfaceLocale: 'de', colorTheme: 'dark', tenseClassification: 'traditional' })
})

test('les requêtes attendent la migration et peuvent la retenter après un échec', async () => {
  const db = database()
  const query = db.query
  let fail = true
  db.query = async sql => { if (fail) throw Error('Table indisponible'); return query(sql) }
  await assert.rejects(ensureLearnerPreferenceClassification(db), /indisponible/u)
  fail = false
  await Promise.all([ensureLearnerPreferenceClassification(db), ensureLearnerPreferenceClassification(db)])
  assert.equal(db.statements.filter(sql => sql.startsWith('ALTER')).length, 1)
})

test('les modifications partielles n’écrasent ni la langue, ni le thème, ni la classification', async () => {
  const db = database()
  assert.deepEqual(await updateLearnerPreferences(db, 1, { tenseClassification: 'modern' }), { interfaceLocale: 'de', colorTheme: 'dark', tenseClassification: 'modern' })
  assert.deepEqual(await updateLearnerPreferences(db, 1, { interfaceLocale: 'nl-NL', colorTheme: 'light' }), { interfaceLocale: 'nl-NL', colorTheme: 'light', tenseClassification: 'modern' })
  assert.deepEqual(await updateLearnerPreferences(db, 1, { tenseClassification: 'traditional' }), { interfaceLocale: 'nl-NL', colorTheme: 'light', tenseClassification: 'traditional' })
  assert.deepEqual(await updateLearnerPreferences(db, 2, { tenseClassification: 'modern' }), { interfaceLocale: 'fr', colorTheme: 'light', tenseClassification: 'modern' })
  assert.deepEqual(await readLearnerPreferences(db, 3), { interfaceLocale: 'fr', colorTheme: 'light', tenseClassification: 'traditional' })
})

test('valide les choix autorisés et refuse les valeurs ou champs inconnus', () => {
  for (const patch of [{ tenseClassification: 'modern' }, { tenseClassification: 'traditional' }, { interfaceLocale: 'fr', colorTheme: 'dark' }]) {
    assert.deepEqual(parseLearnerPreferencesPatch(patch), patch)
  }
  for (const invalid of [null, [], {}, { tenseClassification: 'autre' }, { tenseClassification: true }, { interfaceLocale: 'xx' }, { colorTheme: 'contrast' }, { accountId: 2 }, { toString: 'modern' }]) {
    assert.throws(() => parseLearnerPreferencesPatch(invalid), /Préférences invalides/u)
  }
})

function preferenceHarness({ learner = null, stored = 'traditional', read, write } = {}) {
  const state = new Map()
  const user = ref(learner)
  const app = {}
  const writes = []
  globalThis.useState = (key, init) => {
    if (!state.has(key)) state.set(key, ref(init()))
    return state.get(key)
  }
  globalThis.useLearnerAuth = () => ({ user })
  globalThis.useRequestFetch = () => read ?? (async () => ({ tenseClassification: stored }))
  globalThis.useNuxtApp = () => app
  globalThis.$fetch = async (_url, options) => { writes.push(options.body.tenseClassification); await write?.(options.body.tenseClassification) }
  return { ...useTenseClassification(), user, writes }
}

test('la classification traditionnelle est le défaut ; un visiteur anonyme ne déclenche aucune sauvegarde', async () => {
  const preference = preferenceHarness()
  assert.equal(preference.classification.value, 'traditional')
  await preference.setClassification('modern')
  assert.equal(preference.classification.value, 'modern')
  await preference.setClassification('traditional')
  assert.deepEqual(preference.writes, [])
})

test('restaure le choix connecté, puis enregistre les changements rapides dans leur ordre', async () => {
  const preference = preferenceHarness({ learner: { id: 1 }, stored: 'modern' })
  await preference.restoreClassification()
  assert.equal(preference.classification.value, 'modern')
  assert.deepEqual(preference.writes, [])
  await Promise.all([preference.setClassification('traditional'), preference.setClassification('modern')])
  assert.equal(preference.classification.value, 'modern')
  assert.deepEqual(preference.writes, ['traditional', 'modern'])
  preference.user.value = null
  await preference.restoreClassification()
  assert.equal(preference.classification.value, 'traditional')
})

test('une restauration tardive ne remplace pas une bascule effectuée entre-temps', async () => {
  let resolveRead
  const preference = preferenceHarness({ learner: { id: 1 }, read: () => new Promise(resolve => { resolveRead = resolve }) })
  const restoring = preference.restoreClassification()
  await preference.setClassification('modern')
  resolveRead({ tenseClassification: 'traditional' })
  await restoring
  assert.equal(preference.classification.value, 'modern')
})

test('une erreur d’enregistrement laisse la bascule active et remonte un message ; la suivante réussit', async () => {
  let fail = true
  const preference = preferenceHarness({ learner: { id: 1 }, write: async () => { if (fail) throw Error('Connexion interrompue') } })
  await preference.setClassification('modern')
  assert.equal(preference.classification.value, 'modern')
  assert.equal(preference.saveError.value, true)
  fail = false
  await preference.setClassification('traditional')
  assert.equal(preference.saveError.value, false)
})
