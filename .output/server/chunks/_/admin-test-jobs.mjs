import { randomUUID, createHash } from 'node:crypto';
import { readFile, readdir, stat, unlink, mkdir, writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { r as runAdminTests } from './admin-tests.mjs';

const JOB_RETENTION_MS = 24 * 60 * 60 * 1e3;
const JOB_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const applicationKey = createHash("sha256").update(process.cwd()).digest("hex").slice(0, 12);
const DEFAULT_JOB_DIRECTORY = join(tmpdir(), `conjugaison4-admin-tests-${applicationKey}`);
function jobPath(directory, id) {
  return join(directory, `${id}.json`);
}
async function saveJob(directory, job) {
  await mkdir(directory, { recursive: true });
  const destination = jobPath(directory, job.id);
  const temporary = `${destination}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(job), "utf8");
  await rename(temporary, destination);
}
async function cleanupExpiredJobs(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  await Promise.all(entries.filter((entry) => entry.isFile() && JOB_ID_PATTERN.test(entry.name.replace(/\.json$/u, ""))).map(async (entry) => {
    const path = join(directory, entry.name);
    const metadata = await stat(path);
    if (Date.now() - metadata.mtimeMs > JOB_RETENTION_MS) await unlink(path);
  }));
}
async function startAdminTestJob(files, options = {}) {
  const directory = options.directory || DEFAULT_JOB_DIRECTORY;
  const run = options.run || runAdminTests;
  await cleanupExpiredJobs(directory);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const job = {
    id: randomUUID(),
    status: "running",
    createdAt: now,
    updatedAt: now
  };
  await saveJob(directory, job);
  void Promise.resolve().then(() => run(files)).then(async (result) => {
    await saveJob(directory, {
      ...job,
      status: "completed",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      result
    });
  }).catch(async (error) => {
    try {
      await saveJob(directory, {
        ...job,
        status: "failed",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: error instanceof Error ? error.message : "\xC9chec inattendu du lanceur de tests."
      });
    } catch {
    }
  });
  return job;
}
async function getAdminTestJob(id, directory = DEFAULT_JOB_DIRECTORY) {
  if (!JOB_ID_PATTERN.test(id)) return null;
  try {
    return JSON.parse(await readFile(jobPath(directory, id), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export { getAdminTestJob as g, startAdminTestJob as s };
//# sourceMappingURL=admin-test-jobs.mjs.map
