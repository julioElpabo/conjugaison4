import { loadNuxt, buildNuxt, writeTypes } from '@nuxt/kit'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Ne pas régénérer .nuxt pendant que Vite utilise son manifeste en mémoire.
const buildDir = resolve('.nuxt-typecheck')
const nuxt = await loadNuxt({
  cwd: process.cwd(),
  overrides: { _prepare: true, dev: false, buildDir },
})
try {
  await writeTypes(nuxt)
  await buildNuxt(nuxt)
} finally {
  await nuxt.close()
}
await mkdir(buildDir, { recursive: true })
await writeFile(resolve(buildDir, 'tsconfig.check.json'), JSON.stringify({
  files: [],
  references: ['app', 'server', 'shared', 'node'].map(name => ({ path: `./tsconfig.${name}.json` })),
}, null, 2))
const child = spawn(process.execPath, [
  resolve('node_modules/vue-tsc/bin/vue-tsc.js'),
  '-b', resolve(buildDir, 'tsconfig.check.json'), '--noEmit',
], { stdio: 'inherit' })
child.on('error', error => { console.error(error); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
