import mysql from 'mysql2/promise'

const apply = process.argv.includes('--apply')
const database = await mysql.createConnection({
  host: process.env.NUXT_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.NUXT_DB_PORT || process.env.DB_PORT || 3306),
  database: process.env.NUXT_DB_NAME || process.env.DB_NAME,
  user: process.env.NUXT_DB_USER || process.env.DB_USER,
  password: process.env.NUXT_DB_PASSWORD || process.env.DB_PASSWORD,
})

const report = {
  mode: apply ? 'appliqué' : 'simulation',
  obsoleteTenseRows: 0,
  corruptedVerbRows: 0,
  variantsAdded: 0,
  presentFormsAdded: 0,
  presentFormsFilled: 0,
  produireFormsAdded: 0,
}

function forms(row) {
  return [row.conjugaison1, row.conjugaison2, row.conjugaison3]
    .map(value => String(value || '').trim())
}

try {
  // Les anciens IDs 12 et 13 désignaient les deux temps du subjonctif qui
  // portent maintenant les IDs 16 et 17. Leurs seules formes non vides sont
  // déjà présentes, à l'identique, dans les lignes actuelles.
  const [obsoleteTenseRows] = await database.query(`
    SELECT vc.*
    FROM verbesconjugues vc
    LEFT JOIN temps t ON t.id = vc.temp_id
    WHERE t.id IS NULL
    ORDER BY vc.id
  `)
  const obsoleteTenseIds = new Set(obsoleteTenseRows.map(row => Number(row.temp_id)))
  if ([...obsoleteTenseIds].some(id => ![12, 13].includes(id))) {
    throw new Error(`Temps orphelins inattendus : ${[...obsoleteTenseIds].join(', ')}`)
  }
  for (const row of obsoleteTenseRows.filter(row => forms(row).some(Boolean))) {
    const currentTenseId = Number(row.temp_id) === 12 ? 16 : 17
    const [currentRows] = await database.execute(`
      SELECT conjugaison1, conjugaison2, conjugaison3
      FROM verbesconjugues
      WHERE verbe_id = ? AND temp_id = ? AND personne_id = ?
    `, [row.verbe_id, currentTenseId, row.personne_id])
    if (currentRows.length !== 1 || forms(currentRows[0]).join('\u0000') !== forms(row).join('\u0000')) {
      throw new Error(`La forme de l'ancien temps ${row.temp_id}, ligne ${row.id}, n'est pas sauvegardée dans le temps ${currentTenseId}.`)
    }
  }
  report.obsoleteTenseRows = obsoleteTenseRows.length

  // Deux imports mojibake de « être » utilisent verbe_id = 0. Chaque case a
  // déjà une ligne correspondante liée au véritable verbe « être ».
  const [corruptedVerbRows] = await database.query(`
    SELECT vc.*
    FROM verbesconjugues vc
    LEFT JOIN verbes v ON v.id = vc.verbe_id
    WHERE v.id IS NULL
    ORDER BY vc.id
  `)
  const [etreRows] = await database.execute('SELECT id FROM verbes WHERE infinitif = ?', ['être'])
  if (etreRows.length !== 1) throw new Error(`Un seul verbe « être » était attendu, ${etreRows.length} trouvé(s).`)
  for (const row of corruptedVerbRows) {
    if (Number(row.verbe_id) !== 0 || !['Ãªtre', 'ï¿½tre'].includes(row.verbe_infinitif)) {
      throw new Error(`Verbe orphelin inattendu à la ligne ${row.id} : ${row.verbe_infinitif} (#${row.verbe_id}).`)
    }
    const [replacement] = await database.execute(`
      SELECT id FROM verbesconjugues
      WHERE verbe_id = ? AND temp_id = ? AND personne_id = ?
    `, [etreRows[0].id, row.temp_id, row.personne_id])
    if (replacement.length !== 1) {
      throw new Error(`Aucune ligne « être » unique ne remplace la ligne orpheline ${row.id}.`)
    }
  }
  report.corruptedVerbRows = corruptedVerbRows.length

  const [powerRows] = await database.execute(`
    SELECT vc.id, vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
    FROM verbesconjugues vc
    INNER JOIN verbes v ON v.id = vc.verbe_id
    INNER JOIN personnes p ON p.id = vc.personne_id
    INNER JOIN temps t ON t.id = vc.temp_id
    INNER JOIN modes m ON m.id = t.mode_id
    WHERE v.infinitif = 'pouvoir' AND p.pronom = 'je'
      AND t.name = 'présent' AND m.name = 'indicatif'
  `)
  if (powerRows.length !== 1) throw new Error(`Une ligne « je peux » était attendue, ${powerRows.length} trouvée(s).`)
  const powerForms = forms(powerRows[0])
  if (!powerForms.includes('peux')) throw new Error(`La forme principale de pouvoir est inattendue : ${powerForms.join(' | ')}.`)
  const powerEmptyIndex = powerForms.findIndex(value => !value)
  if (!powerForms.includes('puis')) {
    if (powerEmptyIndex < 1) throw new Error('Aucun emplacement libre pour ajouter la variante « puis ».')
    report.variantsAdded = 1
  }

  const expectedPresent = new Map([
    ['je', 'affaiblis'],
    ['tu', 'affaiblis'],
    ['il', 'affaiblit'],
  ])
  const [affaiblirContext] = await database.execute(`
    SELECT v.id AS verbId, t.id AS tenseId
    FROM verbes v
    CROSS JOIN temps t
    INNER JOIN modes m ON m.id = t.mode_id
    WHERE v.infinitif = 'affaiblir' AND t.name = 'présent' AND m.name = 'indicatif'
  `)
  if (affaiblirContext.length !== 1) throw new Error('Le contexte du présent de « affaiblir » est introuvable ou ambigu.')
  const affaiblirChanges = []
  for (const [pronoun, expected] of expectedPresent) {
    const [people] = await database.execute('SELECT id FROM personnes WHERE pronom = ?', [pronoun])
    if (people.length !== 1) throw new Error(`Pronom « ${pronoun} » introuvable ou ambigu.`)
    const [rows] = await database.execute(`
      SELECT id, conjugaison1, conjugaison2, conjugaison3
      FROM verbesconjugues
      WHERE verbe_id = ? AND temp_id = ? AND personne_id = ?
    `, [affaiblirContext[0].verbId, affaiblirContext[0].tenseId, people[0].id])
    if (rows.length > 1) throw new Error(`Plusieurs lignes existent pour « ${pronoun} affaiblir » au présent.`)
    if (rows.length === 0) {
      affaiblirChanges.push({ kind: 'insert', personId: people[0].id, expected })
      report.presentFormsAdded += 1
    } else if (!forms(rows[0])[0]) {
      affaiblirChanges.push({ kind: 'update', id: rows[0].id, expected })
      report.presentFormsFilled += 1
    } else if (forms(rows[0])[0] !== expected) {
      throw new Error(`Forme existante inattendue pour « ${pronoun} affaiblir » : ${forms(rows[0])[0]}.`)
    }
  }

  // « produire » suit exactement le modèle de « conduire ». Une ancienne
  // création de sa fiche a enregistré ses métadonnées sans ses conjugaisons.
  const [uireVerbs] = await database.execute(`
    SELECT id, infinitif
    FROM verbes
    WHERE infinitif IN ('conduire', 'produire')
    ORDER BY infinitif
  `)
  const conduire = uireVerbs.find(row => row.infinitif === 'conduire')
  const produire = uireVerbs.find(row => row.infinitif === 'produire')
  if (!conduire || !produire) {
    throw new Error('Les verbes modèles « conduire » et « produire » doivent tous deux exister.')
  }
  const [conduireForms] = await database.execute(`
    SELECT personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3
    FROM verbesconjugues
    WHERE verbe_id = ?
    ORDER BY temp_id, personne_id
  `, [conduire.id])
  const [produireForms] = await database.execute(`
    SELECT personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3
    FROM verbesconjugues
    WHERE verbe_id = ?
    ORDER BY temp_id, personne_id
  `, [produire.id])
  if (!conduireForms.length) throw new Error('Le verbe modèle « conduire » ne possède aucune conjugaison.')

  const produireForm = value => String(value || '').replaceAll('condu', 'produ')
  const expectedProduireForms = conduireForms.map(row => ({
    personne_id: Number(row.personne_id),
    temp_id: Number(row.temp_id),
    conjugaison1: produireForm(row.conjugaison1),
    conjugaison2: produireForm(row.conjugaison2),
    conjugaison3: produireForm(row.conjugaison3),
  }))
  if (produireForms.length) {
    const actualByKey = new Map(produireForms.map(row => [
      `${row.temp_id}:${row.personne_id}`,
      forms(row),
    ]))
    const invalid = expectedProduireForms.find(row => (
      forms(row).join('\u0000') !== (actualByKey.get(`${row.temp_id}:${row.personne_id}`) || []).join('\u0000')
    ))
    if (produireForms.length !== expectedProduireForms.length || invalid) {
      throw new Error('Les conjugaisons existantes de « produire » sont incomplètes ou ne correspondent pas au modèle « conduire ».')
    }
  } else {
    report.produireFormsAdded = expectedProduireForms.length
  }

  if (apply) {
    if (obsoleteTenseRows.length) {
      await database.query('DELETE vc FROM verbesconjugues vc LEFT JOIN temps t ON t.id = vc.temp_id WHERE t.id IS NULL')
    }
    if (corruptedVerbRows.length) {
      await database.query('DELETE vc FROM verbesconjugues vc LEFT JOIN verbes v ON v.id = vc.verbe_id WHERE v.id IS NULL')
    }
    if (!powerForms.includes('puis')) {
      const column = `conjugaison${powerEmptyIndex + 1}`
      await database.query(`UPDATE verbesconjugues SET ${column} = 'puis' WHERE id = ?`, [powerRows[0].id])
    }
    for (const change of affaiblirChanges) {
      if (change.kind === 'insert') {
        await database.execute(`
          INSERT INTO verbesconjugues
            (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
          VALUES (?, 'affaiblir', ?, ?, ?, '', '')
        `, [affaiblirContext[0].verbId, change.personId, affaiblirContext[0].tenseId, change.expected])
      } else {
        await database.execute('UPDATE verbesconjugues SET conjugaison1 = ? WHERE id = ?', [change.expected, change.id])
      }
    }
    for (const form of produireForms.length ? [] : expectedProduireForms) {
      await database.execute(`
        INSERT INTO verbesconjugues
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, 'produire', ?, ?, ?, ?, ?)
      `, [
        produire.id,
        form.personne_id,
        form.temp_id,
        form.conjugaison1,
        form.conjugaison2,
        form.conjugaison3,
      ])
    }
  }

  console.log(JSON.stringify(report, null, 2))
} finally {
  await database.end()
}
