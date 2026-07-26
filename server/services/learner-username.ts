import { randomInt } from 'node:crypto'
import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'

export const LEARNER_ANIMALS = [
  'abeille', 'aigle', 'albatros', 'alpaga', 'antilope', 'baleine', 'belette', 'bison',
  'blaireau', 'bouquetin', 'castor', 'cerf', 'chamois', 'chouette', 'cigogne', 'colibri',
  'cormoran', 'dauphin', 'ecureuil', 'elan', 'faucon', 'fennec', 'flamant', 'gazelle',
  'gecko', 'girafe', 'goeland', 'hamster', 'herisson', 'hibou', 'ibis', 'jaguar',
  'koala', 'lama', 'lemurien', 'leopard', 'loutre', 'lynx', 'manchot', 'marmotte',
  'martin-pecheur', 'mesange', 'narval', 'orque', 'otarie', 'panda', 'panthere', 'paon',
  'papillon', 'pelican', 'pingouin', 'poney', 'puma', 'raton', 'renard', 'rougegorge',
  'salamandre', 'serin', 'suricate', 'tamarin', 'tigre', 'toucan', 'tortue', 'vautour',
  'vigogne', 'wallaby', 'wombat', 'yak', 'zebre',
] as const

const USERNAME_PATTERN = /^[a-z]+(?:-[a-z]+)*-[0-9]{4,6}$/u
const animalSet = new Set<string>(LEARNER_ANIMALS)

interface ExistingUsernameRow extends RowDataPacket {
  username_normalized: string
}

export function normalizeLearnerUsername(value: unknown) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase('fr-CH') : ''
}

export function isGeneratedLearnerUsername(value: unknown) {
  const username = normalizeLearnerUsername(value)
  if (!USERNAME_PATTERN.test(username)) return false
  const separator = username.lastIndexOf('-')
  return separator > 0 && animalSet.has(username.slice(0, separator))
}

function candidate(numberDigits: number) {
  const animal = LEARNER_ANIMALS[randomInt(LEARNER_ANIMALS.length)]
  const minimum = 10 ** (numberDigits - 1)
  const maximum = 10 ** numberDigits
  return `${animal}-${randomInt(minimum, maximum)}`
}

export async function availableLearnerUsername(database: Pool | PoolConnection, excluded: string[] = []) {
  const exclusions = new Set(excluded.map(normalizeLearnerUsername).filter(isGeneratedLearnerUsername))
  for (const digits of [4, 5, 6]) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidates = [...new Set(Array.from({ length: 12 }, () => candidate(digits)))]
        .filter(item => !exclusions.has(item))
      if (!candidates.length) continue
      const placeholders = candidates.map(() => '?').join(', ')
      const [rows] = await database.execute<ExistingUsernameRow[]>(
        `SELECT username_normalized FROM learner_accounts WHERE username_normalized IN (${placeholders})`,
        candidates
      )
      const existing = new Set(rows.map(row => row.username_normalized))
      const available = candidates.find(item => !existing.has(item))
      if (available) return available
    }
  }
  throw createError({ statusCode: 503, statusMessage: 'Impossible de proposer un pseudonyme' })
}
