import type { PoolConnection, RowDataPacket } from 'mysql2/promise'

/** https://www.academie-francaise.fr/claude-c-france */
export function repairUnnecessaryCedillas(value: string) {
  return value.replace(/(?:[çÇ]|[cC]\u0327)(?=[eéèêëiîïyÿ])/giu, letter => (
    letter === 'Ç' || letter.startsWith('C') ? 'C' : 'c'
  ))
}

/** Vérifie les familles dont le radical conserve le son [s] devant a, o et u. */
export function hasMissingCedilla(value: string, infinitive: string) {
  const base = infinitive.trim().toLocaleLowerCase('fr').replace(/^(?:se\s+|s['’])/u, '')
  const stem = base.endsWith('cer') ? base.slice(0, -2)
    : base.endsWith('cevoir') ? `${base.slice(0, -6)}c` : null
  if (!stem) return false
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return new RegExp(`(?:^|[^\\p{L}])${escaped}(?=[aàâäoôöuùûü])`, 'iu').test(value.normalize('NFC'))
}

function repairQuestionValue(value: unknown): unknown {
  if (typeof value === 'string') return repairUnnecessaryCedillas(value)
  if (Array.isArray(value)) return value.map(repairQuestionValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairQuestionValue(item)]))
  }
  return value
}

export function repairQuestionCedillas(serialized: string) {
  const question = JSON.parse(serialized)
  if (!question || typeof question !== 'object' || Array.isArray(question)) return serialized
  // Uniquement les textes générés : aucune réponse d'élève ni aucun résultat.
  const fields = [
    'consigne', 'reponses', 'reponsesPourCorrige', 'conjugaison1', 'conjugaison2', 'conjugaison3',
    'conjugationConfusions', 'radicalReference', 'futureSimpleForms', 'saisiePrefixe',
  ]
  let changed = false
  for (const field of fields) {
    if (!(field in question)) continue
    const repaired = repairQuestionValue(question[field])
    if (JSON.stringify(repaired) === JSON.stringify(question[field])) continue
    question[field] = repaired
    changed = true
  }
  return changed ? JSON.stringify(question) : serialized
}

interface TextRow extends RowDataPacket {
  [key: string]: unknown
}

const quote = (identifier: string) => `\`${identifier.replace(/`/gu, '``')}\``

export async function repairDatabaseCedillas(connection: PoolConnection, apply = false) {
  const report = { verbFields: 0, conjugationRows: 0, conjugationForms: 0, savedQuestions: 0 }
  const targets = [
    { table: 'verbes', keys: ['id'], columns: ['participe_présent', 'participe_passé'], json: false },
    { table: 'verbesconjugues', keys: ['id'], columns: ['conjugaison1', 'conjugaison2', 'conjugaison3'], json: false },
    { table: 'learner_run_questions', keys: ['run_id', 'question_index'], columns: ['question_json'], json: true },
    { table: 'learner_run_forms', keys: ['id'], columns: ['question_json'], json: true },
    { table: 'learner_answer_attempts', keys: ['id'], columns: ['question_json'], json: true },
  ]
  const [tables] = await connection.query<RowDataPacket[]>(
    'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()',
  )
  const available = new Set(tables.map(row => String(row.name)))
  for (const target of targets) {
    if (!available.has(target.table)) continue
    const where = target.columns.map(column => (
      `(LOCATE('ç',CAST(${quote(column)} AS BINARY))>0`
      + ` OR LOCATE('Ç',CAST(${quote(column)} AS BINARY))>0`
      + ` OR LOCATE(?,CAST(${quote(column)} AS BINARY))>0`
      + (target.json ? ` OR LOCATE(?,CAST(${quote(column)} AS BINARY))>0` : '') + ')'
    )).join(' OR ')
    const parameters = target.columns.flatMap(() => target.json ? ['\u0327', '\\u00'] : ['\u0327'])
    const [rows] = await connection.execute<TextRow[]>(
      `SELECT ${[...target.keys, ...target.columns].map(quote).join(',')} FROM ${quote(target.table)}`
      + ` WHERE ${where}${apply ? ' FOR UPDATE' : ''}`, parameters,
    )
    for (const row of rows) {
      const changes = target.columns.flatMap(column => {
        const before = row[column]
        if (typeof before !== 'string') return []
        const after = target.json ? repairQuestionCedillas(before) : repairUnnecessaryCedillas(before)
        return after === before ? [] : [{ column, after }]
      })
      if (!changes.length) continue
      if (apply) {
        await connection.execute(
          `UPDATE ${quote(target.table)} SET ${changes.map(change => `${quote(change.column)}=?`).join(',')}`
          + ` WHERE ${target.keys.map(key => `${quote(key)}=?`).join(' AND ')}`,
          [...changes.map(change => change.after), ...target.keys.map(key => String(row[key]))],
        )
      }
      if (target.table === 'verbes') report.verbFields += changes.length
      else if (target.table === 'verbesconjugues') {
        report.conjugationRows += 1
        report.conjugationForms += changes.length
      } else report.savedQuestions += 1
    }
  }
  return report
}

