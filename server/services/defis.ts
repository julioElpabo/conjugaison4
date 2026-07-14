import { randomInt } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import type { DefiDefinition } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { parseDefiDefinition, PublicInputError, serializeDefi } from './public-api-validation'
import {
  decodePronominalSelectionId,
  encodePronominalSelectionId,
} from '../../shared/utils/pronominal-selection'

interface CountRow extends RowDataPacket { count: number }
interface DefiRow extends RowDataPacket { name: string; defi: string }
interface LegacyPronominalRow extends RowDataPacket { id: number; legacy_verbe_id: number }

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
  const verbIds = definition.verbIds.filter(id => id > 0)
  const pronominalUseIds = definition.verbIds
    .filter(id => id < 0)
    .map(decodePronominalSelectionId)
    .filter((id): id is number => id !== null)
  const [verbResult, pronominalResult, tenseResult] = await Promise.all([
    verbIds.length > 0
      ? database.execute<CountRow[]>(
          `SELECT COUNT(*) AS count FROM verbes WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0`,
          verbIds
        )
      : Promise.resolve([[{ count: 0 }]] as unknown as Awaited<ReturnType<typeof database.execute<CountRow[]>>>),
    pronominalUseIds.length > 0
      ? database.execute<CountRow[]>(
          `SELECT COUNT(*) AS count FROM emplois_pronominaux
           WHERE id IN (${placeholders(pronominalUseIds)}) AND actif = 1 AND verbe_id IS NOT NULL`,
          pronominalUseIds
        )
      : Promise.resolve([[{ count: 0 }]] as unknown as Awaited<ReturnType<typeof database.execute<CountRow[]>>>),
    database.execute<CountRow[]>(
      `SELECT COUNT(*) AS count FROM temps WHERE id IN (${placeholders(definition.tenseIds)})`,
      definition.tenseIds
    )
  ])
  if (Number(verbResult[0][0]?.count) !== verbIds.length
      || Number(pronominalResult[0][0]?.count) !== pronominalUseIds.length
      || verbIds.length + pronominalUseIds.length !== definition.verbIds.length) {
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
  const database = useDatabase()
  const [rows] = await database.execute<DefiRow[]>(
    'SELECT name, defi FROM defis WHERE name = ? ORDER BY id DESC LIMIT 1',
    [code]
  )
  const row = rows[0]
  if (!row) throw new DefiNotFoundError('Défi introuvable')

  try {
    const definition = parseDefiDefinition(JSON.parse(row.defi))
    const legacyIds = definition.verbIds.filter(id => id > 0)
    if (legacyIds.length === 0) return definition

    const [aliases] = await database.execute<LegacyPronominalRow[]>(`
      SELECT id, legacy_verbe_id
      FROM emplois_pronominaux
      WHERE legacy_verbe_id IN (${placeholders(legacyIds)})
        AND actif = 1 AND verbe_id IS NOT NULL
    `, legacyIds)
    if (aliases.length === 0) return definition

    const byLegacyId = new Map(aliases.map(alias => [
      Number(alias.legacy_verbe_id),
      encodePronominalSelectionId(Number(alias.id)),
    ]))
    definition.verbIds = [...new Set(definition.verbIds.map(id => byLegacyId.get(id) ?? id))]
    return definition
  } catch {
    throw new DefiStorageError('Le défi enregistré est illisible')
  }
}
