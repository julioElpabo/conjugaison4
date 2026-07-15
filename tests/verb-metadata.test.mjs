import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import mysql from 'mysql2/promise'
import { resolveChallengePresets } from '../shared/data/challenge-presets.ts'

let database
before(async () => {
  database = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
})
after(async () => database?.end())

const parseArray = (value) => Array.isArray(value) ? value : JSON.parse(value || '[]')

async function classifiedVerbs() {
  const [rows] = await database.execute(`
    SELECT v.*, f.slug AS famille_conjugaison,
      GROUP_CONCAT(DISTINCT cs.slug ORDER BY cs.sort_order SEPARATOR ',') AS categories
    FROM verbes v
    LEFT JOIN familles_conjugaison f ON f.id=v.famille_conjugaison_id
    LEFT JOIN verbe_sens vs ON vs.verbe_id=v.id
    LEFT JOIN verbe_sens_categories vsc ON vsc.sens_id=vs.id
    LEFT JOIN categories_semantiques cs ON cs.id=vsc.categorie_id
    GROUP BY v.id, f.slug ORDER BY v.id
  `)
  const [complements] = await database.execute(`
    SELECT vs.verbe_id, cv.fonction_objet, c.texte, c.texte_antepose
    FROM verbe_sens vs
    INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
    INNER JOIN complements_verbaux c ON c.construction_id=cv.id
    WHERE cv.actif=1 AND cv.statut_validation='valide'
      AND c.actif=1 AND c.statut_validation='valide'
    ORDER BY vs.verbe_id,
      (cv.fonction_objet='cod' AND c.texte_antepose IS NOT NULL) DESC,
      cv.id, c.id
  `)
  const complementByVerb = new Map()
  for (const complement of complements) {
    if (!complementByVerb.has(Number(complement.verbe_id))) {
      complementByVerb.set(Number(complement.verbe_id), {
        functionObject: complement.fonction_objet,
        after: complement.texte,
        before: complement.texte_antepose,
      })
    }
  }
  return rows.map(row => ({
    id: Number(row.id), infinitif: row.infinitif, participePresent: row['participe_présent'], participePasse: row['participe_passé'], auxiliaire: row.auxiliaire,
    groupeConjugaison: Number(row.groupe_conjugaison), familleConjugaison: row.famille_conjugaison, terminaison: row.terminaison_infinitif,
    typePronominal: row.type_pronominal, estImpersonnel: Boolean(row.est_impersonnel), estDefectif: Boolean(row.est_defectif),
    personnesDisponibles: parseArray(row.personnes_disponibles), typeHInitial: row.type_h_initial,
    niveauDifficulte: Number(row.niveau_difficulte), niveauCecrl: row.niveau_cecrl, rangFrequence: row.rang_frequence,
    registrePrincipal: row.registre_principal, formeCanonique: row.forme_canonique, statutValidation: row.statut_validation,
    particularites: parseArray(row.particularites), niveauxScolaires: parseArray(row.niveaux_scolaires), parcoursCif: parseArray(row.parcours_cif),
    categoriesSemantiques: row.categories ? row.categories.split(',') : [],
    complementExample: complementByVerb.get(Number(row.id)) ?? null,
  }))
}

describe('métadonnées grammaticales des verbes', () => {
  it('classe chacun des 488 verbes sans dépendre de son identifiant', async () => {
    const verbs = await classifiedVerbs()
    assert.equal(verbs.length, 488)
    assert.ok(verbs.every(verb => [1, 2, 3].includes(verb.groupeConjugaison)))
    assert.ok(verbs.every(verb => verb.familleConjugaison && verb.terminaison && verb.formeCanonique))
    assert.ok(verbs.every(verb => verb.categoriesSemantiques.length > 0))
  })

  it('reconnaît les cas grammaticaux structurants', async () => {
    const verbs = await classifiedVerbs()
    const byName = new Map(verbs.map(verb => [verb.infinitif, verb]))
    assert.equal(byName.get('aimer').groupeConjugaison, 1)
    assert.equal(byName.get('finir').groupeConjugaison, 2)
    assert.equal(byName.get('aller').groupeConjugaison, 3)
    assert.equal(byName.get("s'asseoir").typePronominal, 'occasionnel')
    assert.equal(byName.get('falloir').estImpersonnel, true)
    assert.equal(byName.get('haïr').typeHInitial, 'aspire')
  })

  it('résout tous les défis prêts à l’emploi à partir des critères', async () => {
    const presets = resolveChallengePresets(await classifiedVerbs())
    for (const preset of presets) {
      assert.ok(preset.verbIds.length > 0, `${preset.id}: aucun verbe ne correspond aux critères`)
      assert.equal(new Set(preset.verbIds).size, preset.verbIds.length, `${preset.id}: doublons`)
    }
    assert.equal(presets.find(preset => preset.id === '5P').verbIds.length, 10)
    assert.ok(presets.find(preset => preset.id === 'groupe1').verbIds.length > 300)
    assert.ok(presets.find(preset => preset.id === 'cod-avant-passe-compose').verbIds.length >= 290)
  })
})

describe('acceptions et auxiliaires dépendant du sens', () => {
  it('distingue les sens de monter, sortir, passer, voler et penser', async () => {
    const [rows] = await database.execute(`
      SELECT v.infinitif, COUNT(*) AS senses, COUNT(DISTINCT vs.auxiliaire) AS auxiliaries
      FROM verbe_sens vs INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE v.infinitif IN ('monter','sortir','passer','voler','penser')
      GROUP BY v.id, v.infinitif
    `)
    assert.equal(rows.length, 5)
    assert.ok(rows.every(row => Number(row.senses) >= 2))
    assert.equal(Number(rows.find(row => row.infinitif === 'monter').auxiliaries), 2)
    assert.equal(Number(rows.find(row => row.infinitif === 'sortir').auxiliaries), 2)
  })
})
