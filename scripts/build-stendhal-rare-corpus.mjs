import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'
import { decode } from 'entities'
import { literaryYouthSafety } from './literary-youth-safety.mjs'

const args = new Map(process.argv.slice(2).map((argument) => {
  const [key, ...value] = argument.replace(/^--/u, '').split('=')
  return [key, value.join('=')]
}))
const inventoryPath = args.get('inventory') || '/private/tmp/literary-corpus-stendhal-all.json'
const rawPath = args.get('raw') || '/private/tmp/stendhal-wikisource.json'
const outputPath = args.get('output') || 'shared/data/literary-corpus-stendhal.json'
const auditNonFinite = args.has('audit-non-finite')
const apply = args.has('apply')

const RARE_TENSE_IDS = new Set([6, 8, 10, 11, 15, 16, 17, 18, 19])

// Numéros de la revue humaine produite par l'inventaire exhaustif. Une entrée
// sans liste conserve toutes les cibles rares de la phrase ; une liste limite
// la validation aux graphies indiquées.
const REVIEWED_FINITE = new Map([
  [2], [3], [5], [7], [11], [12], [16], [18], [19], [21], [23], [24], [25], [26],
  [30], [31], [33], [35], [36], [37], [39], [40], [41], [42], [43], [44, ['fasse']], [47],
  [50], [51], [55], [56], [57], [59], [60], [61], [64], [65], [66], [68], [70], [75],
  [77], [80], [81], [82], [84], [86], [91], [93], [94], [95], [96], [99], [100], [101],
  [105], [106], [109], [112], [113], [114], [116], [119], [121], [123], [124],
])

const REVIEWED_NON_FINITE = new Set([
  // Infinitifs passés.
  '51495c39807384f68a3cc640adde4f81da7a34ffe09cc721ef9eb8d3a64daf34',
  '3728fa559dfabea14ad6a7797c14cc40f14110824f493ea7685e9a41d46a1143',
  '23015442504b29cd2357b202b3b252d01f7e0c19c8576856c817714b5a6d1042',
  '58324916e4779d6908b956861992eb34f92d801840149de1f66f66557665c54c',
  '648246f3b8e7a37541e0906c37166790d46f8a0a45fd1a40d18c80a2acface62',
  'fb664af9dff4b53abf313d2773ef09c2dbbc4b1e26dd449e21610abcc3e5d3b6',
  'bc09222393715bb71f72e9579c82239401a91b89484596acbf02e97523d91b25',
  '042710975fb2f3d4ba83f7b4b2d97783d89a50e23e6e03f3a24173966625a89d',
  // Gérondifs présents, volontairement diversifiés.
  '60ed18e241ab6c2179f56d451912b6d7c12378f17a15647dc54182a7cfea52f9',
  '3fce32235168ced7abf306fb9381fdcb72c9b693888e3b4dd45a686bdbc4c6ec',
  'e6160994d29da0423b569273c48fc6e8ed63924d8d6422bce084cdeb4733c51c',
  '9f7c0f52b9f25e721cf3e3d1a015965bffa4ede28912567e92ebf418f1b82c26',
  'fce2347dc42ffcef97aea6b71ac8bea07707f7e843b6d661c10f2b47a1ddb175',
  'e42b3bab1ee6f37f36e89eada4c917749289dddf1daf52d1073fd054d99cac94',
  '52d75836503ca5c8214949178dd613baee63ad9849b992a6c91c679bceb568e4',
  '49603067b8e18a2cf1bb6d5c2b07b8426be12930a5a2db0558fd7254a4d41c18',
  'a2b093913b7425f93891ee9260aaba5cc265fb57a6d74cc9a0b98b0671a0f4d3',
  '60f7415da4b715791268c38088929271752cadcd163841c5d8a9b067dd0b04c8',
  '6540efe8dd65a791301b2e8dd821bc7615b96f9572c8ef2529ac3b33c5e957f2',
  '235393e48860198d7b9b9bb4e163f73006f5eee94a8fcf931d11d2bb9e2a07c3',
  'f4edbccd44a0d5786459e70fd51d30ba10638504b8de89debfa077ccd3bc10fd',
  'ff1c851669037e339d4d6f3be6f6f23bdc28f6b4f8b96b14165904cad8d0aaf3',
  '65ec2bf696e7fd4e35ea690d73bc7f0986e2f61a29b8ae9e946798254258905d',
  'f2cdcf74d4601192cd107a2912521e9c2b87ff0a5ac10e31b07b31a5671b62bb',
  '3b36f4ceca0036fd0ec73cc1950ab3b0e72d780b9890b4d20c8c2296f5b4f31c',
  'b1ad05b6b7e482e14f46008105adb01d38c355c8381e1cef023e789f1514ad53',
  '1398ce730339fee3969f5195786d5c688fb9e0034e771e5d2dcf735e9cca93e8',
  '4c874ea869650a77d37802306a74baef8ea429630a5a2373b285874ceac33be6',
  '77ef6ab2217458577e445adf9c65a2da3e3f43732a5ff8d5debb45fe4422f45c',
  'acd487b536525d2588758ee6230f58c5a8dc100b3eb06b91d7bfb6122a44a6bd',
  'c61fdafa5c5d160376bad339454ca4eb2a887f91b421f7a5a141dc8add24903e',
  '9496e4b4650c234bed7357b10cefc08f006a7558c239dc3951f85193bb8ac3ca',
  '6b4944cc67c0035412f6a6d695640b2929acc95d2823ecbc70f11e184b88dc5d',
  'd7eb8f1b81a41f052bef7896c1eb532e6e7536568411c9afa1982ca473fcba64',
  '91570f9a90165cf7393706d1a241c73e5b71c2053d9c11fc84d8e3d66f5f27f0',
  'd77fc8ce349096102525307810f5fa262108245a4b22975b3bc97cd7b68a5cc8',
  '6289b26bee3921bcb0e3cefd2985d54c98f41308b21d0db2c1acfaa4512f65d3',
  '2f8a8cfac3ca289e478af6ba476e92c4f152c6fcd297465abf110aeaecd4c6c1',
  '3a4edd93f00ca7d0060aa914c849ef8f3fc51259c47063b7a03a4ac72d7c4d53',
  '142c7e11a343798f727d332ccfbfdb6492823a16e3070f9b7fde572b1ea4cfe1',
  'db1addcf1f8626cedc5230da19ab0a3ae8d15986c088cd0aab8e23b3eedb9204',
])

