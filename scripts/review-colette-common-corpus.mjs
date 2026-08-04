import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { literaryCommonLanguage } from './literary-common-language.mjs'
import { literaryYouthSafety } from './literary-youth-safety.mjs'

const path = process.argv[2] || 'shared/data/literary-corpus-colette.json'

// Seconde passe éditoriale : phrases trop imagées, vieillies, fragmentaires,
// dépendantes du contexte ou sensibles malgré les filtres lexicaux généraux.
// Les numéros sont les locators stables du texte Project Gutenberg.
const rejectedLocators = new Set([
  3, 19, 43, 45, 48, 77, 80, 90, 116, 123, 144, 145, 156, 170, 174, 179,
  181, 206, 210, 211, 221, 236, 246, 247, 294, 296, 306, 333, 337, 345, 351,
  353, 360, 376, 377, 393, 405, 429, 438, 454, 455, 467, 473, 480, 484, 492,
  494, 496, 529, 545, 546, 547, 570, 583, 591, 595, 624, 625, 631, 647, 649,
  668, 682, 688, 700, 714, 718, 721, 741, 742, 750, 752, 753, 756, 766, 796,
  798, 809, 818, 820, 821, 828, 830, 840, 852, 857, 859, 867, 877, 879, 899,
  913, 916, 928, 937, 948, 950, 953, 955, 960, 989, 990, 1003, 1011, 1014,
  1070, 1073, 1076, 1095, 1096, 1099, 1101, 1102,
])

// Seconde décision éditoriale prise dans l’administration après l’import.
// Ces locators doivent rester exclus lors de toute régénération du JSON.
for (const locator of [
  32, 219, 227, 243, 244, 276, 297, 322, 352, 397, 423, 469, 470, 506, 522,
  565, 579, 582, 586, 588, 606, 621, 626, 703, 770, 807, 808, 824, 832, 854,
  892, 1057,
]) rejectedLocators.add(locator)

const corpus = JSON.parse(await readFile(path, 'utf8'))
const retained = []
for (const sentence of corpus.sentences) {
  const locator = Number(sentence.locator.match(/\d+/u)?.[0] || 0)
  if (rejectedLocators.has(locator)) continue
  if (!literaryYouthSafety(sentence.text).suitable) throw new Error(`Phrase jeunesse invalide : ${sentence.locator}`)
  if (!literaryCommonLanguage(sentence.text).suitable) throw new Error(`Registre non courant : ${sentence.locator}`)

  const coordinates = new Set()
  const targets = sentence.targets.filter((target) => {
    if (sentence.text.slice(target.start, target.end) !== target.form) {
      throw new Error(`Cible décalée : ${sentence.locator} (${target.form})`)
    }
    const key = `${target.verbId}:${target.tenseId}:${target.personId}`
    if (coordinates.has(key)) return false
    coordinates.add(key)
    return true
  })
  if (targets.length) retained.push({ ...sentence, targets })
}

corpus.sentences = retained
corpus.source.checksum = createHash('sha256').update(JSON.stringify({
  source: { ...corpus.source, checksum: undefined },
  sentences: retained,
  editorialReview: 'colette-common-youth-v2',
})).digest('hex')
await writeFile(path, `${JSON.stringify(corpus, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({
  retainedSentences: retained.length,
  retainedTargets: retained.reduce((total, sentence) => total + sentence.targets.length, 0),
  editorialExclusions: rejectedLocators.size,
}, null, 2))
