import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { adminTestEnvironment } from '../server/services/admin-tests.ts'

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
})