// Phrases écartées lors de la revue finale dans l’administration. Ces clés
// stables empêchent une régénération du corpus de les réintroduire.
const REJECTED_AFTER_ADMIN_REVIEW = new Set([
  'a04072f5131a5a9a8c500432a2a7ffa91aceb7dad2b659e1574bb0a040fba95d',
  'fd9abd9a867ab8b68f660231ea7226e3d005cf764cc7fdac609550be813413ca',
  '304026626d073a963ea2bef8e6c1e9ff6a0cb56918012567be9545a5141ac2a9',
  '132e654207f2b1e0a99898b50895544f57b17f30d2bad2bac42a7f50eb8f6a60',
  'a97d38da48c398bcef459196caf17ff3363e3131a29c9838406de45389c90a37',
  '853d34360695095de0308a4b2b031bd5dab666d5523e8b6baf413f7e0e157f09',
  'd81899690d2bccdf951bff6611a0b5bb4580dab30be785984b0757bdf03db39e',
  'b985905986a860260143a2c4abbcbafb33c735ef23ffa4111701b83d171e6d80',
  'f4b23199e8e6f9682b849c2a5e865caaba0d951c1452cf67103a4b8db1c05906',
  'a252fa0a65fbd5192441689d35a20e514ea18f410afd2dfe2dbcf6d18bb3eaab',
  '5f28d24d3301bdebe0acbb0a23e71edd1fcf00007d64761cf7e07b59df8cec30',
  '0220a6dbec4963f3331906599e9bd865cb3835879b1481717aabf82164c5130d',
])

