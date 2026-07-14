import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const [columns] = await database.query('SHOW COLUMNS FROM verbes')
const names = new Set(columns.map(column => column.Field))
if (!names.has('pronominalisable')) {
  await database.query('ALTER TABLE verbes ADD COLUMN pronominalisable TINYINT(1) NOT NULL DEFAULT 0')
}
if (!names.has('est_archive')) {
  await database.query('ALTER TABLE verbes ADD COLUMN est_archive TINYINT(1) NOT NULL DEFAULT 0')
}

await database.query(`
  CREATE TABLE IF NOT EXISTS emplois_pronominaux (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    verbe_id INT NULL,
    legacy_verbe_id INT NULL,
    infinitif_pronominal VARCHAR(255) NOT NULL,
    type_emploi VARCHAR(24) NOT NULL DEFAULT 'reflechi',
    fonction_pronom VARCHAR(24) NOT NULL DEFAULT 'variable',
    regle_accord VARCHAR(32) NOT NULL DEFAULT 'selon_construction',
    preposition VARCHAR(32) NULL,
    personnes_autorisees JSON NULL,
    source VARCHAR(80) NULL,
    source_url VARCHAR(500) NULL,
    statut_validation VARCHAR(24) NOT NULL DEFAULT 'a_verifier',
    actif TINYINT(1) NOT NULL DEFAULT 1,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emploi_infinitif (infinitif_pronominal),
    UNIQUE KEY uq_emploi_legacy (legacy_verbe_id),
    KEY idx_emploi_base (verbe_id),
    KEY idx_emploi_actif (actif)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

const normalize = value => value.trim().toLocaleLowerCase('fr').normalize('NFC')
const baseOf = value => normalize(value).replace(/^se\s+/u, '').replace(/^s['’]/u, '')
const elidedInfinitive = value => {
  const normalized = normalize(value)
  const first = normalized.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0)
  return 'aeiouy'.includes(first) ? `s'${normalized}` : `se ${normalized}`
}

// Les constructions dont la syntaxe est stable peuvent recevoir une règle
// plus précise. Les autres restent volontairement « selon_construction ».
const lexicalRules = {
  "s'apercevoir": ['subjectif', 'sans_fonction', 'avec_sujet', 'de'],
  "s'écrier": ['essentiel', 'sans_fonction', 'avec_sujet', null],
  "s'émouvoir": ['subjectif', 'sans_fonction', 'avec_sujet', null],
  "s'endormir": ['subjectif', 'sans_fonction', 'avec_sujet', null],
  "s'imaginer": ['subjectif', 'variable', 'selon_construction', null],
  'se demander': ['subjectif', 'coi', 'invariable', null],
  'se moquer': ['idiomatique', 'sans_fonction', 'avec_sujet', 'de'],
  'se rappeler': ['subjectif', 'sans_fonction', 'avec_sujet', null],
  'se servir': ['idiomatique', 'sans_fonction', 'avec_sujet', 'de'],
  'se souvenir': ['essentiel', 'sans_fonction', 'avec_sujet', 'de'],
  'se taire': ['subjectif', 'sans_fonction', 'avec_sujet', null],
}

