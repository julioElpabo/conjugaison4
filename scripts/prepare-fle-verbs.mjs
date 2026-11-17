import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { decodeHTML } from 'entities'
import { readMorphalouParadigms } from './validate-verb-candidates-morphalou.mjs'
import { FLE_VERB_BATCH_ID, requestedFleVerbs, fleVerbEditorialEntries, requestedFlePronominals } from '../shared/data/fle-verbs-2026-11-17.mjs'
import { isDirectScriptExecution } from './utils/direct-execution.mjs'

export const FLE_SIMPLE_TENSES = [
  [1, 'indicative', 'present'], [2, 'indicative', 'imperfect'],
  [3, 'indicative', 'future'], [4, 'indicative', 'simplePast'],
  [9, 'imperative', 'present'], [10, 'subjunctive', 'present'],
  [14, 'conditional', 'present'], [16, 'subjunctive', 'imperfect'],
]
const TENSE_IDS = {
  ind: { Présent: 1, Imparfait: 2, 'Futur simple': 3, 'Passé simple': 4, 'Passé composé': 5, 'Futur antérieur': 6, 'Plus-que-parfait': 7, 'Passé antérieur': 8 },
  imp: { Présent: 9, Passé: 18 }, sub: { Présent: 10, Passé: 11, Imparfait: 16, 'Plus-que-parfait': 17 },
  con: { Présent: 14, Passé: 15 },
}
const PREFERRED_AUXILIARY = new Map([['revenir', 'être'], ['retourner', 'être'], ['convenir', 'avoir']])
export const sha256 = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
const plain = value => decodeHTML(value.replace(/<[^>]*>/gu, ' ')).replace(/\s+/gu, ' ').trim().normalize('NFC')
const normalize = value => value.normalize('NFC').replace(/’/gu, "'").trim()

/** Lit uniquement les tableaux de la voix demandée, jamais les formes passives voisines. */
export function parseAcademyParadigms(html, voice = 'active') {
  const blocks = html.split(/<div id="((?:active|prono|passive)_(?:par|ind|con|sub|imp))" class="time">/u)
  const slots = new Map()
  const participles = {}
  for (let index = 1; index < blocks.length; index += 2) {
    const [blockVoice, mode] = blocks[index].split('_')
    if (blockVoice !== voice) continue
    for (const [, rawTitle, table] of blocks[index + 1].matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/gu)) {
      const title = plain(rawTitle)
      const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)]
      if (mode === 'par') {
        const first = rows[0]?.[1].match(/<td class="conj_verb">([\s\S]*?)<\/td>/u)?.[1]
        if (first && ['Présent', 'Passé'].includes(title)) {
          participles[title === 'Présent' ? 'present' : 'past'] = plain(first).split(',')[0].replace(/\s*\(invariable\)/u, '').trim()
        }
        continue
      }
      const tenseId = TENSE_IDS[mode]?.[title]
      if (!tenseId) continue
      if (rows.length !== (mode === 'imp' ? 3 : 6)) throw new Error(`Tableau ${voice}/${mode}/${title} incomplet : ${rows.length} lignes`)
      rows.forEach((row, personIndex) => {
        const cell = name => plain(row[1].match(new RegExp(`<td class="${name}">([\\s\\S]*?)<\\/td>`, 'u'))?.[1] || '')
        const personId = mode === 'imp' ? [5, 7, 8][personIndex] : personIndex + 4
        const prefix = cell('conj_refl-pron')
        const auxiliary = cell('conj_auxil')
        const verb = cell('conj_verb').split(',')[0].replace(/\s*\(invariable\)/u, '').trim()
        const variants = verb.split(/\s+ou\s+/u).map(form => normalize(
          `${prefix}${prefix && !/[’']$/u.test(prefix) ? ' ' : ''}${auxiliary}${auxiliary ? ' ' : ''}${form}`,
        )).filter(Boolean)
        const key = `${tenseId}:${personId}`
        slots.set(key, [...new Set([...(slots.get(key) || []), ...variants])])
      })
    }
  }
  // Le conditionnel passé 2e forme est identique au subjonctif plus-que-parfait sans « que ».
  for (let person = 4; person <= 9; person++) if (slots.has(`17:${person}`)) slots.set(`19:${person}`, [...slots.get(`17:${person}`)])
  return { slots, participles }
}

function morphalouKey(mode, tense, personId) {
  const number = personId < 7 ? 'singular' : 'plural'
  return `${mode}|${tense}|${number}|${['firstPerson', 'secondPerson', 'thirdPerson'][(personId - 4) % 3]}|-`
}

