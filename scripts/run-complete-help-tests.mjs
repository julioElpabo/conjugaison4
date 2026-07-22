import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const reportPath = resolve(root, 'reports', 'coach-complete-help-tests.txt')
const args = [
  '--env-file-if-exists=.env', '--import', 'tsx', '--test', '--test-concurrency=1', '--test-reporter=spec',
  'tests/coach-help.test.mjs', 'tests/coach-complete-help-audit.mjs',
]

const child = spawn(process.execPath, args, {
  cwd: root,
  env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let output = ''
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    output += chunk
    process.stdout.write(chunk)
  })
}

const exitCode = await new Promise((resolveExit, reject) => {
  child.once('error', reject)
  child.once('close', code => resolveExit(code ?? 1))
})

await mkdir(resolve(root, 'reports'), { recursive: true })
await writeFile(reportPath, [
  'Audit de l’aide complète sans réponses',
  `Date : ${new Date().toISOString()}`,
  `Commande : ${process.execPath} ${args.join(' ')}`,
  `Code de sortie : ${exitCode}`,
  '', output,
].join('\n'), 'utf8')

console.log(`\nRapport enregistré dans ${reportPath}`)
process.exitCode = exitCode
