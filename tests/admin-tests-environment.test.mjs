import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_TEST_EXECUTION_TIMEOUT_MS,
  adminTestArguments,
  adminTestEnvironment,
  availableAdminTests,
  executeAdminTestGroups,
} from '../server/services/admin-tests.ts'

describe('environnement des tests administrateur', () => {
  it('transmet la configuration MySQL Nuxt aux tests Node lancés en production', () => {
    const environment = adminTestEnvironment({
      dbHost: 'database.internal',
      dbPort: 3307,
      dbName: 'conjugaison',
      dbUser: 'test-user',
      dbPassword: 'test-password',
    }, {
      NODE_ENV: 'production',
      PATH: '/usr/bin',
    })

    assert.deepEqual({
      DB_HOST: environment.DB_HOST,
      DB_PORT: environment.DB_PORT,
      DB_NAME: environment.DB_NAME,
      DB_USER: environment.DB_USER,
      DB_PASSWORD: environment.DB_PASSWORD,
    }, {
      DB_HOST: 'database.internal',
      DB_PORT: '3307',
      DB_NAME: 'conjugaison',
      DB_USER: 'test-user',
      DB_PASSWORD: 'test-password',
    })
    assert.equal(environment.NODE_ENV, 'production')
    assert.equal(environment.PATH, '/usr/bin')
  })

  it('laisse aux suites distantes lentes le temps de terminer en arrière-plan', () => {
    assert.equal(ADMIN_TEST_EXECUTION_TIMEOUT_MS, 150_000)
  })

  it('utilise l’environnement transmis sans rechercher un fichier .env en production', () => {
    const argumentsList = adminTestArguments(['answer.test.mjs'])
    assert.equal(argumentsList.includes('--env-file-if-exists=.env'), false)
    assert.deepEqual(argumentsList.slice(0, 5), [
      '--import',
      'tsx',
      '--test',
      '--test-concurrency=1',
      '--test-reporter=tap',
    ])
    assert.match(argumentsList[5], /tests\/answer\.test\.mjs$/u)
  })

  it('lance les catégories en parallèle pour ne pas cumuler leurs durées', async () => {
    const started = []
    const releases = []
    const execution = executeAdminTestGroups([
      ['Conjugaison française', ['answer.test.mjs']],
      ['Administration', ['admin-users.test.mjs']],
      ['Technique', ['app.test.mjs']],
    ], (category) => new Promise((resolve) => {
      started.push(category)
      releases.push(() => resolve(category))
    }))

    await Promise.resolve()
    assert.deepEqual(started, ['Conjugaison française', 'Administration', 'Technique'])
    releases.forEach(release => release())
    assert.deepEqual(await execution, started)
  })

  it('rend les parcours navigateur visibles dans le catalogue administrateur', async () => {
    const tests = await availableAdminTests()
    const browserScenarios = tests.find(item => item.id === 'browser-user-scenarios.test.mjs')

    assert.equal(browserScenarios?.title, 'Parcours réels dans le navigateur')
    assert.equal(browserScenarios?.category, 'Scénarios utilisateur')
  })
})
