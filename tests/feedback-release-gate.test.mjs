import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, chmod, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, delimiter } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { assertCompleteTapRun } from '../scripts/lib/feedback-test-gate.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const summary = (overrides = {}) => Object.entries({ tests: 4, pass: 4, fail: 0, cancelled: 0, skipped: 0, todo: 0, ...overrides })
  .map(([key, count]) => `# ${key} ${count}`).join('\n')

test('le contrôle exige un bilan complet, réussi et sans test ignoré', () => {
  assert.equal(assertCompleteTapRun(summary(), 'test').pass, 4)
  for (const result of [summary({ pass: 3, skipped: 1 }), summary({ pass: 3, fail: 1 }), summary({ pass: 3, cancelled: 1 }), summary({ pass: 3, todo: 1 }), summary({ tests: 0, pass: 0 }), '']) {
    assert.throws(() => assertCompleteTapRun(result, 'test'))
  }
})

test('la commande dédiée refuse les options de contournement', () => {
  const result = spawnSync(process.execPath, [join(root, 'scripts/check-feedbacks.mjs'), '--skip-browser'], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /sans option de contournement/u)
})

test('un échec des feedbacks arrête le vrai script de publication avant tout commit ou push', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tatitotu-release-gate-'))
  try {
    const bin = join(directory, 'bin')
    const scripts = join(directory, 'scripts')
    await mkdir(bin)
    await mkdir(scripts)
    const release = join(scripts, 'release-plesk.sh')
    await writeFile(release, await readFile(join(root, 'scripts/release-plesk.sh')))
    const common = `#!/usr/bin/env node
      const fs=require('node:fs');const args=process.argv.slice(2);
      fs.appendFileSync(process.env.FEEDBACK_GATE_TEST_LOG,JSON.stringify({tool:TOOL,args})+'\\n');
    `
    await writeFile(join(bin, 'git'), common.replace('TOOL', "'git'") + `
      const command=args[0]==='-C'?args.slice(2):args;
      if(command[0]==='rev-parse')console.log(command.includes('--git-dir')?'.git':'true');
      if(command[0]==='remote')console.log('local-fixture');
    `)
    await writeFile(join(bin, 'npm'), common.replace('TOOL', "'npm'") + `
      if(args.includes('test:feedback'))process.exit(27);
    `)
    await chmod(join(bin, 'git'), 0o755)
    await chmod(join(bin, 'npm'), 0o755)
    const log = join(directory, 'commands.jsonl')
    const result = spawnSync('bash', [release], {
      cwd: directory, encoding: 'utf8', input: 'Test de non-régression\n',
      env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}`, FEEDBACK_GATE_TEST_LOG: log },
    })
    assert.equal(result.status, 27, result.stderr)
    const commands = (await readFile(log, 'utf8')).trim().split('\n').map(line => JSON.parse(line))
    assert.ok(commands.some(c => c.tool === 'npm' && c.args.includes('ci')))
    assert.ok(commands.some(c => c.tool === 'npm' && c.args.includes('test:feedback')))
    assert.ok(!commands.some(c => c.tool === 'git' && c.args.some(arg => ['add', 'commit', 'push', 'merge'].includes(arg))))
    assert.ok(!commands.some(c => c.tool === 'npm' && c.args.includes('build')))
  }
  finally {
    await rm(directory, { recursive: true, force: true })
  }
})
