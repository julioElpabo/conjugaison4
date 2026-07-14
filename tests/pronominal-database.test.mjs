import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import mysql from 'mysql2/promise'
import { generatePronominalRow } from '../server/services/pronominal-formatter.ts'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let database

before(async () => {
  if (!databaseConfigured) return
  database = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
})

after(async () => database?.end())

describe('migration non destructive des verbes pronominaux', { skip: !databaseConfigured }, () => {
  it('archive seulement les doublons qui possèdent un verbe de base', async () => {
    const [rows] = await database.execute(`
      SELECT COUNT(*) AS emplois,
             SUM(verbe_id IS NOT NULL) AS derivables,
             SUM(verbe_id IS NULL) AS autonomes,
             SUM(legacy_verbe_id IS NOT NULL) AS historiques
      FROM emplois_pronominaux WHERE actif = 1
    `)
    assert.deepEqual({
      emplois: Number(rows[0].emplois),
      derivables: Number(rows[0].derivables),
      autonomes: Number(rows[0].autonomes),
      historiques: Number(rows[0].historiques),
    }, { emplois: 68, derivables: 56, autonomes: 12, historiques: 65 })

    const [invalid] = await database.execute(`
      SELECT ep.id
      FROM emplois_pronominaux ep
      LEFT JOIN verbes base ON base.id = ep.verbe_id
      LEFT JOIN verbes legacy ON legacy.id = ep.legacy_verbe_id
      WHERE ep.actif = 1 AND ep.verbe_id IS NOT NULL
        AND (base.id IS NULL OR base.est_archive = 1
          OR (legacy.id IS NOT NULL AND legacy.est_archive <> 1))
    `)
    assert.equal(invalid.length, 0)
  })

  it('conserve les anciennes lignes et leurs conjugaisons pour les défis historiques', async () => {
    const [rows] = await database.execute(`
      SELECT COUNT(DISTINCT ep.legacy_verbe_id) AS verbs, COUNT(vc.id) AS forms
      FROM emplois_pronominaux ep
      INNER JOIN verbes legacy ON legacy.id = ep.legacy_verbe_id
      INNER JOIN verbesconjugues vc ON vc.verbe_id = legacy.id
      WHERE ep.legacy_verbe_id IS NOT NULL
    `)
    assert.equal(Number(rows[0].verbs), 65)
    assert.ok(Number(rows[0].forms) > 6000)
  })

  it('référence se jouer comme emploi validé de jouer', async () => {
    const [rows] = await database.execute(`
      SELECT ep.infinitif_pronominal, ep.regle_accord, ep.preposition,
             ep.statut_validation, base.infinitif
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id
      WHERE ep.infinitif_pronominal = 'se jouer'
    `)
    assert.deepEqual({ ...rows[0] }, {
      infinitif_pronominal: 'se jouer',
      regle_accord: 'avec_sujet',
      preposition: 'de',
      statut_validation: 'valide',
      infinitif: 'jouer',
    })
  })

  it('expose se fatiguer sans dupliquer la fiche de fatiguer', async () => {
    const [rows] = await database.execute(`
      SELECT ep.infinitif_pronominal, ep.regle_accord, ep.statut_validation,
             base.id AS base_id, base.infinitif, base.pronominalisable,
             (SELECT COUNT(*) FROM verbes duplicate WHERE duplicate.infinitif='se fatiguer') AS duplicates
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id
      WHERE ep.infinitif_pronominal = 'se fatiguer' AND ep.actif = 1
    `)
    assert.equal(rows.length, 1)
    assert.deepEqual({
      infinitif_pronominal: rows[0].infinitif_pronominal,
      regle_accord: rows[0].regle_accord,
      statut_validation: rows[0].statut_validation,
      infinitif: rows[0].infinitif,
      pronominalisable: Boolean(rows[0].pronominalisable),
      duplicates: Number(rows[0].duplicates),
    }, {
      infinitif_pronominal: 'se fatiguer',
      regle_accord: 'avec_sujet',
      statut_validation: 'valide',
      infinitif: 'fatiguer',
      pronominalisable: true,
      duplicates: 0,
    })
  })

  it('référence se placer comme emploi validé de placer', async () => {
    const [rows] = await database.execute(`
      SELECT ep.infinitif_pronominal, ep.fonction_pronom, ep.regle_accord,
             ep.statut_validation, base.infinitif, base.pronominalisable
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id
      WHERE ep.infinitif_pronominal='se placer' AND ep.actif=1
    `)
    assert.deepEqual({
      infinitif_pronominal: rows[0]?.infinitif_pronominal,
      fonction_pronom: rows[0]?.fonction_pronom,
      regle_accord: rows[0]?.regle_accord,
      statut_validation: rows[0]?.statut_validation,
      infinitif: rows[0]?.infinitif,
      pronominalisable: Boolean(rows[0]?.pronominalisable),
    }, {
      infinitif_pronominal: 'se placer',
      fonction_pronom: 'cod',
      regle_accord: 'avec_sujet',
      statut_validation: 'valide',
      infinitif: 'placer',
      pronominalisable: true,
    })
  })
})

describe('génération depuis les verbes de base', { skip: !databaseConfigured }, () => {
  it('produit une forme pour chaque ligne personnelle disponible', async () => {
    const [sources] = await database.execute(`
      SELECT vc.id, -ep.id AS verbe_id, vc.personne_id, vc.temp_id,
             vc.conjugaison1 AS base_conjugaison1,
             vc.conjugaison2 AS base_conjugaison2,
             vc.conjugaison3 AS base_conjugaison3,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
             ep.id AS pronominal_use_id, ep.infinitif_pronominal,
             ep.regle_accord, base.type_h_initial,
             base.infinitif, base.auxiliaire,
             base.\`participe_passé\` AS participe_passe,
             t.name AS temps_name, t.isTempsCompose AS is_compound,
             m.name AS mode_name
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id
      INNER JOIN verbesconjugues vc ON vc.verbe_id = base.id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE ep.actif = 1 AND ep.verbe_id IS NOT NULL
        AND m.name NOT IN ('participe', 'gérondif') AND vc.conjugaison1 <> ''
    `)
    const [auxiliaries] = await database.execute(`
      SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE v.infinitif = 'être' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
    `)

    assert.ok(sources.length > 5000)
    const missing = sources.filter(source => !generatePronominalRow(source, auxiliaries).conjugaison1)
    assert.deepEqual(missing.map(row => ({
      infinitif: row.infinitif_pronominal,
      mode: row.mode_name,
      temps: row.temps_name,
      personne: row.personne_id,
    })), [])
  })
})
