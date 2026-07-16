import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, describe, it } from 'node:test'
import mysql from 'mysql2/promise'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
const excludedDirect = new Set(['douter', 'grandir', 'partir', 'pouvoir'])
const additionalDirect = new Set(['cadrer', 'cesser', 'entrer', 'nager', 'naviguer', 'se brosser'])
const expectedIndirect = new Set([
  'assister', 'croire', 'discuter', 'douter', 'écrire', 'jouer', 'manquer', 'parler', 'penser',
  'plaire', 'réfléchir', 'répondre', 'réussir', 'rire', 'servir', 'songer', 'sourire',
  'souffrir', 'suffire', 'surseoir', 'tenir', 'se moquer', 'se préparer', 'se souvenir',
])
let database
let expectedDirect

before(async () => {
  if (!configured) return
  const report = JSON.parse(await readFile(new URL('../reports/academie-complements.json', import.meta.url), 'utf8'))
  expectedDirect = new Set(report.results
    .filter(item => !item.error && item.direct && !excludedDirect.has(item.infinitive))
    .map(item => item.infinitive))
  for (const infinitive of additionalDirect) expectedDirect.add(infinitive)
  database = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  })
})

after(async () => database?.end())

describe('couverture exhaustive des compléments verbaux', { skip: !configured }, () => {
  it('équipe tous les emplois directs attestés avec au moins dix COD', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, COUNT(DISTINCT c.id) AS total
      FROM verbes v
      INNER JOIN verbe_sens vs ON vs.verbe_id=v.id
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id AND cv.actif=1
        AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
        AND c.statut_validation='valide'
      WHERE v.est_archive=0 GROUP BY v.id, v.infinitif
    `)
    const totals = new Map(rows.map(row => [row.infinitif, Number(row.total)]))
    assert.equal(expectedDirect.size, 377)
    for (const infinitive of expectedDirect) {
      assert.ok((totals.get(infinitive) || 0) >= 10, `${infinitive} doit avoir au moins 10 COD`)
    }
  })

  it('équipe les emplois indirects retenus avec au moins dix COI', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, COUNT(DISTINCT c.id) AS total
      FROM verbes v
      INNER JOIN verbe_sens vs ON vs.verbe_id=v.id
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id AND cv.actif=1
        AND cv.statut_validation='valide' AND cv.fonction_objet='coi'
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
        AND c.statut_validation='valide'
      WHERE v.est_archive=0 GROUP BY v.id, v.infinitif
    `)
    const totals = new Map(rows.map(row => [row.infinitif, Number(row.total)]))
    for (const infinitive of expectedIndirect) {
      assert.ok((totals.get(infinitive) || 0) >= 10, `${infinitive} doit avoir au moins 10 COI`)
    }
  })

  it('fournit à abonner un COD antéposé dont l’accord est visible', async () => {
    const [rows] = await database.execute(`
      SELECT c.id
      FROM verbes v
      INNER JOIN verbe_sens vs ON vs.verbe_id=v.id
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
        AND cv.actif=1 AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id
        AND c.actif=1 AND c.statut_validation='valide'
      WHERE v.infinitif='abonner'
        AND c.texte_antepose IS NOT NULL
        AND c.genre IS NOT NULL
        AND c.nombre IS NOT NULL
        AND (LOWER(c.genre) IN ('féminin', 'feminin') OR LOWER(c.nombre)='pluriel')
      LIMIT 1
    `)
    assert.equal(rows.length, 1)
  })

  it('conserve la fonction et la préposition grammaticales sans ambiguïté', async () => {
    const [invalid] = await database.execute(`
      SELECT cv.id, cv.fonction_objet, cv.preposition, c.texte
      FROM constructions_verbales cv
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE cv.actif=1 AND cv.statut_validation='valide'
        AND (
          (cv.fonction_objet='cod' AND cv.preposition IS NOT NULL)
          OR (cv.fonction_objet='coi' AND cv.preposition NOT IN ('à', 'de'))
          OR (cv.fonction_objet='coi' AND cv.preposition='à'
              AND c.texte NOT LIKE 'à %' AND c.texte NOT LIKE 'au %' AND c.texte NOT LIKE 'aux %')
          OR (cv.fonction_objet='coi' AND cv.preposition='de'
              AND c.texte NOT LIKE 'de %' AND c.texte NOT LIKE 'du %' AND c.texte NOT LIKE 'des %'
              AND c.texte NOT LIKE 'd’%' AND c.texte NOT LIKE "d'%")
        )
    `)
    assert.deepEqual(invalid, [])
  })

  it('ne transforme jamais un COI en COD antéposé', async () => {
    const [invalid] = await database.execute(`
      SELECT c.id FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE cv.fonction_objet='coi' AND c.actif=1
        AND (c.texte_antepose IS NOT NULL OR c.genre IS NOT NULL OR c.nombre IS NOT NULL)
    `)
    assert.deepEqual(invalid, [])
  })

  it('rejette les fragments vides, tronqués et la ponctuation terminale', async () => {
    const [invalid] = await database.execute(`
      SELECT id, texte FROM complements_verbaux
      WHERE actif=1 AND (
        TRIM(texte)='' OR texte REGEXP '[.!?]$'
        OR TRIM(texte) REGEXP ' (ou|et|avec|sans|pour|de|du|des|à|au|aux|en|sur|sous|par|dans|vers|contre|chez)$'
      )
    `)
    assert.deepEqual(invalid, [])
  })

  it('ne propose aucun contenu sensible ou formulation déconseillée aux mineurs', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, c.texte, c.source
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE c.actif=1 AND cv.actif=1 AND v.est_archive=0
    `)
    const prohibited = /\b(?:mort|cadavre|sang|fusil|pistolet|poignard|massacre|assassinat|meurtre|torture|otage|rançon|pendaison|peloton|ennemis?|combat|guerre|bombe|explosion|alcool|bière|vin|champagne|cigarette|tabac|drogue|cannabis|cocaïne|héroïne|ivresse|ivre|injures?|insultes?|racisme|raciste|haine|fou furieux|dépression nerveuse|Dieu|Jésus-Christ|sacrement|baptême|messe|prière|croix)\b/iu
    assert.deepEqual(rows.filter(row => prohibited.test(row.texte)), [])
    assert.deepEqual(rows.filter(row => row.source === 'Catalogue exhaustif contrôlé 2026'), [])
  })

  it('forme correctement toutes les contractions des COI', async () => {
    const [rows] = await database.execute(`
      SELECT c.texte FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      WHERE c.actif=1 AND cv.actif=1 AND cv.fonction_objet='coi'
    `)
    const malformed = /(?:^|\s)(?:de une|de un|à le|à les)(?:\s|$)/iu
    assert.deepEqual(rows.filter(row => malformed.test(row.texte)), [])
  })
})
