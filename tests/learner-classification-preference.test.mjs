import assert from 'node:assert/strict'
import test from 'node:test'
import { ref, watch } from 'vue'
import {
  initializeLearnerPreferenceClassification,
  ensureLearnerPreferenceClassification,
  parseLearnerPreferencesPatch,
  readLearnerPreferences,
  updateLearnerPreferences,
} from '../server/services/learner-preferences.ts'
import { useTenseClassification } from '../app/composables/useTenseClassification.ts'
import { usePreferencePersistence } from '../app/composables/usePreferencePersistence.ts'

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

function preferenceHarness({ learner = null, stored = 'traditional', cookie, remember = true, read, write } = {}) {
  const state = new Map()
  const user = ref(learner)
  const cookieValue = ref(cookie)
  const cookieValues = new Map([
    ['tense_classification', cookieValue],
    ['tatitotu_remember_preferences', ref(remember ? undefined : 'disabled')],
  ])
  const app = {}
  const writes = []
  globalThis.useState = (key, init) => {
    if (!state.has(key)) state.set(key, ref(init()))
    return state.get(key)
  }
  globalThis.useLearnerAuth = () => ({ user })
  globalThis.useCookie = name => {
    if (!cookieValues.has(name)) cookieValues.set(name, ref(undefined))
    return cookieValues.get(name)
  }
  globalThis.watch = watch
  globalThis.useRequestFetch = () => read ?? (async () => ({ tenseClassification: stored }))
  globalThis.useNuxtApp = () => app
  globalThis.$fetch = async (_url, options) => { writes.push(options.body.tenseClassification); await write?.(options.body.tenseClassification) }
  return { ...useTenseClassification(), user, writes, cookie: cookieValue }
}

test('la classification traditionnelle est le défaut ; un visiteur anonyme ne déclenche aucune sauvegarde', async () => {
  const preference = preferenceHarness()
  assert.equal(preference.classification.value, 'traditional')
  await preference.setClassification('modern')
  assert.equal(preference.classification.value, 'modern')
  assert.equal(preference.cookie.value, 'modern')
  await preference.setClassification('traditional')
  assert.equal(preference.cookie.value, 'traditional')
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

test('le sélecteur de temps et les préférences du compte partagent le choix et sa sauvegarde', async () => {
  const picker = preferenceHarness({ learner: { id: 1 }, stored: 'modern' })
  await picker.restoreClassification()
  const accountPreferences = useTenseClassification()
  assert.equal(accountPreferences.classification.value, 'modern')
  await accountPreferences.setClassification('traditional')
  assert.equal(picker.classification.value, 'traditional')
  await picker.setClassification('modern')
  assert.equal(accountPreferences.classification.value, 'modern')
  assert.deepEqual(picker.writes, ['traditional', 'modern'])
})

test('restaure le choix anonyme à une nouvelle visite sans requête au serveur de préférences', async () => {
  const firstVisit = preferenceHarness()
  await firstVisit.setClassification('modern')
  const nextVisit = preferenceHarness({ cookie: firstVisit.cookie.value, read: () => { throw Error('Aucune lecture de compte attendue') } })
  await nextVisit.restoreClassification()
  assert.equal(nextVisit.classification.value, 'modern')
  assert.deepEqual(nextVisit.writes, [])
})

test('les préférences du compte priment sur le cookie ; la déconnexion restaure le choix anonyme', async () => {
  const preference = preferenceHarness({ learner: { id: 1 }, stored: 'traditional', cookie: 'modern' })
  await preference.restoreClassification()
  assert.equal(preference.classification.value, 'traditional')
  await preference.setClassification('traditional')
  assert.equal(preference.cookie.value, 'modern', 'le choix du compte ne remplace pas celui du navigateur anonyme')
  preference.user.value = null
  await preference.restoreClassification()
  assert.equal(preference.classification.value, 'modern')
})

test('un cookie absent ou invalide laisse la classification traditionnelle par défaut', async () => {
  for (const cookie of [undefined, null, '', 'inconnu', { classification: 'modern' }]) {
    assert.equal(preferenceHarness({ cookie }).classification.value, 'traditional')
  }
})

test('décocher la mémorisation efface la classification stockée et garde les choix en mémoire', async () => {
  const preference = preferenceHarness({ cookie: 'modern' })
  const persistence = usePreferencePersistence()
  assert.equal(persistence.rememberPreferences.value, true)
  persistence.setRememberPreferences(false)
  assert.equal(preference.cookie.value, null)
  assert.equal(preference.classification.value, 'modern', 'le choix reste actif pendant cette visite')
  await preference.setClassification('traditional')
  await preference.setClassification('modern')
  assert.equal(preference.cookie.value, null, 'les changements suivants ne recréent pas le cookie')
  persistence.setRememberPreferences(true)
  assert.equal(preference.cookie.value, 'modern', 'réactiver la mémorisation conserve le choix actuel')
})

test('un refus de mémorisation empêche la restauration d’un ancien cookie et les sauvegardes anonymes', async () => {
  const preference = preferenceHarness({ remember: false, cookie: 'modern' })
  assert.equal(preference.classification.value, 'traditional')
  assert.equal(preference.cookie.value, null)
  await preference.setClassification('modern')
  assert.equal(preference.classification.value, 'modern')
  assert.equal(preference.cookie.value, null)
  assert.deepEqual(preference.writes, [])
})

test('le refus de stockage dans le navigateur ne désactive pas les préférences du compte', async () => {
  const preference = preferenceHarness({ learner: { id: 1 }, stored: 'modern', remember: false })
  await preference.restoreClassification()
  assert.equal(preference.classification.value, 'modern')
  await preference.setClassification('traditional')
  assert.deepEqual(preference.writes, ['traditional'])
  assert.equal(preference.cookie.value, null)
})
