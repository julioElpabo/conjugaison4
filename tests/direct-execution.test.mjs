import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

import { isDirectScriptExecution } from '../scripts/utils/direct-execution.mjs'

test('reconnaît un script réellement lancé depuis la ligne de commande', () => {
  const entry = resolve('scripts/example.mjs')
  assert.equal(
    isDirectScriptExecution(pathToFileURL(entry).href, 'example.mjs', entry),
    true,
  )
})

test('ne confond pas un script importé avec le bundle Nitro', () => {
  const bundle = resolve('.nuxt/dev/index.mjs')
  assert.equal(
    isDirectScriptExecution(pathToFileURL(bundle).href, 'example.mjs', bundle),
    false,
  )
})
