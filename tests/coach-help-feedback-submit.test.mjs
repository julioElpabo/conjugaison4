import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const endpointPath = new URL('../server/api/coach-help-feedback.post.ts', import.meta.url)
const endpoint = readFileSync(endpointPath, 'utf8')

describe('enregistrement des avis sur l’aide', () => {
  it('remplace le précédent avis de la même question au lieu de créer des doublons contradictoires', () => {
    assert.match(endpoint, /createHash\('sha256'\)/u)
    assert.match(endpoint, /\['user', sessionId, exerciseRunId, questionNumber, helpId \|\| 'automatic'\]/u)
    assert.match(endpoint, /ON DUPLICATE KEY UPDATE/u)
    assert.match(endpoint, /feedback_type=VALUES\(feedback_type\)/u)
  })
})