const [verbs] = await database.execute('SELECT id, infinitif FROM verbes ORDER BY id')
const byName = new Map(verbs.map(verb => [normalize(verb.infinitif), verb]))
const pronominals = verbs.filter(verb => /^(se\s|s['’])/u.test(normalize(verb.infinitif)))

await database.beginTransaction()
try {
  await database.execute('UPDATE verbes SET pronominalisable = 0')
  for (const legacy of pronominals) {
    const infinitive = normalize(legacy.infinitif)
    const base = byName.get(baseOf(infinitive))
    const [type, functionName, agreement, preposition] = lexicalRules[infinitive]
      ?? ['reflechi', 'variable', 'selon_construction', null]
    await database.execute(`
      INSERT INTO emplois_pronominaux
        (verbe_id, legacy_verbe_id, infinitif_pronominal, type_emploi, fonction_pronom,
         regle_accord, preposition, personnes_autorisees, source, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'base historique', ?, 1)
      ON DUPLICATE KEY UPDATE verbe_id=VALUES(verbe_id), legacy_verbe_id=VALUES(legacy_verbe_id),
        type_emploi=VALUES(type_emploi), fonction_pronom=VALUES(fonction_pronom),
        regle_accord=VALUES(regle_accord), preposition=VALUES(preposition), actif=1
    `, [base?.id ?? null, legacy.id, infinitive, type, functionName, agreement, preposition,
      JSON.stringify([4, 5, 6, 7, 8, 9]), base ? 'importe' : 'a_verifier'])
    if (base) {
      await database.execute('UPDATE verbes SET pronominalisable=1 WHERE id=?', [base.id])
      await database.execute('UPDATE verbes SET est_archive=1 WHERE id=?', [legacy.id])
    } else {
      // Une entrée sans base dans ce catalogue reste visible jusqu'à ce qu'un
      // modèle lexical sûr soit disponible. Absence de base ≠ verbe essentiel.
      await database.execute('UPDATE verbes SET est_archive=0 WHERE id=?', [legacy.id])
    }
  }

  const playing = byName.get('jouer')
  if (playing) {
    await database.execute(`
      INSERT INTO emplois_pronominaux
        (verbe_id, infinitif_pronominal, type_emploi, fonction_pronom, regle_accord,
         preposition, personnes_autorisees, source, source_url, statut_validation, actif)
      VALUES (?, ?, 'idiomatique', 'sans_fonction', 'avec_sujet', 'de', ?,
        'Dictionnaire de l’Académie française, 9e édition',
        'https://www.dictionnaire-academie.fr/article/A9J0277', 'valide', 1)
      ON DUPLICATE KEY UPDATE verbe_id=VALUES(verbe_id), type_emploi='idiomatique',
        fonction_pronom='sans_fonction', regle_accord='avec_sujet', preposition='de',
        source=VALUES(source), source_url=VALUES(source_url), statut_validation='valide', actif=1
    `, [playing.id, elidedInfinitive(playing.infinitif), JSON.stringify([4, 5, 6, 7, 8, 9])])
    await database.execute('UPDATE verbes SET pronominalisable=1 WHERE id=?', [playing.id])
  }

  const tiring = byName.get('fatiguer')
  if (tiring) {
    await database.execute(`
      INSERT INTO emplois_pronominaux
        (verbe_id, infinitif_pronominal, type_emploi, fonction_pronom, regle_accord,
         preposition, personnes_autorisees, source, source_url, statut_validation, actif)
      VALUES (?, ?, 'subjectif', 'sans_fonction', 'avec_sujet', NULL, ?,
        'Dictionnaire de l’Académie française, 9e édition',
        'https://www.dictionnaire-academie.fr/article/A9F0285', 'valide', 1)
      ON DUPLICATE KEY UPDATE verbe_id=VALUES(verbe_id), type_emploi='subjectif',
        fonction_pronom='sans_fonction', regle_accord='avec_sujet', preposition=NULL,
        source=VALUES(source), source_url=VALUES(source_url), statut_validation='valide', actif=1
    `, [tiring.id, elidedInfinitive(tiring.infinitif), JSON.stringify([4, 5, 6, 7, 8, 9])])
    await database.execute('UPDATE verbes SET pronominalisable=1 WHERE id=?', [tiring.id])
  }

  const placing = byName.get('placer')
  if (placing) {
    await database.execute(`
      INSERT INTO emplois_pronominaux
        (verbe_id, infinitif_pronominal, type_emploi, fonction_pronom, regle_accord,
         preposition, personnes_autorisees, source, source_url, statut_validation, actif)
      VALUES (?, ?, 'reflechi', 'cod', 'avec_sujet', NULL, ?,
        'Dictionnaire de l’Académie française, 9e édition',
        'https://www.dictionnaire-academie.fr/article/A9P2635', 'valide', 1)
      ON DUPLICATE KEY UPDATE verbe_id=VALUES(verbe_id), type_emploi='reflechi',
        fonction_pronom='cod', regle_accord='avec_sujet', preposition=NULL,
        source=VALUES(source), source_url=VALUES(source_url), statut_validation='valide', actif=1
    `, [placing.id, elidedInfinitive(placing.infinitif), JSON.stringify([4, 5, 6, 7, 8, 9])])
    await database.execute('UPDATE verbes SET pronominalisable=1 WHERE id=?', [placing.id])
  }
  await database.commit()
} catch (error) {
  await database.rollback()
  throw error
}

const [summary] = await database.execute(`
  SELECT COUNT(*) AS emplois,
    SUM(verbe_id IS NOT NULL) AS derivables,
    SUM(verbe_id IS NULL) AS autonomes_a_verifier,
    SUM(statut_validation='valide') AS valides
  FROM emplois_pronominaux WHERE actif=1
`)
const [archived] = await database.execute('SELECT COUNT(*) AS count FROM verbes WHERE est_archive=1')
console.log(JSON.stringify({ ok: true, ...summary[0], verbes_archives: archived[0].count }, null, 2))
await database.end()
