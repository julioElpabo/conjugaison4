import mysql from 'mysql2/promise'

// Source linguistique : Dictionnaire de l'Académie française, 9e édition.
// https://www.dictionnaire-academie.fr/conjuguer/A9A2823
const variants = [
  ['indicatif', 'présent', 'je', 'assieds', 'assois'],
  ['indicatif', 'présent', 'tu', 'assieds', 'assois'],
  ['indicatif', 'présent', 'il', 'assied', 'assoit'],
  ['indicatif', 'présent', 'nous', 'asseyons', 'assoyons'],
  ['indicatif', 'présent', 'vous', 'asseyez', 'assoyez'],
  ['indicatif', 'présent', 'ils', 'asseyent', 'assoient'],

  ['indicatif', 'imparfait', 'je', 'asseyais', 'assoyais'],
  ['indicatif', 'imparfait', 'tu', 'asseyais', 'assoyais'],
  ['indicatif', 'imparfait', 'il', 'asseyait', 'assoyait'],
  ['indicatif', 'imparfait', 'nous', 'asseyions', 'assoyions'],
  ['indicatif', 'imparfait', 'vous', 'asseyiez', 'assoyiez'],
  ['indicatif', 'imparfait', 'ils', 'asseyaient', 'assoyaient'],

  ['indicatif', 'futur', 'je', 'assiérai', 'assoirai'],
  ['indicatif', 'futur', 'tu', 'assiéras', 'assoiras'],
  ['indicatif', 'futur', 'il', 'assiéra', 'assoira'],
  ['indicatif', 'futur', 'nous', 'assiérons', 'assoirons'],
  ['indicatif', 'futur', 'vous', 'assiérez', 'assoirez'],
  ['indicatif', 'futur', 'ils', 'assiéront', 'assoiront'],

  ['subjonctif', 'présent', 'je', 'asseye', 'assoie'],
  ['subjonctif', 'présent', 'tu', 'asseyes', 'assoies'],
  ['subjonctif', 'présent', 'il', 'asseye', 'assoie'],
  ['subjonctif', 'présent', 'nous', 'asseyions', 'assoyions'],
  ['subjonctif', 'présent', 'vous', 'asseyiez', 'assoyiez'],
  ['subjonctif', 'présent', 'ils', 'asseyent', 'assoient'],

  ['conditionnel', 'présent', 'je', 'assiérais', 'assoirais'],
  ['conditionnel', 'présent', 'tu', 'assiérais', 'assoirais'],
  ['conditionnel', 'présent', 'il', 'assiérait', 'assoirait'],
  ['conditionnel', 'présent', 'nous', 'assiérions', 'assoirions'],
  ['conditionnel', 'présent', 'vous', 'assiériez', 'assoiriez'],
  ['conditionnel', 'présent', 'ils', 'assiéraient', 'assoiraient'],

  ['impératif', 'présent', 'tu', 'assieds', 'assois'],
  ['impératif', 'présent', 'nous', 'asseyons', 'assoyons'],
  ['impératif', 'présent', 'vous', 'asseyez', 'assoyez']
]

const apply = process.argv.includes('--apply')
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
})

try {
  await connection.beginTransaction()
  const [verbs] = await connection.execute(
    'SELECT id, infinitif FROM verbes WHERE LOWER(infinitif) = ? ORDER BY id',
    ['asseoir']
  )
  if (verbs.length !== 1) {
    throw new Error(`Un seul verbe « asseoir » était attendu, ${verbs.length} trouvé(s).`)
  }

  const verbId = Number(verbs[0].id)
  const report = []
  for (const [mode, tense, pronoun, primary, alternative] of variants) {
    const [rows] = await connection.execute(`
      SELECT vc.id, vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
      FROM verbesconjugues vc
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      INNER JOIN personnes p ON p.id = vc.personne_id
      WHERE vc.verbe_id = ?
        AND LOWER(m.name) = ?
        AND LOWER(t.name) = ?
        AND LOWER(p.pronom) = ?
      FOR UPDATE
    `, [verbId, mode, tense, pronoun])

    if (rows.length !== 1) {
      throw new Error(`${mode} · ${tense} · ${pronoun} : une ligne était attendue, ${rows.length} trouvée(s).`)
    }

    const row = rows[0]
    const currentPrimary = String(row.conjugaison1 || '').trim()
    const currentAlternative = String(row.conjugaison2 || '').trim()
    const thirdForm = String(row.conjugaison3 || '').trim()
    if (currentPrimary && currentPrimary !== primary) {
      throw new Error(`${mode} · ${tense} · ${pronoun} : forme principale inattendue « ${currentPrimary} » (attendu « ${primary} »).`)
    }
    if (currentAlternative && currentAlternative !== alternative) {
      throw new Error(`${mode} · ${tense} · ${pronoun} : variante existante inattendue « ${currentAlternative} ».`)
    }
    if (thirdForm) {
      throw new Error(`${mode} · ${tense} · ${pronoun} : la troisième forme n'est pas vide (« ${thirdForm} »).`)
    }

    await connection.execute(
      'UPDATE verbesconjugues SET conjugaison1 = ?, conjugaison2 = ? WHERE id = ?',
      [primary, alternative, row.id]
    )
    report.push({ mode, tense, pronoun, primary, alternative })
  }

  if (apply) {
    await connection.commit()
  } else {
    await connection.rollback()
  }

  console.log(`${apply ? 'Migration appliquée' : 'Simulation réussie'} : ${report.length} formes contrôlées.`)
  for (const item of report) {
    console.log(`${item.mode} · ${item.tense} · ${item.pronoun} : ${item.primary} / ${item.alternative}`)
  }
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}