/** Lecture seule de toutes les colonnes textuelles, y compris les sauvegardes. */
export async function auditDatabaseCedillas(connection: PoolConnection) {
  const [columns] = await connection.query<RowDataPacket[]>(`
    SELECT TABLE_NAME AS tableName,COLUMN_NAME AS columnName
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()
      AND DATA_TYPE IN ('char','varchar','text','tinytext','mediumtext','longtext','json')
    ORDER BY TABLE_NAME,ORDINAL_POSITION
  `)
  const findings = []
  for (const column of columns) {
    const name = quote(String(column.columnName))
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT ${name} AS value FROM ${quote(String(column.tableName))}`
      + ` WHERE LOCATE('ç',CAST(${name} AS BINARY))>0 OR LOCATE('Ç',CAST(${name} AS BINARY))>0`
      + ` OR LOCATE(?,CAST(${name} AS BINARY))>0 OR LOCATE(?,CAST(${name} AS BINARY))>0`,
      ['\u0327', '\\u00'],
    )
    let cedillaValues = 0
    let suspiciousValues = 0
    let unusualValues = 0
    for (const row of rows) {
      const value = typeof row.value === 'string' ? row.value : JSON.stringify(row.value)
      const text = value.replace(/\\u([\da-f]{4})/giu, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      if (!/(?:[çÇ]|[cC]\u0327)/u.test(text)) continue
      cedillaValues += 1
      if (repairUnnecessaryCedillas(text) !== text) suspiciousValues += 1
      if (/[çÇ](?![aàâäoôöuùûü])/iu.test(text.normalize('NFC'))) unusualValues += 1
    }
    if (cedillaValues) findings.push({
      table: String(column.tableName), column: String(column.columnName), cedillaValues, suspiciousValues, unusualValues,
    })
  }
  const [verbs] = await connection.query<RowDataPacket[]>(
    'SELECT id,infinitif,`participe_présent` AS presentParticiple,`participe_passé` AS pastParticiple FROM verbes',
  )
  const [forms] = await connection.query<RowDataPacket[]>(`
    SELECT vc.id,v.infinitif,vc.conjugaison1,vc.conjugaison2,vc.conjugaison3
    FROM verbesconjugues vc JOIN verbes v ON v.id=vc.verbe_id
  `)
  const missingCedillas = []
  for (const [table, rows, fields] of [
    ['verbes', verbs, ['presentParticiple', 'pastParticiple']],
    ['verbesconjugues', forms, ['conjugaison1', 'conjugaison2', 'conjugaison3']],
  ] as const) {
    for (const row of rows) {
      for (const field of fields) {
        if (hasMissingCedilla(String(row[field] || ''), String(row.infinitif))) {
          missingCedillas.push({ table, id: row.id, infinitive: row.infinitif, field, value: row[field] })
        }
      }
    }
  }
  return { checkedTextColumns: columns.length, checkedVerbs: verbs.length, checkedConjugationRows: forms.length, findings, missingCedillas }
}
