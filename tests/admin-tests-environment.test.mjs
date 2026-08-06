import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_TEST_EXECUTION_TIMEOUT_MS,
  adminTestEnvironment,
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

  it('garde le délai interne sous la limite HTTP habituelle du proxy', () => {
    assert.equal(ADMIN_TEST_EXECUTION_TIMEOUT_MS, 45_000)
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
})
