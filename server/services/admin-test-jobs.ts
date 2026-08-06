import { randomUUID, createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runAdminTests } from './admin-tests'

const JOB_RETENTION_MS = 24 * 60 * 60 * 1000
const JOB_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
const applicationKey = createHash('sha256').update(process.cwd()).digest('hex').slice(0, 12)
const DEFAULT_JOB_DIRECTORY = join(tmpdir(), `conjugaison4-admin-tests-${applicationKey}`)

type AdminTestResult = Awaited<ReturnType<typeof runAdminTests>>
type AdminTestRunner = (files: string[]) => Promise<AdminTestResult>

export interface AdminTestJob {
  id: string
  status: 'running' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  result?: AdminTestResult
  error?: string
}

interface JobOptions {
  directory?: string
  run?: AdminTestRunner
}

function jobPath(directory: string, id: string) {
  return join(directory, `${id}.json`)
}

async function saveJob(directory: string, job: AdminTestJob) {
  await mkdir(directory, { recursive: true })
  const destination = jobPath(directory, job.id)
  const temporary = `${destination}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temporary, JSON.stringify(job), 'utf8')
  await rename(temporary, destination)
}

async function cleanupExpiredJobs(directory: string) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  await Promise.all(entries
    .filter(entry => entry.isFile() && JOB_ID_PATTERN.test(entry.name.replace(/\.json$/u, '')))
    .map(async (entry) => {
      const path = join(directory, entry.name)
      const metadata = await stat(path)
      if (Date.now() - metadata.mtimeMs > JOB_RETENTION_MS) await unlink(path)
    }))
}

export async function startAdminTestJob(files: string[], options: JobOptions = {}) {
  const directory = options.directory || DEFAULT_JOB_DIRECTORY
  const run = options.run || runAdminTests
  await cleanupExpiredJobs(directory)

  const now = new Date().toISOString()
  const job: AdminTestJob = {
    id: randomUUID(),
    status: 'running',
    createdAt: now,
    updatedAt: now,
  }
  await saveJob(directory, job)

  void Promise.resolve()
    .then(() => run(files))
    .then(async (result) => {
      await saveJob(directory, {
        ...job,
        status: 'completed',
        updatedAt: new Date().toISOString(),
        result,
      })
    })
    .catch(async (error) => {
      try {
        await saveJob(directory, {
          ...job,
          status: 'failed',
          updatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Échec inattendu du lanceur de tests.',
        })
      } catch {
        // Le POST a déjà rendu la main : une erreur d’écriture ne doit pas devenir un rejet non géré.
      }
    })

  return job
}

export async function getAdminTestJob(id: string, directory = DEFAULT_JOB_DIRECTORY): Promise<AdminTestJob | null> {
  if (!JOB_ID_PATTERN.test(id)) return null
  try {
    return JSON.parse(await readFile(jobPath(directory, id), 'utf8')) as AdminTestJob
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
