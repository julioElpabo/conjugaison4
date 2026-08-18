import { createHash } from 'node:crypto'
import type { Pool, RowDataPacket } from 'mysql2/promise'
import type {
  ChallengePublicationDeploymentBatch,
  ChallengePublicationDeploymentEntry,
} from '../../shared/types/challenge-publication'
import {
  parseChallengePublicationPayload,
  parsePublicationLocale,
  saveChallengePublication,
} from './challenge-publications'

interface DeploymentRow extends RowDataPacket { checksum: string }
interface PresetRow extends RowDataPacket { id: number }
interface ExistingRow extends RowDataPacket { id: number }

export interface ChallengePublicationDeploymentResult {
  status: 'empty' | 'already-applied' | 'applied'
  inserted: number
  replaced: number
  preserved: number
}

function parseDeploymentEntry(value: unknown): ChallengePublicationDeploymentEntry {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Entrée de déploiement SEO invalide.')
  }
  const entry = value as Record<string, unknown>
  const presetKey = typeof entry.presetKey === 'string' ? entry.presetKey.trim() : ''
  if (!presetKey || presetKey.length > 80 || !/^[a-z0-9][a-z0-9_-]*$/iu.test(presetKey)) {
    throw new Error('Clé stable de défi invalide dans le déploiement SEO.')
  }
  if (typeof entry.overwriteExisting !== 'boolean') {
    throw new Error(`overwriteExisting doit être un booléen pour ${presetKey}.`)
  }
  const input = parseChallengePublicationPayload({
    slug: entry.slug,
    title: entry.title,
    metaTitle: entry.metaTitle,
    description: entry.description,
    metaDescription: entry.metaDescription,
    isPublished: entry.isPublished,
    isIndexable: entry.isIndexable,
  })
  return {
    presetKey,
    locale: parsePublicationLocale(entry.locale),
    overwriteExisting: entry.overwriteExisting,
    ...input,
  }
}

export function parseChallengePublicationDeployment(value: unknown): ChallengePublicationDeploymentBatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Paquet de déploiement SEO invalide.')
  }
  const batch = value as Record<string, unknown>
  if (batch.schemaVersion !== 1) throw new Error('Version de paquet SEO non prise en charge.')
  if (batch.batchId !== null && (typeof batch.batchId !== 'string' || !/^[a-z0-9._-]{1,120}$/iu.test(batch.batchId))) {
    throw new Error('Identifiant de paquet SEO invalide.')
  }
  if (!Array.isArray(batch.publications)) throw new Error('Liste des publications SEO invalide.')
  const publications = batch.publications.map(parseDeploymentEntry)
  const identities = new Set<string>()
  for (const publication of publications) {
    const identity = `${publication.presetKey}:${publication.locale}`
    if (identities.has(identity)) throw new Error(`Publication SEO dupliquée dans le paquet : ${identity}.`)
    identities.add(identity)
  }
  if (publications.length && !batch.batchId) {
    throw new Error('Un paquet SEO non vide doit posséder un identifiant.')
  }
  return { schemaVersion: 1, batchId: batch.batchId as string | null, publications }
}

function deploymentChecksum(batch: ChallengePublicationDeploymentBatch) {
  return createHash('sha256').update(JSON.stringify(batch)).digest('hex')
}

export async function applyChallengePublicationDeployment(
  database: Pool,
  value: unknown,
): Promise<ChallengePublicationDeploymentResult> {
  const batch = parseChallengePublicationDeployment(value)
  if (!batch.batchId || !batch.publications.length) {
    return { status: 'empty', inserted: 0, replaced: 0, preserved: 0 }
  }

  const checksum = deploymentChecksum(batch)
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    const [appliedRows] = await connection.execute<DeploymentRow[]>(`
      SELECT checksum FROM challenge_preset_publication_deployments
      WHERE batch_id=? FOR UPDATE
    `, [batch.batchId])
    if (appliedRows[0]) {
      if (appliedRows[0].checksum !== checksum) {
        throw new Error(`Le paquet SEO ${batch.batchId} a changé après son application.`)
      }
      await connection.rollback()
      return { status: 'already-applied', inserted: 0, replaced: 0, preserved: 0 }
    }

    let inserted = 0
    let replaced = 0
    let preserved = 0
    for (const publication of batch.publications) {
      const [presetRows] = await connection.execute<PresetRow[]>(
        'SELECT id FROM challenge_presets WHERE preset_key=? LIMIT 1 FOR UPDATE',
        [publication.presetKey],
      )
      const preset = presetRows[0]
      if (!preset) throw new Error(`Défi officiel introuvable : ${publication.presetKey}.`)

      const [existingRows] = await connection.execute<ExistingRow[]>(`
        SELECT id FROM challenge_preset_publications
        WHERE preset_id=? AND locale=? LIMIT 1 FOR UPDATE
      `, [preset.id, publication.locale])
      const exists = Boolean(existingRows[0])
      if (exists && !publication.overwriteExisting) {
        preserved += 1
        continue
      }
      await saveChallengePublication(connection, Number(preset.id), publication.locale, publication)
      if (exists) replaced += 1
      else inserted += 1
    }

    await connection.execute(`
      INSERT INTO challenge_preset_publication_deployments (batch_id,checksum)
      VALUES (?,?)
    `, [batch.batchId, checksum])
    await connection.commit()
    return { status: 'applied', inserted, replaced, preserved }
  }
  catch (error) {
    await connection.rollback()
    throw error
  }
  finally {
    connection.release()
  }
}