export async function prepareFleVerbBatch({ sourcesDirectory, morphalouPath, outputPath, auditPath }) {
  const metadata = JSON.parse(await readFile(resolve(sourcesDirectory, 'academy.json'), 'utf8'))
  const paradigms = await readMorphalouParadigms(morphalouPath, fleVerbEditorialEntries.map(entry => entry.infinitive))
  const errors = []
  const officialOnlyVariants = []
  let comparedSlots = 0
  let pronominalSlots = 0
  const entries = []
  for (const editorial of fleVerbEditorialEntries) {
    const lemma = editorial.infinitive
    const info = metadata.find(item => item.lemma === lemma)
    if (!info || info.error) throw new Error(`Source Académie manquante : ${lemma}`)
    const html = await readFile(resolve(sourcesDirectory, 'academie', `${lemma}-conjugation.html`), 'utf8')
    const articleHtml = await readFile(resolve(sourcesDirectory, 'academie', `${lemma}-article.html`), 'utf8')
    const academy = parseAcademyParadigms(html)
    const morphalou = paradigms.get(lemma)
    for (const [id, mode, tense] of FLE_SIMPLE_TENSES) {
      for (let personId = 4; personId <= 9; personId++) {
        if (mode === 'imperative' && ![5, 7, 8].includes(personId)) continue
        const forms = academy.slots.get(`${id}:${personId}`) || []
        const reference = [...(morphalou?.get(morphalouKey(mode, tense, personId)) || [])].map(normalize)
        comparedSlots++
        if (!forms.length || !reference.some(form => forms.includes(form))) errors.push(`${lemma} ${id}:${personId} : aucune forme commune Académie/Morphalou`)
        for (const form of forms) if (!reference.includes(form)) officialOnlyVariants.push({ infinitive: lemma, tenseId: id, personId, form, evidence: info.conjugationUrl })
      }
    }
    for (const [participle, key] of [['present', 'participle|present|-|-|-'], ['past', 'participle|past|singular|-|masculine']]) {
      const forms = [...(morphalou?.get(key) || [])].map(normalize)
      comparedSlots++
      if (!forms.includes(normalize(academy.participles[participle] || ''))) errors.push(`${lemma} : participe ${participle} divergent`)
    }
    const auxiliary = PREFERRED_AUXILIARY.get(lemma) || info.auxiliary
    if (!['avoir', 'être'].includes(auxiliary)) errors.push(`${lemma} : auxiliaire non résolu`)
    const rows = [...academy.slots].map(([key, forms]) => {
      const [tenseId, personId] = key.split(':').map(Number)
      // Le modèle de déplacement de retourner est affiché avec être.
      if (lemma === 'retourner' && !FLE_SIMPLE_TENSES.some(([id]) => id === tenseId)) forms = [...forms].reverse()
      return { tenseId, personId, forms }
    }).sort((a, b) => a.tenseId - b.tenseId || a.personId - b.personId)
    if (rows.length !== 96) errors.push(`${lemma} : ${rows.length}/96 coordonnées finies`)
    const requestedUse = requestedFlePronominals.find(use => use.baseInfinitive === lemma)
    let pronominal
    if (requestedUse) {
      const source = parseAcademyParadigms(html, 'prono')
      // L’Académie ne fournit pas le tableau pronominal de connecter ; attestation OQLF et Larousse.
      if (lemma !== 'connecter' && source.slots.size !== 96) errors.push(`${lemma} : tableau pronominal incomplet`)
      pronominalSlots += source.slots.size
      pronominal = {
        ...requestedUse,
        sourceUrl: lemma === 'connecter' ? 'https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/506934/ouvrir-une-session' : info.url,
        conjugationUrl: lemma === 'connecter' ? 'https://www.larousse.fr/conjugaison/francais/se%20connecter/9506' : info.conjugationUrl,
        referenceRows: [...source.slots].map(([key, forms]) => { const [tenseId, personId] = key.split(':').map(Number); return { tenseId, personId, forms } }),
      }
    }
    entries.push({
      ...editorial, auxiliary, group: ['décrire', 'revenir', 'convenir', 'entendre'].includes(lemma) ? 3 : 1,
      model: info.model.toLocaleLowerCase('fr'), sourceUrl: info.url, conjugationUrl: info.conjugationUrl,
      sourceHashes: { article: sha256(articleHtml), conjugation: sha256(html) },
      presentParticiple: academy.participles.present, pastParticiple: academy.participles.past,
      rows, ...(pronominal ? { pronominal } : {}),
    })
  }
  const payload = { batchId: FLE_VERB_BATCH_ID, date: '2026-11-17', requested: requestedFleVerbs, entries }
  const audit = {
    batchId: FLE_VERB_BATCH_ID, date: '2026-11-17', payloadSha256: sha256(payload),
    requestedLines: requestedFleVerbs.length, uniqueSelections: new Set(requestedFleVerbs).size,
    baseVerbs: entries.length, finiteSlots: entries.reduce((sum, entry) => sum + entry.rows.length, 0),
    morphalouComparedSlots: comparedSlots, pronominalReferenceSlots: pronominalSlots,
    morphalouSource: 'https://repository.ortolang.fr/api/content/morphalou/4/Morphalou3.1_formatCSV_toutEnUn.zip',
    morphalouLicense: 'LGPL-LR', officialOnlyVariants, errors,
    notes: ['Définitions originales du site ; CECRL estimatifs.', 'Les variantes officielles absentes de Morphalou restent acceptées avec leur référence Académie.', 'Les 9 emplois pronominaux seront aussi contrôlés par le moteur réel avant insertion.'],
  }
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
  await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`)
  if (errors.length) throw new Error(`Audit bloquant : ${errors.join('; ')}`)
  return audit
}

if (isDirectScriptExecution(import.meta.url, 'prepare-fle-verbs.mjs')) {
  const option = name => process.argv.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
  const report = await prepareFleVerbBatch({
    sourcesDirectory: option('sources'), morphalouPath: option('morphalou'),
    outputPath: option('output') || 'shared/data/fle-verbs-2026-11-17.json',
    auditPath: option('audit') || 'shared/data/fle-verbs-2026-11-17-audit.json',
  })
  console.log(JSON.stringify({ baseVerbs: report.baseVerbs, finiteSlots: report.finiteSlots, comparedSlots: report.morphalouComparedSlots, officialOnlyVariants: report.officialOnlyVariants.length, errors: report.errors }, null, 2))
}
