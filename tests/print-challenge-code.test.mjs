import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'

import { normalizeDefiCode } from '../server/services/defis.ts'
import { PublicInputError } from '../server/services/public-api-validation.ts'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('code des défis imprimés', () => {
  it('utilise le même format que les défis partagés', () => {
    assert.equal(normalizeDefiCode('AB-CD-EF-23'), 'AB-CD-EF-23')
    assert.throws(() => normalizeDefiCode('12345678'), PublicInputError)
    assert.throws(() => normalizeDefiCode('1234567'), PublicInputError)
  })

  it('enregistre en base une date d’expiration à six mois', async () => {
    const service = await read('../server/services/defis.ts')
    const migration = await read('../server/plugins/defis-expiration-migration.ts')
    const api = await read('../app/composables/useChallengeApi.ts')
    const savedChallenges = await read('../server/api/learner/saved-challenges.get.ts')

    assert.match(service, /expires_at/u)
    assert.match(service, /INTERVAL 6 MONTH/u)
    assert.match(service, /DELETE FROM defis/u)
    assert.match(migration, /ADD COLUMN expires_at DATETIME/u)
    assert.match(api, /savePrintedChallenge[\s\S]*'\/api\/defis'/u)
    assert.match(savedChallenges, /d\.expires_at > CURRENT_TIMESTAMP/u)
  })

  it('réutilise le code partagé et l’affiche en petit sous le titre', async () => {
    const preview = await read('../app/components/challenge/PrintPreview.vue')
    const workspace = await read('../app/components/challenge/ChallengeWorkspace.vue')

    assert.match(preview, /savePrintedChallenge/u)
    assert.match(preview, /existingChallengeCode/u)
    assert.match(preview, /challengeCodeCreated/u)
    assert.match(workspace, /:existing-challenge-code="shareCode"/u)
    assert.match(workspace, /@challenge-code-created="shareCode = \$event"/u)
    assert.match(preview, /Code du défi/u)
    assert.match(preview, /Le défi est enregistré pendant 6 mois/u)
    assert.doesNotMatch(preview, /sheetNumber|randomSheetNumber/u)
    assert.match(preview, /pdf\.text\(identifier, left, y - 5\)/u)
  })
})
