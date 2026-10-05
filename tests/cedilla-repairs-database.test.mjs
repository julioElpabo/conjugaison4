import assert from 'node:assert/strict'
import { after, before, it } from 'node:test'
import mysql from 'mysql2/promise'
import { repairDatabaseCedillas, repairUnnecessaryCedillas } from '../server/services/cedilla-repairs.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let connection
before(async () => {
  if (!configured) return
  connection = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  })
  // Les tables historiques sont MyISAM : un ROLLBACK ne les protégerait pas.
  // Les tables temporaires masquent les vraies tables sur cette connexion.
  await connection.query(`CREATE TEMPORARY TABLE verbes (
    id INT PRIMARY KEY, infinitif VARCHAR(100), \`participe_présent\` VARCHAR(100), \`participe_passé\` VARCHAR(100)
  ) ENGINE=InnoDB`)
  await connection.query(`CREATE TEMPORARY TABLE verbesconjugues (
    id INT PRIMARY KEY, conjugaison1 VARCHAR(100), conjugaison2 VARCHAR(100), conjugaison3 VARCHAR(100)
  ) ENGINE=InnoDB`)
  await connection.query(`CREATE TEMPORARY TABLE learner_run_questions (
    run_id INT, question_index INT, question_json LONGTEXT, result_status VARCHAR(12), attempt_number INT,
    PRIMARY KEY(run_id,question_index)
  ) ENGINE=InnoDB`)
  for (const table of ['learner_run_forms', 'learner_answer_attempts']) {
    await connection.query(`CREATE TEMPORARY TABLE ${table} (id INT PRIMARY KEY,question_json LONGTEXT) ENGINE=InnoDB`)
  }
  await connection.query(`INSERT INTO verbes VALUES
    (1,'avancer','avançant','avançé'), (2,'recevoir','recevant','reçu')`)
  await connection.query(`INSERT INTO verbesconjugues VALUES
    (1,'ayons avançé','',''), (2,'vous avançez','avançées','AVANÇÉ'),
    (3,'avançons','',''), (4,'commençâmes','',''), (5,'ai reçu','','')`)
  const snapshot = JSON.stringify({
    reponses: ['ayons avançé des pions'],
    conjugationConfusions: [{ forms: ['vous avançez'] }],
  })
  await connection.execute('INSERT INTO learner_run_questions VALUES (1,0,?,?,?)', [snapshot, 'correct', 2])
  for (const table of ['learner_run_forms', 'learner_answer_attempts']) {
    await connection.execute(`INSERT INTO ${table} VALUES (1,?)`, [snapshot])
  }
})
after(async () => connection?.end())

it('répare la base de façon idempotente et conserve les bonnes cédilles et les résultats', { skip: !configured }, async () => {
  await connection.beginTransaction()
  try {
    const [validBefore] = await connection.query(`
      SELECT id,conjugaison1,conjugaison2,conjugaison3 FROM verbesconjugues
      WHERE LOCATE('ç',CAST(conjugaison1 AS BINARY))>0 ORDER BY id
    `)
    const valid = validBefore.filter(row => [row.conjugaison1, row.conjugaison2, row.conjugaison3]
      .every(value => repairUnnecessaryCedillas(value || '') === (value || '')))
    assert.ok(valid.length > 0)
    const [resultsBefore] = await connection.query('SELECT run_id,question_index,result_status,attempt_number FROM learner_run_questions ORDER BY run_id,question_index')
    const preview = await repairDatabaseCedillas(connection)
    assert.deepEqual(preview, { verbFields: 1, conjugationRows: 2, conjugationForms: 4, savedQuestions: 3 })
    assert.deepEqual(await repairDatabaseCedillas(connection, true), preview)
    assert.deepEqual(await repairDatabaseCedillas(connection, true), {
      verbFields: 0, conjugationRows: 0, conjugationForms: 0, savedQuestions: 0,
    })
    const [forms] = await connection.query('SELECT id,conjugaison1,conjugaison2,conjugaison3 FROM verbesconjugues')
    const byId = new Map(forms.map(row => [row.id, row]))
    for (const row of valid) assert.deepEqual(byId.get(row.id), row)
    for (const row of forms) {
      for (const field of ['conjugaison1', 'conjugaison2', 'conjugaison3']) {
        assert.equal(repairUnnecessaryCedillas(row[field] || ''), row[field] || '', `${row.id}:${field}`)
      }
    }
    const [resultsAfter] = await connection.query('SELECT run_id,question_index,result_status,attempt_number FROM learner_run_questions ORDER BY run_id,question_index')
    assert.deepEqual(resultsAfter, resultsBefore)
  } finally {
    await connection.rollback()
  }
})
