import assert from 'node:assert/strict'
import { it } from 'node:test'
import mysql from 'mysql2/promise'
import { repairFeedbackComplements } from '../server/services/feedback-complement-repairs.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
it('migre les compléments sans doublons et ne change plus rien au deuxième démarrage', { skip: !configured }, async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  })
  try {
    // Masque les tables réelles, y compris verbes (MyISAM), sur cette connexion uniquement.
    await db.query('CREATE TEMPORARY TABLE verbes (id INT PRIMARY KEY,infinitif VARCHAR(80)) ENGINE=InnoDB')
    await db.query('CREATE TEMPORARY TABLE verbe_sens (id INT PRIMARY KEY,verbe_id INT) ENGINE=InnoDB')
    await db.query('CREATE TEMPORARY TABLE constructions_verbales (id INT PRIMARY KEY,sens_id INT) ENGINE=InnoDB')
    await db.query(`CREATE TEMPORARY TABLE complements_verbaux (
      id INT PRIMARY KEY,construction_id INT,texte VARCHAR(180),texte_antepose VARCHAR(180),
      source VARCHAR(120),actif INT,UNIQUE KEY(construction_id,texte)
    ) ENGINE=InnoDB`)
    await db.query("INSERT INTO verbes VALUES (1,'tomber'),(2,'élever'),(3,'souffrir'),(4,'discuter')")
    await db.query('INSERT INTO verbe_sens VALUES (1,1),(2,2),(3,3),(4,4)')
    await db.query('INSERT INTO constructions_verbales VALUES (1,1),(2,2),(3,3),(4,4)')
    const source = 'Catalogue pédagogique mineurs 2026'
    for (const row of [
      [1,1,'notre quille',null,source,1], [2,2,'ma construction','la construction',source,1],
      [3,3,'mon attente','l’attente',source,1], [4,4,'de des projets',null,source,1],
      [5,4,'de des amis',null,source,1], [6,4,'d’amis',null,'Manuel',1],
      [7,1,'un adversaire',null,'Académie française',1],
      [8,2,'une construction','la construction','Académie française',1],
    ]) await db.execute('INSERT INTO complements_verbaux VALUES (?,?,?,?,?,?)', row)
    const [before] = await db.query('SELECT * FROM complements_verbaux ORDER BY id')
    const preview = await repairFeedbackComplements(db)
    assert.deepEqual(preview, { replaced: 3, disabled: 2 })
    assert.deepEqual((await db.query('SELECT * FROM complements_verbaux ORDER BY id'))[0], before)
    assert.deepEqual(await repairFeedbackComplements(db, true), preview)
    assert.deepEqual(await repairFeedbackComplements(db, true), { replaced: 0, disabled: 0 })
    const [after] = await db.query('SELECT * FROM complements_verbaux ORDER BY id')
    assert.equal(after[0].actif, 0)
    assert.equal(after[1].texte, 'ma poule')
    assert.equal(after[1].texte_antepose, 'la poule')
    assert.equal(after[2].texte, 'ma douleur')
    assert.equal(after[2].texte_antepose, 'la douleur')
    assert.equal(after[3].texte, 'de projets')
    assert.equal(after[4].actif, 0)
    for (const index of [5,6,7]) assert.deepEqual(after[index], before[index])
  } finally { await db.end() }
})
