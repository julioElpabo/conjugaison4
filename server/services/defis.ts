import { randomInt } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import type { DefiDefinition } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { parseDefiDefinition, PublicInputError, serializeDefi } from './public-api-validation'

interface CountRow extends RowDataPacket { count: number }
interface DefiRow extends RowDataPacket { name: string; defi: string }

const CODE_ALPHABET = 'ABCDEFGHKLMNPQRSTUVWXYZ23456789'
const CODE_PATTERN = /^[A-HK-NP-Z2-9]{2}(?:-[A-HK-NP-Z2-9]{2}){3}$/

export class DefiNotFoundError extends Error {}
export class DefiStorageError extends Error {}

function placeholders(values: readonly unknown[]) {
  return values.map(() => '?').join(', ')
}

function createCode() {
  const groups = Array.from({ length: 4 }, () => Array.from({ length: 2 }, () => (
    CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  )).join(''))
  return groups.join('-')
}

export function normalizeDefiCode(value: string | undefined) {
  const code = (value || '').trim().toUpperCase()
  if (!CODE_PATTERN.test(code)) {
    throw new PublicInputError('Code de défi invalide')
  }
  return code
}

export async function assertDefiSelectionExists(definition: DefiDefinition) {
  const database = useDatabase()
  const [verbResult, tenseResult] = await Promise.all([
    database.execute<CountRow[]>(
      `SELECT COUNT(*) AS count FROM verbes WHERE id IN (${placeholders(definition.verbIds)})`,
      definition.verbIds
    ),
    database.execute<CountRow[]>(
      `SELECT COUNT(*) AS count FROM temps WHERE id IN (${placeholders(definition.tenseIds)})`,
      definition.tenseIds
    )
  ])
  if (Number(verbResult[0][0]?.count) !== definition.verbIds.length) {
    throw new PublicInputError('Un ou plusieurs verbes sont inconnus')
  }
  if (Number(tenseResult[0][0]?.count) !== definition.tenseIds.length) {
    throw new PublicInputError('Un ou plusieurs temps sont inconnus')
  }
}

export async function saveDefi(definition: DefiDefinition) {
  const database = useDatabase()
  await assertDefiSelectionExists(definition)

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = createCode()
    const [existing] = await database.execute<CountRow[]>(
      'SELECT COUNT(*) AS count FROM defis WHERE name = ?',
      [code]
    )
    if (Number(existing[0]?.count) !== 0) continue

    await database.execute(
      'INSERT INTO defis (name, defi) VALUES (?, ?)',
      [code, serializeDefi(definition)]
    )
    return code
  }

  throw new DefiStorageError('Impossible de créer un code unique')
}

export async function getDefi(code: string): Promise<DefiDefinition> {
  const [rows] = await useDatabase().execute<DefiRow[]>(
    'SELECT name, defi FROM defis WHERE name = ? ORDER BY id DESC LIMIT 1',
    [code]
  )
  const row = rows[0]
  if (!row) throw new DefiNotFoundError('Défi introuvable')

  try {
    return parseDefiDefinition(JSON.parse(row.defi))
  } catch {
    throw new DefiStorageError('Le défi enregistré est illisible')
  }
}
