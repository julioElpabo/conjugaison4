import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = path.resolve(process.cwd(), '.output')
const secrets = [
  process.env.AZURE_SPEECH_KEY,
  process.env.AZURE_SPEECH_KEY1,
  process.env.AZURE_SPEECH_KEY_SECONDARY,
  process.env.AZURE_SPEECH_KEY2,
].map(value => value?.trim()).filter(value => value && value.length >= 16)

if (!secrets.length) process.exit(0)

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return filesIn(entryPath)
    return entry.isFile() ? [entryPath] : []
  }))
  return files.flat()
}

for (const filePath of await filesIn(outputDirectory)) {
  const content = await readFile(filePath)
  if (secrets.some(secret => content.includes(Buffer.from(secret)))) {
    console.error(`Secret Azure détecté dans le paquet de production : ${path.relative(process.cwd(), filePath)}`)
    process.exit(1)
  }
}
