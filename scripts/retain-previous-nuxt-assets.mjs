import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const METADATA_FILE = 'plesk-current-nuxt-assets.json'

async function filesBelow(directory) {
  const files = []
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true }).catch(() => [])) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile()) files.push(relative(directory, path).split(sep).join('/'))
    }
  }
  await visit(directory)
  return files.sort()
}

function safeAssetPath(value) {
  return typeof value === 'string'
    && value.length > 0
    && !value.startsWith('/')
    && !value.split('/').includes('..')
}

async function currentAssetList(outputDirectory) {
  const metadataPath = join(outputDirectory, METADATA_FILE)
  try {
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'))
    if (metadata?.version === 1 && Array.isArray(metadata.assets)
      && metadata.assets.every(safeAssetPath)) return metadata.assets
  } catch {
    // Premier déploiement avec cette protection : le paquet présent est le précédent.
  }
  return filesBelow(join(outputDirectory, 'public', '_nuxt'))
}

export async function snapshotCurrentNuxtAssets(outputDirectory, snapshotDirectory) {
  const output = resolve(outputDirectory)
  const snapshot = resolve(snapshotDirectory)
  const assets = await currentAssetList(output)
  const sourceRoot = join(output, 'public', '_nuxt')
  const retained = []

  for (const asset of assets) {
    const source = join(sourceRoot, asset)
    if (!(await stat(source).catch(() => null))?.isFile()) continue
    const destination = join(snapshot, asset)
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination)
    retained.push(asset)
  }
  await mkdir(snapshot, { recursive: true })
  await writeFile(join(snapshot, 'assets.json'), JSON.stringify(retained), 'utf8')
  return retained
}

export async function restorePreviousNuxtAssets(outputDirectory, snapshotDirectory) {
  const output = resolve(outputDirectory)
  const snapshot = resolve(snapshotDirectory)
  const assetRoot = join(output, 'public', '_nuxt')
  const currentAssets = await filesBelow(assetRoot)
  const currentSet = new Set(currentAssets)
  const previousAssets = JSON.parse(await readFile(join(snapshot, 'assets.json'), 'utf8'))
  if (!Array.isArray(previousAssets) || !previousAssets.every(safeAssetPath)) {
    throw new Error('La liste des assets Nuxt précédents est invalide.')
  }

  let restored = 0
  for (const asset of previousAssets) {
    if (currentSet.has(asset)) continue
    const source = join(snapshot, asset)
    if (!(await stat(source).catch(() => null))?.isFile()) continue
    const destination = join(assetRoot, asset)
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination)
    restored += 1
  }
  await writeFile(join(output, METADATA_FILE), JSON.stringify({
    version: 1,
    assets: currentAssets,
  }, null, 2) + '\n', 'utf8')
  return { current: currentAssets.length, restored }
}

async function main() {
  const [command, outputDirectory, snapshotDirectory] = process.argv.slice(2)
  if (!['snapshot', 'restore'].includes(command) || !outputDirectory || !snapshotDirectory) {
    throw new Error('Usage : node scripts/retain-previous-nuxt-assets.mjs <snapshot|restore> <.output> <dossier-temporaire>')
  }
  const result = command === 'snapshot'
    ? { retained: (await snapshotCurrentNuxtAssets(outputDirectory, snapshotDirectory)).length }
    : await restorePreviousNuxtAssets(outputDirectory, snapshotDirectory)
  console.info(`[deploy] Assets Nuxt : ${JSON.stringify(result)}`)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main()
}
