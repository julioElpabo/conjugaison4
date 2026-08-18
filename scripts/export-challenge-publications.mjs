import { rename, writeFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const outputPath = 'shared/data/challenge-publication-deployment.json'
const temporaryPath = `${outputPath}.tmp`
const overwriteExisting = process.argv.includes('--overwrite-existing')
const preservePublicationStatus = process.argv.includes('--preserve-publication-status')

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const [rows] = await database.query(`
    SELECT preset.preset_key AS presetKey,publication.locale,publication.slug,
           publication.title,publication.meta_title AS metaTitle,
           publication.description,publication.meta_description AS metaDescription,
           publication.is_published AS isPublished,
           publication.is_indexable AS isIndexable
    FROM challenge_preset_publications publication
    INNER JOIN challenge_presets preset ON preset.id=publication.preset_id
    ORDER BY preset.preset_key,FIELD(publication.locale,'fr','de','en','it','es')
  `)
  const publications = rows.map(row => ({
    presetKey: row.presetKey,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    metaTitle: row.metaTitle,
    description: row.description,
    metaDescription: row.metaDescription,
    isPublished: preservePublicationStatus ? Boolean(row.isPublished) : false,
    isIndexable: preservePublicationStatus ? Boolean(row.isPublished) : false,
    overwriteExisting,
  }))
  const generatedAt = new Date().toISOString()
  const batch = {
    schemaVersion: 1,
    batchId: publications.length
      ? `challenge-publications-${generatedAt.replace(/[-:.TZ]/gu, '').toLowerCase()}`
      : null,
    publications,
  }
  await writeFile(temporaryPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, outputPath)
  console.log(JSON.stringify({
    output: outputPath,
    batchId: batch.batchId,
    publications: publications.length,
    overwriteExisting,
    preservePublicationStatus,
  }, null, 2))
} finally {
  await database.end()
}
