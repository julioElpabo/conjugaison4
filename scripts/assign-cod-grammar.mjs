import { writeFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const APPLY = process.argv.includes('--apply')
const backupPath = `/private/tmp/conjugaison4-cod-grammar-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const masculineHeads = new Set([
  'actes', 'acteurs', 'amis', 'animaux', 'applaudissements', 'arbres', 'biens', 'bijoux',
  'ami', 'bras', 'bureau', 'cahier', 'calme', 'cartons', 'chemin', 'cheveux', 'chiffres',
  'choix', 'documents', 'dossiers', 'enfants', 'escalier', 'esprits', 'evenements', 'fonds',
  'fruits', 'hommes', 'jouets', 'legumes', 'livre', 'livres', 'manteau', 'materiaux',
  'meubles', 'metier', 'oiseaux', 'outils', 'pas', 'pieds', 'portefeuille', 'prenom',
  'produits', 'professeurs', 'regards', 'resultats', 'rideaux', 'sceptiques', 'secours',
  'portrait', 'repas', 'reve', 'sac', 'salaire', 'spectateurs', 'talons', 'telephone',
  'temoins', 'tour', 'transports', 'travail', 'troupeaux', 'velo', 'verres', 'vetements',
  'visage', 'voisin', 'volets', 'voyage', 'voyages', 'yeux',
])

const feminineHeads = new Set([
  'affaires', 'briques', 'cartes', 'cellules', 'chaises', 'charges', 'chaussures', 'chutes',
  'cles', 'connaissances', 'consignes', 'convenances', 'cotes', 'couleurs', 'courses',
  'denrees', 'dents', 'donnees', 'eau', 'equipe', 'erreur', 'etoiles', 'explication', 'fleurs', 'glaces',
  'informations', 'intemperies', 'lettres', 'lignes', 'lunettes', 'mains', 'marchandises',
  'marches', 'mauvaises', 'noix', 'nouvelles', 'pages',
  'paroles', 'pieces', 'plantes', 'poires', 'poubelles', 'vacances', 'vaches', 'valises',
  'vergues', 'vitres',
])

// Le h aspiré ne peut pas être déduit de l’orthographe.
const aspiratedHHeads = new Set(['haie', 'hauteur'])

function normalized(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr')
    .replace(/\s+/gu, ' ')
    .trim()
}

function parseComplement(value) {
  const text = String(value || '').replace(/\s+/gu, ' ').trim()
  const rules = [
    [/^de la\s+(.+)$/iu, 'feminin', 'singulier'],
    [/^de l[’'](.+)$/iu, null, 'singulier'],
    [/^du\s+(.+)$/iu, 'masculin', 'singulier'],
    [/^une autre\s+(.+)$/iu, 'feminin', 'singulier', 'autre '],
    [/^un autre\s+(.+)$/iu, 'masculin', 'singulier', 'autre '],
    [/^d[’']autres\s+(.+)$/iu, null, 'pluriel', 'autres '],
    [/^(?:une|la|cette|ma|ta|sa)\s+(.+)$/iu, 'feminin', 'singulier'],
    [/^(?:un|le|ce|cet)\s+(.+)$/iu, 'masculin', 'singulier'],
    [/^(?:des|les|ces|mes|tes|ses|nos|vos|leurs|quelques)\s+(.+)$/iu, null, 'pluriel'],
    [/^(?:mon|ton|son|notre|votre|leur)\s+(.+)$/iu, null, 'singulier'],
    [/^l[’'](.+)$/iu, null, 'singulier'],
  ]

  for (const [pattern, gender, number, prefix = ''] of rules) {
    const match = text.match(pattern)
    if (!match?.[1]) continue
    const rest = match[1].trim()
    return {
      text,
      gender,
      number,
      nounPhrase: `${prefix}${rest}`,
      canonicalCore: normalized(rest),
    }
  }
  return { text, gender: null, number: null, nounPhrase: text, canonicalCore: normalized(text) }
}

function headOf(parsed) {
  return normalized(parsed.nounPhrase).split(/\s+/u)[0] || ''
}

function lexicalGender(parsed) {
  const head = headOf(parsed)
  if (masculineHeads.has(head)) return 'masculin'
  if (feminineHeads.has(head)) return 'feminin'
  return null
}

function anteposedText(parsed, gender, number) {
  if (number === 'pluriel') return `les ${parsed.nounPhrase}`
  const head = headOf(parsed)
  const first = head.charAt(0)
  const elide = 'aeiouy'.includes(first) || (first === 'h' && !aspiratedHHeads.has(head))
  return elide
    ? `l’${parsed.nounPhrase}`
    : `${gender === 'feminin' ? 'la' : 'le'} ${parsed.nounPhrase}`
}

try {
  const [rows] = await database.execute(`
    SELECT c.id, c.construction_id, c.texte, c.texte_antepose, c.genre, c.nombre,
      c.source, v.infinitif
    FROM complements_verbaux c
    INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
    INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
    INNER JOIN verbes v ON v.id=vs.verbe_id
    WHERE c.actif=1 AND cv.fonction_objet='cod'
    ORDER BY v.infinitif, c.construction_id, c.id
  `)

  const parsedRows = rows.map(row => ({ ...row, parsed: parseComplement(row.texte) }))
  const groupGenders = new Map()
  for (const row of parsedRows) {
    const gender = row.parsed.gender || lexicalGender(row.parsed)
    if (gender) groupGenders.set(`${row.construction_id}|${row.parsed.canonicalCore}`, gender)
  }

  const assignments = parsedRows.map((row) => {
    const gender = row.parsed.gender
      || groupGenders.get(`${row.construction_id}|${row.parsed.canonicalCore}`)
      || lexicalGender(row.parsed)
    const number = row.parsed.number
    return {
      id: Number(row.id),
      verb: row.infinitif,
      text: row.texte,
      previous: {
        anteposedText: row.texte_antepose,
        gender: row.genre,
        number: row.nombre,
      },
      next: {
        anteposedText: gender && number ? anteposedText(row.parsed, gender, number) : null,
        gender,
        number,
      },
    }
  })

  const unresolved = assignments.filter(item => !item.next.gender || !item.next.number)
  if (unresolved.length) {
    console.error(JSON.stringify({ unresolvedCount: unresolved.length, unresolved }, null, 2))
    throw new Error('Aucune écriture effectuée : certains COD restent indéterminés.')
  }

  const changed = assignments.filter(item => (
    normalized(item.previous.gender) !== normalized(item.next.gender)
    || normalized(item.previous.number) !== normalized(item.next.number)
    || item.previous.anteposedText !== item.next.anteposedText
  ))
  const combinations = Object.fromEntries(Object.entries(Object.groupBy(assignments, item => (
    `${item.next.gender}:${item.next.number}`
  ))).map(([key, values]) => [key, values.length]))

  if (!APPLY) {
    console.log(JSON.stringify({ mode: 'dry-run', total: assignments.length, changed: changed.length, combinations }, null, 2))
    process.exitCode = 0
  } else {
    await writeFile(backupPath, `${JSON.stringify(assignments, null, 2)}\n`, 'utf8')
    await database.beginTransaction()
    try {
      for (const item of assignments) {
        await database.execute(`
          UPDATE complements_verbaux
          SET texte_antepose=?, genre=?, nombre=?
          WHERE id=?
        `, [item.next.anteposedText, item.next.gender, item.next.number, item.id])
      }
      await database.commit()
    } catch (error) {
      await database.rollback()
      throw error
    }
    console.log(JSON.stringify({
      mode: 'apply', total: assignments.length, changed: changed.length, combinations, backupPath,
    }, null, 2))
  }
} finally {
  await database.end()
}
