import mysql from 'mysql2/promise'

// Sources linguistiques officielles :
// - https://www.dictionnaire-academie.fr/conjuguer/A9N0027 (naître)
// - https://www.dictionnaire-academie.fr/conjuguer/A9R0949 (reconnaître)
// - https://www.dictionnaire-academie.fr/conjuguer/A9R3066 (rougir)

const apply = process.argv.includes('--apply')

const databaseConfig = {
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
  user: process.env.DB_USER || process.env.NUXT_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
}

if (!databaseConfig.host || !databaseConfig.database || !databaseConfig.user) {
  throw new Error('Configuration MySQL absente (DB_* ou NUXT_DB_*).')
}

const connection = await mysql.createConnection(databaseConfig)

function json(value) {
  return value === null || value === undefined ? null : JSON.stringify(value)
}

function recognizeForm(value) {
  return String(value || '').trim().replace(/\b(conn|conna)/gu, 're$1')
}

function rougirForm(value) {
  return String(value || '').trim()
    .replace(/finiss/gu, 'rougiss')
    .replace(/finir/gu, 'rougir')
    .replace(/finî/gu, 'rougî')
    .replace(/fini/gu, 'rougi')
}

async function verbByInfinitive(infinitive) {
  const [rows] = await connection.execute('SELECT * FROM verbes WHERE infinitif = ? ORDER BY id', [infinitive])
  if (rows.length > 1) throw new Error(`Plusieurs verbes « ${infinitive} » existent.`)
  return rows[0] || null
}

async function cloneVerb({ modelInfinitive, infinitive, presentParticiple, pastParticiple, transform, overrides = {} }) {
  const model = await verbByInfinitive(modelInfinitive)
  if (!model) throw new Error(`Verbe modèle « ${modelInfinitive} » absent.`)

  let target = await verbByInfinitive(infinitive)
  if (!target) {
    const metadata = {
      groupe_conjugaison: model.groupe_conjugaison,
      famille_conjugaison_id: model.famille_conjugaison_id,
      terminaison_infinitif: model.terminaison_infinitif,
      type_pronominal: 'aucun',
      est_impersonnel: 0,
      est_defectif: 0,
      personnes_disponibles: model.personnes_disponibles,
      type_h_initial: model.type_h_initial,
      niveau_difficulte: model.niveau_difficulte,
      niveau_cecrl: model.niveau_cecrl,
      rang_frequence: null,
      registre_principal: 'courant',
      forme_canonique: infinitive,
      statut_validation: 'valide',
      particularites: [],
      niveaux_scolaires: model.niveaux_scolaires,
      parcours_cif: [],
      pronominalisable: 0,
      est_archive: 0,
      ...overrides,
    }
    const [result] = await connection.execute(`
      INSERT INTO verbes (
        infinitif, \`participe_présent\`, \`participe_passé\`, auxiliaire,
        groupe_conjugaison, famille_conjugaison_id, terminaison_infinitif,
        type_pronominal, est_impersonnel, est_defectif, personnes_disponibles,
        type_h_initial, niveau_difficulte, niveau_cecrl, rang_frequence,
        registre_principal, forme_canonique, statut_validation, particularites,
        niveaux_scolaires, parcours_cif, pronominalisable, est_archive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      infinitive, presentParticiple, pastParticiple, 'avoir',
      metadata.groupe_conjugaison, metadata.famille_conjugaison_id, metadata.terminaison_infinitif,
      metadata.type_pronominal, metadata.est_impersonnel, metadata.est_defectif, json(metadata.personnes_disponibles),
      metadata.type_h_initial, metadata.niveau_difficulte, metadata.niveau_cecrl, metadata.rang_frequence,
      metadata.registre_principal, metadata.forme_canonique, metadata.statut_validation, json(metadata.particularites),
      json(metadata.niveaux_scolaires), json(metadata.parcours_cif), metadata.pronominalisable, metadata.est_archive,
    ])
    target = { id: Number(result.insertId), infinitif: infinitive }
  } else {
    if (target['participe_présent'] !== presentParticiple
        || target['participe_passé'] !== pastParticiple
        || target.auxiliaire !== 'avoir') {
      throw new Error(`Métadonnées inattendues pour « ${infinitive} ».`)
    }
  }

  const [modelForms] = await connection.execute(`
    SELECT personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3
    FROM verbesconjugues WHERE verbe_id = ? ORDER BY temp_id, personne_id
  `, [model.id])
  if (!modelForms.length) throw new Error(`Aucune conjugaison pour le modèle « ${modelInfinitive} ».`)

  const [targetForms] = await connection.execute(`
    SELECT personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3
    FROM verbesconjugues WHERE verbe_id = ? ORDER BY temp_id, personne_id
  `, [target.id])
  if (!targetForms.length) {
    for (const form of modelForms) {
      await connection.execute(`
        INSERT INTO verbesconjugues
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        target.id,
        infinitive,
        form.personne_id,
        form.temp_id,
        transform(form.conjugaison1),
        transform(form.conjugaison2),
        transform(form.conjugaison3),
      ])
    }
  } else if (targetForms.length !== modelForms.length) {
    throw new Error(`« ${infinitive} » possède ${targetForms.length} formes au lieu de ${modelForms.length}.`)
  } else {
    const targetByKey = new Map(targetForms.map(form => [
      `${form.temp_id}:${form.personne_id}`,
      form,
    ]))
    for (const modelForm of modelForms) {
      const targetForm = targetByKey.get(`${modelForm.temp_id}:${modelForm.personne_id}`)
      const expected = transform(modelForm.conjugaison1)
      if (!targetForm || targetForm.conjugaison1 !== expected) {
        throw new Error(`Forme inattendue pour « ${infinitive} » (temps ${modelForm.temp_id}, personne ${modelForm.personne_id}) : « ${targetForm?.conjugaison1 || 'absente'} » au lieu de « ${expected} ».`)
      }
    }
  }

  return Number(target.id)
}

