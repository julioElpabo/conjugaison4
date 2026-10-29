import assert from 'node:assert/strict'
import { test } from 'node:test'
import mysql from 'mysql2/promise'
import { formatAnswer, formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { findCompoundAuxiliaryForm } from '../server/services/compound-auxiliary.ts'
import { agreePastParticiple } from '../shared/utils/past-participle-agreement.ts'
import { diagnoseCoachAgreement } from '../shared/utils/coach-feedback.ts'
import { diagnoseLearnerError } from '../shared/utils/learner-error-diagnostics.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)

test('audit des diagnostics d’accord sur les constructions du catalogue réel', { skip: !configured }, async (t) => {
  const database = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  })
  try {
    const [rows] = await database.query(`
      SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
             v.infinitif, v.auxiliaire, v.\`participe_passé\` AS participe_passe,
             p.pronom, t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id=vc.verbe_id AND v.est_archive=0
      INNER JOIN personnes p ON p.id=vc.personne_id
      INNER JOIN temps t ON t.id=vc.temp_id
      INNER JOIN modes m ON m.id=t.mode_id
      WHERE v.auxiliaire='avoir' AND t.isTempsCompose=1 AND vc.conjugaison1<>''
        AND vc.personne_id BETWEEN 4 AND 9
        AND m.name IN ('indicatif','subjonctif','conditionnel','impératif')
        AND v.infinitif NOT LIKE 'se %' AND v.infinitif NOT LIKE 's''%'
    `)
    const [auxiliaries] = await database.query(`
      SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id=vc.verbe_id
      INNER JOIN temps t ON t.id=vc.temp_id
      INNER JOIN modes m ON m.id=t.mode_id
      WHERE v.infinitif='être' AND t.isTempsCompose=0 AND vc.conjugaison1<>''
    `)
    const verbs = new Set()
    const failures = []
    let checked = 0
    for (const row of rows) {
      const auxiliary = findCompoundAuxiliaryForm(row, auxiliaries)
      if (!auxiliary || !row.participe_passe || row.participe_passe.includes('-')) continue
      const pronoun = Number(row.personne_id) === 6 ? 'elle'
        : Number(row.personne_id) === 9 ? 'elles' : row.pronom
      const question = formatConjugationQuestion(row, pronoun)
      const participle = agreePastParticiple(row.participe_passe, 'feminin', Number(row.personne_id) >= 7 ? 'pluriel' : 'singulier')
      // Cette réponse constitue une autre construction ; elle n’est pas
      // présentée comme une conjugaison active admise pour tous ces verbes.
      const answer = formatAnswer(pronoun, `${auxiliary.conjugaison1} ${participle}`, row.mode_name, row.infinitif)
      if (validateConjugationAnswer(answer, question).isCorrect) continue
      checked += 1
      verbs.add(row.infinitif)
      if (diagnoseCoachAgreement(answer, question)
          || diagnoseLearnerError(answer, question).some(tag => tag.code.startsWith('agreement.'))) {
        failures.push(`${row.infinitif} | ${row.mode_name} ${row.temps_name} | ${answer}`)
      }
    }
    t.diagnostic(`${checked} réponses contrôlées sur ${verbs.size} verbes, dans les temps composés du catalogue.`)
    assert.ok(verbs.size > 300, `Couverture insuffisante : ${verbs.size} verbes`)
    assert.ok(checked > 10_000, `Couverture insuffisante : ${checked} réponses`)
    assert.deepEqual(failures.slice(0, 20), [], `${failures.length} diagnostic(s) d’accord injustifié(s)`)
  } finally {
    await database.end()
  }
})