const compact = value => String(value || '').replace(/[‘ʼ‛`´']/gu, '’').replace(/\s+/gu, ' ').trim()
const normalized = value => compact(value).toLocaleLowerCase('fr-CH')
const checksum = value => createHash('sha256').update(value).digest('hex')
const wordCount = value => value.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length || 0
const isStandaloneSentence = value => /^[A-ZÀ-ÖØ-ÞŒÆ«“]/u.test(value.trim())

function htmlText(html) {
  let value = html
    .replace(/<(script|style|table)\b[\s\S]*?<\/\1>/giu, ' ')
    .replace(/<sup\b[\s\S]*?<\/sup>/giu, ' ')
    .replace(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/giu, (_match, heading) => {
      const label = compact(decode(heading.replace(/<[^>]+>/gu, ' ')))
      return `\n\n§§CHAPTER§§ ${label}\n\n`
    })
    .replace(/<br\s*\/?\s*>/giu, '\n')
    .replace(/<\/(?:p|div|li|blockquote)>/giu, '\n')
    .replace(/<[^>]+>/gu, ' ')
  return decode(value)
    .replace(/\u00ad/gu, '')
    .replace(/[\u00a0\u202f]/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .replace(/ *\n */gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function rawSentences(raw) {
  const html = JSON.parse(raw)?.parse?.text
  if (typeof html !== 'string') throw new Error('Réponse Wikisource invalide.')
  const sections = htmlText(html).split('§§CHAPTER§§').map((chunk, index) => {
    const lines = chunk.split('\n').map(compact).filter(Boolean)
    return { chapter: index === 0 ? null : (lines.shift() || null), text: lines.join('\n') }
  }).filter(section => section.text && !/^PR[ÉE]FACE\b/iu.test(section.chapter || ''))
  const segmenter = new Intl.Segmenter('fr', { granularity: 'sentence' })
  const values = []
  let locator = 0
  for (const section of sections) {
    for (const part of segmenter.segment(section.text)) {
      const text = compact(part.segment).replace(/^(?:(?:—|»)\s+)+/u, '')
      if (!text || !/[.!?…]$/u.test(text)) continue
      if (/\b(?:M|Mme|Mlle|Dr|etc)\.$/u.test(text)) continue
      const words = wordCount(text)
      if (words < 4 || words > 32 || text.length > 280) continue
      locator += 1
      values.push({ chapter: section.chapter, locator: `Phrase ${locator}`, text, wordCount: words, characterCount: text.length })
    }
  }
  return values
}

function variants(value) {
  return compact(value).split(/[-/,;|]/gu).map(normalized).filter(Boolean)
}

function agreedParticiples(value) {
  const values = new Set()
  for (const form of variants(value)) {
    values.add(form)
    if (!/[sx]$/u.test(form)) values.add(`${form}s`)
    if (!/e$/u.test(form)) values.add(`${form}e`)
    if (!/es$/u.test(form)) values.add(`${form.replace(/e?$/u, '')}es`)
  }
  return [...values]
}

function occurrences(haystack, needle) {
  const values = []
  let offset = 0
  while (needle && (offset = haystack.indexOf(needle, offset)) >= 0) {
    const end = offset + needle.length
    if (!/[\p{L}\p{N}]/u.test(haystack[offset - 1] || '') && !/[\p{L}\p{N}]/u.test(haystack[end] || '')) values.push([offset, end])
    offset = Math.max(end, offset + 1)
  }
  return values
}

function pastInfinitiveCue(text, start) {
  const context = normalized(text.slice(Math.max(0, start - 55), start))
  return /(?:après|avant de|afin de|de|d’|pour|sans|devait|doit|peut|pouvait|croit|croyait|pensait|regrette|regrettait)\s*$/u.test(context)
}

const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const raw = await readFile(rawPath, 'utf8')
const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const finiteCandidates = []
  let reviewNumber = 0
  for (const sentence of inventory.sentences) {
    const rare = sentence.targets.filter(target => RARE_TENSE_IDS.has(Number(target.tenseId)) && target.confidence === 'high')
    if (!rare.length) continue
    reviewNumber += 1
    const allowedForms = REVIEWED_FINITE.get(reviewNumber)
    if (!REVIEWED_FINITE.has(reviewNumber)) continue
    if (!literaryYouthSafety(sentence.text).suitable) continue
    if (!isStandaloneSentence(sentence.text)) continue
    const targets = allowedForms ? rare.filter(target => allowedForms.includes(target.form)) : rare
    for (const target of targets) {
      if (sentence.text.includes('qu’il eût mieux aimé') && target.form === 'eût') {
        target.verbId = 87
        target.tenseId = 17
        target.form = 'eût mieux aimé'
        target.start = sentence.text.indexOf(target.form)
        target.end = target.start + target.form.length
        target.isCompound = true
      }
    }
    if (targets.length) finiteCandidates.push({ ...sentence, targets })
  }

  const [verbs] = await database.query(`
    SELECT id,infinitif,\`participe_présent\` AS presentParticiple,
           \`participe_passé\` AS pastParticiple,auxiliaire AS auxiliary
    FROM verbes WHERE est_archive=0
  `)
  const [[infinitivePast]] = await database.query(`
    SELECT t.id FROM temps t INNER JOIN modes m ON m.id=t.mode_id
    WHERE m.name='infinitif' AND t.name='passé' LIMIT 1
  `)
  const [gerundTenses] = await database.query(`
    SELECT t.id,t.name FROM temps t INNER JOIN modes m ON m.id=t.mode_id
    WHERE m.name='gérondif'
  `)
  const gerundTenseIds = new Map(gerundTenses.map(row => [row.name, Number(row.id)]))
  if (!infinitivePast?.id) throw new Error('Le temps infinitif passé est absent de la base.')

  const nonFiniteDisplays = new Map()
  const addDisplay = (display, candidate) => {
    const values = nonFiniteDisplays.get(display) || []
    values.push(candidate)
    nonFiniteDisplays.set(display, values)
  }
  for (const verb of verbs) {
    const auxiliary = normalized(verb.auxiliary).includes('être') ? 'être' : 'avoir'
    for (const participle of agreedParticiples(verb.pastParticiple)) {
      addDisplay(`${auxiliary} ${participle}`, { verbId: Number(verb.id), tenseId: Number(infinitivePast.id), personId: 6, kind: 'infinitif passé' })
      addDisplay(`en ${auxiliary === 'être' ? 'étant' : 'ayant'} ${participle}`, { verbId: Number(verb.id), tenseId: gerundTenseIds.get('passé'), personId: 6, kind: 'gérondif passé' })
    }
    for (const participle of variants(verb.presentParticiple)) {
      addDisplay(`en ${participle}`, { verbId: Number(verb.id), tenseId: gerundTenseIds.get('présent'), personId: 6, kind: 'gérondif présent' })
    }
  }

  const nonFiniteCandidates = []
  for (const sentence of rawSentences(raw)) {
    if (!literaryYouthSafety(sentence.text).suitable) continue
    if (!isStandaloneSentence(sentence.text)) continue
    const searchable = normalized(sentence.text)
    for (const [display, matches] of nonFiniteDisplays) {
      const grammatical = [...new Map(matches.map(candidate => [`${candidate.verbId}:${candidate.tenseId}`, candidate])).values()]
      if (grammatical.length !== 1) continue
      for (const [start, end] of occurrences(searchable, display)) {
        const candidate = grammatical[0]
        if (candidate.kind === 'infinitif passé' && !pastInfinitiveCue(sentence.text, start)) continue
        const key = checksum(`${sentence.text}\u0000${start}\u0000${end}\u0000${candidate.verbId}\u0000${candidate.tenseId}`)
        nonFiniteCandidates.push({
          key, ...sentence, kind: candidate.kind,
          target: {
            verbId: candidate.verbId, tenseId: candidate.tenseId, personId: candidate.personId,
            form: sentence.text.slice(start, end), start, end, isCompound: candidate.kind.endsWith('passé'),
            confidence: 'high', ambiguityReason: null,
          },
        })
      }
    }
  }
  const uniqueNonFinite = [...new Map(nonFiniteCandidates.map(candidate => [candidate.key, candidate])).values()]
  if (auditNonFinite) {
    uniqueNonFinite.forEach((candidate, index) => {
      console.log(`${String(index + 1).padStart(3, '0')} | ${candidate.key} | ${candidate.kind}:${candidate.target.form} | ${candidate.text}`)
    })
    console.log(JSON.stringify({ nonFiniteCandidates: uniqueNonFinite.length }, null, 2))
    process.exitCode = 0
  } else {
    const reviewedNonFinite = uniqueNonFinite.filter(candidate => REVIEWED_NON_FINITE.has(candidate.key))
      .map(candidate => ({
        key: checksum(`stendhal-le-rouge-et-le-noir-1830\u0000${candidate.chapter || ''}\u0000${candidate.locator}\u0000${candidate.text}`),
        chapter: candidate.chapter, locator: candidate.locator, text: candidate.text,
        wordCount: candidate.wordCount, characterCount: candidate.characterCount, targets: [candidate.target],
      }))
    const sentences = [...finiteCandidates, ...reviewedNonFinite]
    const byText = new Map()
    for (const sentence of sentences) {
      const existing = byText.get(sentence.text)
      if (!existing) {
        byText.set(sentence.text, sentence)
        continue
      }
      existing.targets = [...new Map([...existing.targets, ...sentence.targets].map(target => [
        `${target.start}:${target.end}:${target.verbId}:${target.tenseId}:${target.personId}`, target,
      ])).values()]
    }
    const deduplicated = [...byText.values()]
      .filter(sentence => !REJECTED_AFTER_ADMIN_REVIEW.has(sentence.key))
      .sort((left, right) => left.locator.localeCompare(right.locator, 'fr', { numeric: true }))
    const payload = {
      source: {
        key: 'stendhal-le-rouge-et-le-noir-1830', author: 'Stendhal', title: 'Le Rouge et le Noir',
        edition: 'Michel Lévy Frères, 1854 ; œuvre originale publiée en 1830',
        sourceUrl: 'https://fr.wikisource.org/wiki/Le_Rouge_et_le_Noir/Texte_entier',
        license: 'Domaine public ; transcription Wikisource sous CC BY-SA',
        publicDomainBasis: 'Stendhal est décédé en 1842 ; œuvre originale en français publiée en 1830.',
        checksum: checksum(`${raw}\u0000reviewed-rare-youth-v2`),
      },
      sentences: deduplicated,
    }
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    let appliedTargets = 0
    if (apply) {
      await database.beginTransaction()
      try {
        await database.execute(`
          INSERT INTO literary_sources
            (source_key,author,title,edition,source_url,source_license,public_domain_basis,source_checksum)
          VALUES (?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE author=VALUES(author),title=VALUES(title),edition=VALUES(edition),
            source_url=VALUES(source_url),source_license=VALUES(source_license),
            public_domain_basis=VALUES(public_domain_basis),source_checksum=VALUES(source_checksum)
        `, Object.values(payload.source))
        const [[source]] = await database.execute(
          'SELECT id FROM literary_sources WHERE source_key=?',
          [payload.source.key],
        )
        if (!source?.id) throw new Error('Source Stendhal introuvable après insertion.')
        await database.execute(`
          DELETE target FROM literary_targets target
          INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
          WHERE sentence.source_id=?
        `, [source.id])
        await database.execute('DELETE FROM literary_sentences WHERE source_id=?', [source.id])
        for (const sentence of payload.sentences) {
          await database.execute(`
            INSERT INTO literary_sentences
              (source_id,external_key,chapter,locator,sentence_text,word_count,character_count)
            VALUES (?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE chapter=VALUES(chapter),locator=VALUES(locator),
              sentence_text=VALUES(sentence_text),word_count=VALUES(word_count),character_count=VALUES(character_count)
          `, [source.id, sentence.key, sentence.chapter, sentence.locator, sentence.text, sentence.wordCount, sentence.characterCount])
          const [[storedSentence]] = await database.execute(
            'SELECT id FROM literary_sentences WHERE external_key=?',
            [sentence.key],
          )
          for (const target of sentence.targets) {
            const [result] = await database.execute(`
              INSERT INTO literary_targets
                (sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end,
                 confidence,ambiguity_reason,review_status,review_note,reviewed_at)
              VALUES (?,?,?,?,?,?,?,'high',NULL,'validated',?,CURRENT_TIMESTAMP)
              ON DUPLICATE KEY UPDATE target_text=VALUES(target_text),confidence='high',ambiguity_reason=NULL,
                review_status='validated',review_note=VALUES(review_note),reviewed_at=CURRENT_TIMESTAMP
            `, [
              storedSentence.id, target.verbId, target.tenseId, target.personId,
              target.form, target.start, target.end,
              'Validation éditoriale : forme rare et contexte adapté aux enfants et aux jeunes.',
            ])
            appliedTargets += Number(result.affectedRows > 0)
          }
        }
        await database.commit()
      } catch (error) {
        await database.rollback()
        throw error
      }
    }
    console.log(JSON.stringify({
      reviewedFiniteSentences: finiteCandidates.length,
      reviewedNonFiniteSentences: reviewedNonFinite.length,
      retainedSentences: deduplicated.length,
      retainedTargets: deduplicated.reduce((total, sentence) => total + sentence.targets.length, 0),
      ...(apply ? { appliedTargets } : {}),
      output: outputPath,
    }, null, 2))
  }
} finally {
  await database.end()
}
