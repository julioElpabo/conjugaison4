import assert from 'node:assert/strict'
import { test } from 'node:test'
import mysql from 'mysql2/promise'
import { importFleVerbBatch } from '../server/services/fle-verb-import.ts'

const configured = Boolean((process.env.DB_HOST || process.env.NUXT_DB_HOST) && (process.env.DB_NAME || process.env.NUXT_DB_NAME))

test('import FLE isolé : audit sans écriture, échec MyISAM compensé, import et relance sans doublons', {skip: !configured}, async () => {
  const db = await mysql.createConnection({host:process.env.DB_HOST||process.env.NUXT_DB_HOST,port:Number(process.env.DB_PORT||process.env.NUXT_DB_PORT||3306),database:process.env.DB_NAME||process.env.NUXT_DB_NAME,user:process.env.DB_USER||process.env.NUXT_DB_USER,password:process.env.DB_PASSWORD||process.env.NUXT_DB_PASSWORD})
  const tables = ['verbes','verbesconjugues','verbe_sens','verbe_sens_categories','emplois_pronominaux']
  const names = new Map([...tables,'fle_verb_import_journal'].map(table => [table,`test_fle_${table}`]))
  let failAtForm = 0
  let inserts = 0
  let auditedWrites = 0
  const rewrite = sql => {
    if (sql.includes('information_schema')) return sql
    return sql.replace(/\b(verbesconjugues|verbe_sens_categories|verbe_sens|verbes|emplois_pronominaux|fle_verb_import_journal)\b/gu, table => names.get(table))
      .replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMPORARY TABLE IF NOT EXISTS')
  }
  const connection = {
    execute(sql, values) {
      if (/^\s*(INSERT|UPDATE|DELETE|CREATE)/iu.test(sql)) auditedWrites++
      if (/^INSERT INTO verbesconjugues/u.test(sql) && failAtForm && ++inserts === failAtForm) throw new Error('Panne simulée après insertion MyISAM')
      return db.execute(rewrite(sql),values)
    },
    query: (sql,values) => db.query(rewrite(sql),values),
    beginTransaction: () => db.beginTransaction(), commit: () => db.commit(), rollback: () => db.rollback(),
  }
  const counts = async original => Object.fromEntries(await Promise.all(tables.map(async table => {
    const [[result]]=await db.query(`SELECT COUNT(*) AS count FROM ${original?table:names.get(table)}`)
    return [table,Number(result.count)]
  })))
  try {
    const originalCounts=await counts(true)
    for (const table of tables) {
      await db.query(`CREATE TEMPORARY TABLE ${names.get(table)} LIKE ${table}`)
      await db.query(`INSERT INTO ${names.get(table)} SELECT * FROM ${table}`)
    }
    // Le test est reproductible après import réel : il prépare ses seules copies temporaires.
    const [owned]=await db.query(`SELECT id FROM ${names.get('verbes')} WHERE JSON_CONTAINS(particularites,JSON_QUOTE('import:fle-verbs-2026-11-17'))`)
    const ids=owned.map(row=>Number(row.id))
    if(ids.length){
      const list=ids.join(',')
      await db.query(`DELETE FROM ${names.get('verbesconjugues')} WHERE verbe_id IN (${list})`)
      await db.query(`DELETE FROM ${names.get('emplois_pronominaux')} WHERE verbe_id IN (${list})`)
      const [senses]=await db.query(`SELECT id FROM ${names.get('verbe_sens')} WHERE verbe_id IN (${list}) OR source='fle-verbs-2026-11-17'`)
      if(senses.length)await db.query(`DELETE FROM ${names.get('verbe_sens_categories')} WHERE sens_id IN (${senses.map(row=>Number(row.id)).join(',')})`)
      await db.query(`DELETE FROM ${names.get('verbe_sens')} WHERE verbe_id IN (${list}) OR source='fle-verbs-2026-11-17'`)
      await db.query(`DELETE FROM ${names.get('verbes')} WHERE id IN (${list})`)
    }
    await db.query(`DELETE FROM ${names.get('emplois_pronominaux')} WHERE source='fle-verbs-2026-11-17'`)
    const before=await counts(false)
    const audit=await importFleVerbBatch(connection)
    assert.equal(audit.mode,'audit');assert.equal(audit.missingVerbs.length,40);assert.equal(audit.missingUses.length,9)
    assert.equal(auditedWrites,0)
    failAtForm=4
    await assert.rejects(importFleVerbBatch(connection,{apply:true}),/Panne simulée/u)
    assert.deepEqual(await counts(false),before,'aucune insertion partielle après échec')
    failAtForm=0
    const applied=await importFleVerbBatch(connection,{apply:true})
    assert.equal(applied.insertedVerbs,40);assert.equal(applied.insertedForms,3840);assert.equal(applied.insertedUses,9)
    const after=await counts(false)
    assert.equal(after.verbes,before.verbes+40)
    assert.equal(after.verbesconjugues,before.verbesconjugues+3840)
    assert.equal((await importFleVerbBatch(connection,{apply:true})).mode,'already-applied')
    assert.deepEqual(await counts(false),after)
    assert.deepEqual(await counts(true),originalCounts,'les tables du site ne sont jamais modifiées par ce test')
  } finally {await db.end()}
})
