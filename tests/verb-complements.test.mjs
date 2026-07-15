import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import mysql from 'mysql2/promise'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
const source = 'Lot pédagogique initial validé'
const expandedSource = 'Catalogue pédagogique étendu'
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

describe('compléments d’objet validés', { skip: !databaseConfigured }, () => {
  it('fournit 10 compléments à chacun des 20 verbes pilotes', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, vs.transitivite, cv.fonction_objet, cv.patron,
             COUNT(c.id) AS total
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE cv.source=? AND cv.actif=1
      GROUP BY v.id, v.infinitif, vs.transitivite, cv.fonction_objet, cv.patron
      ORDER BY v.infinitif
    `, [source])

    assert.equal(rows.length, 20)
    assert.ok(rows.every(row => Number(row.total) >= 10 && Number(row.total) <= 30))
    assert.ok(rows.every(row => row.transitivite === 'transitif_direct'))
    assert.ok(rows.every(row => row.fonction_objet === 'cod' && row.patron === 'N0 V N1'))
  })

  it('ne contient ni doublon, ni fragment vide, ni ponctuation finale', async () => {
    const [invalid] = await database.execute(`
      SELECT c.id, c.texte
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE cv.source=? AND c.actif=1
        AND (TRIM(c.texte)='' OR c.texte REGEXP '[.!?]$')
    `, [source])
    assert.deepEqual(invalid, [])

    const [duplicates] = await database.execute(`
      SELECT construction_id, texte, COUNT(*) AS total
      FROM complements_verbaux
      WHERE actif=1 GROUP BY construction_id, texte HAVING COUNT(*) > 1
    `)
    assert.deepEqual(duplicates, [])
  })

  it('conserve le lot pédagogique alimentaire initial de manger', async () => {
    const [rows] = await database.execute(`
      SELECT c.texte
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE v.infinitif='manger' AND cv.code='cod-postpose' AND c.actif=1 AND c.source=?
      ORDER BY c.id
    `, [source])
    assert.deepEqual(rows.map(row => row.texte), [
      'une pomme', 'une poire', 'un abricot', 'une banane', 'du pain',
      'du riz', 'de la soupe', 'des légumes', 'un sandwich', 'un gâteau',
    ])
  })

  it('ne rattache aucune construction pilote à un verbe archivé', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE cv.source=? AND v.est_archive=1
    `, [source])
    assert.deepEqual(rows, [])
  })

  it('offre au moins un COD antéposable sûr pour chaque verbe pilote', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, COUNT(c.id) AS total
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE cv.source=? AND cv.actif=1
        AND c.texte_antepose IS NOT NULL AND c.genre IS NOT NULL AND c.nombre IS NOT NULL
      GROUP BY v.id, v.infinitif
      ORDER BY v.infinitif
    `, [source])
    assert.equal(rows.length, 20)
    assert.ok(rows.every(row => Number(row.total) >= 1))
  })
})

describe('catalogue étendu des COD et COI', { skip: !databaseConfigured }, () => {
  it('propose à la fois des COD et des COI pour écrire', async () => {
    const [rows] = await database.execute(`
      SELECT cv.fonction_objet, cv.preposition, c.texte
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE v.infinitif='écrire' AND cv.actif=1 AND cv.statut_validation='valide'
        AND c.statut_validation='valide'
    `)
    assert.ok(rows.some(row => row.fonction_objet === 'cod' && row.texte === 'une lettre'))
    assert.ok(rows.some(row => row.fonction_objet === 'coi' && row.preposition === 'à'
      && row.texte === 'à sa mère'))
  })

  it('conserve entre dix et trente compléments validés pour les 31 verbes du catalogue étendu', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, cv.fonction_objet, cv.preposition, COUNT(c.id) AS total
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE cv.source=? AND cv.actif=1 AND cv.statut_validation='valide'
      GROUP BY v.id, v.infinitif, cv.id, cv.fonction_objet, cv.preposition
      ORDER BY v.infinitif
    `, [expandedSource])

    assert.equal(rows.length, 31)
    assert.ok(rows.every(row => Number(row.total) >= 10 && Number(row.total) <= 30))
    assert.equal(rows.filter(row => row.fonction_objet === 'cod').length, 19)
    assert.equal(rows.filter(row => row.fonction_objet === 'coi').length, 12)
    assert.ok(rows.filter(row => row.fonction_objet === 'coi')
      .every(row => row.preposition === 'à' || row.preposition === 'de'))
  })

  it('identifie chaque complément comme COD ou COI par sa construction', async () => {
    const [invalid] = await database.execute(`
      SELECT c.id, c.texte, cv.fonction_objet
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE cv.source=? AND c.actif=1
        AND cv.fonction_objet NOT IN ('cod', 'coi')
    `, [expandedSource])
    assert.deepEqual(invalid, [])
  })

  it('ne rend jamais un COI antéposable comme un COD', async () => {
    const [invalid] = await database.execute(`
      SELECT c.id, c.texte
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE cv.source=? AND cv.fonction_objet='coi' AND c.actif=1
        AND (c.texte_antepose IS NOT NULL OR c.genre IS NOT NULL OR c.nombre IS NOT NULL)
    `, [expandedSource])
    assert.deepEqual(invalid, [])
  })

  it('conserve des COD antéposables pour tester les quatre accords', async () => {
    const [rows] = await database.execute(`
      SELECT c.genre, c.nombre, COUNT(*) AS total
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE cv.source=? AND cv.fonction_objet='cod' AND c.actif=1
        AND c.texte_antepose IS NOT NULL
      GROUP BY c.genre, c.nombre
    `, [expandedSource])
    const combinations = new Set(rows.map(row => `${row.genre}:${row.nombre}`))
    assert.deepEqual(combinations, new Set([
      'masculin:singulier', 'feminin:singulier', 'masculin:pluriel', 'feminin:pluriel',
    ]))
  })
})