async function addAlternative(verbId, primaryPattern, transform) {
  const [rows] = await connection.execute(`
    SELECT id, conjugaison1, conjugaison2, conjugaison3
    FROM verbesconjugues
    WHERE verbe_id = ? AND conjugaison1 LIKE ?
    ORDER BY id
    FOR UPDATE
  `, [verbId, `%${primaryPattern}%`])

  for (const row of rows) {
    const primary = String(row.conjugaison1 || '').trim()
    const alternative = transform(primary)
    if (!alternative || alternative === primary) continue
    const values = [primary, row.conjugaison2 || '', row.conjugaison3 || ''].map(value => String(value).trim())
    if (values.includes(alternative)) continue
    const emptyIndex = values.findIndex((value, index) => index > 0 && !value)
    if (emptyIndex < 0) throw new Error(`Aucun emplacement libre pour la variante « ${alternative} » (ligne ${row.id}).`)
    values[emptyIndex] = alternative
    await connection.execute(
      'UPDATE verbesconjugues SET conjugaison1=?, conjugaison2=?, conjugaison3=? WHERE id=?',
      [...values, row.id],
    )
  }
  return rows.length
}

async function ensureSense(verbId, number, attributes, categorySlug) {
  const [rows] = await connection.execute(
    'SELECT id FROM verbe_sens WHERE verbe_id=? AND numero_sens=? ORDER BY id',
    [verbId, number],
  )
  let senseId = Number(rows[0]?.id || 0)
  if (!senseId) {
    const [result] = await connection.execute(`
      INSERT INTO verbe_sens
        (verbe_id, numero_sens, intitule, definition, construction, transitivite,
         preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, NULL, 'avoir', 'courant', 0, ?, 'academie-9e', ?)
    `, [
      verbId, number, attributes.title, attributes.definition, attributes.construction,
      attributes.transitivity, number === 1 ? 1 : 0, number,
    ])
    senseId = Number(result.insertId)
  }
  await connection.execute(`
    INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id)
    SELECT ?, id FROM categories_semantiques WHERE slug=?
  `, [senseId, categorySlug])
}

try {
  await connection.beginTransaction()

  const naitre = await verbByInfinitive('naître')
  if (!naitre) throw new Error('Le verbe « naître » est absent.')
  const naitreVariants = await addAlternative(Number(naitre.id), 'naît', value => value.replace(/naît/gu, 'nait'))

  const recognizeId = await cloneVerb({
    modelInfinitive: 'connaître',
    infinitive: 'reconnaître',
    presentParticiple: 'reconnaissant',
    pastParticiple: 'reconnu',
    transform: recognizeForm,
    overrides: { niveau_cecrl: 'B1', niveaux_scolaires: ['9H'] },
  })
  await connection.execute(
    'UPDATE verbes SET niveau_cecrl=?, niveaux_scolaires=? WHERE id=?',
    ['B1', json(['9H']), recognizeId],
  )
  const recognizeVariants = await addAlternative(recognizeId, 'reconnaît', value => value.replace(/reconnaît/gu, 'reconnait'))
  await ensureSense(recognizeId, 1, {
    title: 'Identifier une personne ou une chose',
    definition: 'Identifier ce que l’on a déjà connu ou constater une réalité.',
    construction: 'reconnaître quelque chose ou quelqu’un',
    transitivity: 'transitif_direct',
  }, 'cognition')

  const rougirId = await cloneVerb({
    modelInfinitive: 'finir',
    infinitive: 'rougir',
    presentParticiple: 'rougissant',
    pastParticiple: 'rougi',
    transform: rougirForm,
    overrides: { niveau_cecrl: 'A2', niveaux_scolaires: [] },
  })
  await connection.execute(
    'UPDATE verbes SET niveau_cecrl=?, niveaux_scolaires=? WHERE id=?',
    ['A2', json([]), rougirId],
  )
  await ensureSense(rougirId, 1, {
    title: 'Devenir rouge',
    definition: 'Devenir rouge sous l’effet d’une émotion ou d’une cause physique.',
    construction: 'rougir',
    transitivity: 'intransitif',
  }, 'emotion')
  await ensureSense(rougirId, 2, {
    title: 'Rendre rouge',
    definition: 'Donner une couleur rouge à quelque chose.',
    construction: 'rougir quelque chose',
    transitivity: 'transitif_direct',
  }, 'corps')

  if (apply) await connection.commit()
  else await connection.rollback()

  console.log(JSON.stringify({
    mode: apply ? 'appliqué' : 'simulation',
    naitreVariants,
    recognize: { id: recognizeId, variants: recognizeVariants },
    rougir: { id: rougirId },
  }, null, 2))
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}
