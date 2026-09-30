import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  restorePreviousNuxtAssets,
  snapshotCurrentNuxtAssets,
} from '../scripts/retain-previous-nuxt-assets.mjs'

test('le paquet Plesk conserve uniquement les assets du build précédent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nuxt-assets-retention-'))
  const output = join(root, '.output')
  const assets = join(output, 'public', '_nuxt')
  const snapshot = join(root, 'snapshot')

  try {
    await mkdir(assets, { recursive: true })
    await writeFile(join(assets, 'previous.js'), 'previous')
    await writeFile(join(assets, 'older.js'), 'older')
    await writeFile(join(assets, 'shared.css'), 'previous-shared')
    await writeFile(join(output, 'plesk-current-nuxt-assets.json'), JSON.stringify({
      version: 1,
      assets: ['previous.js', 'shared.css'],
    }))

    assert.deepEqual(
      await snapshotCurrentNuxtAssets(output, snapshot),
      ['previous.js', 'shared.css'],
    )

    await rm(output, { recursive: true })
    await mkdir(assets, { recursive: true })
    await writeFile(join(assets, 'current.js'), 'current')
    await writeFile(join(assets, 'shared.css'), 'current-shared')

    assert.deepEqual(await restorePreviousNuxtAssets(output, snapshot), {
      current: 2,
      restored: 1,
    })
    assert.equal(await readFile(join(assets, 'current.js'), 'utf8'), 'current')
    assert.equal(await readFile(join(assets, 'previous.js'), 'utf8'), 'previous')
    assert.equal(await readFile(join(assets, 'shared.css'), 'utf8'), 'current-shared')
    await assert.rejects(readFile(join(assets, 'older.js'), 'utf8'))

    const metadata = JSON.parse(await readFile(join(output, 'plesk-current-nuxt-assets.json'), 'utf8'))
    assert.deepEqual(metadata, { version: 1, assets: ['current.js', 'shared.css'] })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
