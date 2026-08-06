import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'

import { getAdminTestJob, startAdminTestJob } from '../server/services/admin-test-jobs.ts'

let directory

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'conjugaison4-admin-test-jobs-'))
})

after(async () => {
  await rm(directory, { recursive: true, force: true })
})

async function waitForStatus(id, status) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const job = await getAdminTestJob(id, directory)
    if (job?.status === status) return job
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  assert.fail(`Le travail ${id} n’a pas atteint l’état ${status}`)
}

describe('exécution asynchrone des tests administrateur', () => {
  it('rend immédiatement un identifiant puis conserve le résultat terminé', async () => {
    let release
    const expected = { success: true, summary: { tests: 12, passed: 12 } }
    const started = await startAdminTestJob(['answer.test.mjs'], {
      directory,
      run: () => new Promise((resolve) => { release = () => resolve(expected) }),
    })

    assert.equal(started.status, 'running')
    assert.equal((await getAdminTestJob(started.id, directory))?.status, 'running')
    release()
    const completed = await waitForStatus(started.id, 'completed')
    assert.deepEqual(completed.result, expected)
  })

  it('rend aussi une erreur en différé sans abandonner le travail', async () => {
    const started = await startAdminTestJob(['broken.test.mjs'], {
      directory,
      run: async () => { throw new Error('échec contrôlé') },
    })

    const failed = await waitForStatus(started.id, 'failed')
    assert.equal(failed.error, 'échec contrôlé')
  })

  it('refuse les identifiants susceptibles de sortir du dossier des travaux', async () => {
    assert.equal(await getAdminTestJob('../../etc/passwd', directory), null)
  })
})
