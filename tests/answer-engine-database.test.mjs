import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import mysql from 'mysql2/promise'
import { formatAnswer, formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { isAnswerCorrect, normalizeAnswer } from '../shared/utils/answer.ts'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let database
let rows = []

before(async () => {
  if (!databaseConfigured) return
  database = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  const [storedRows] = await database.query(`
    SELECT vc.id,vc.verbe_id,vc.personne_id,vc.temp_id,
           vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,
           v.infinitif,v.auxiliaire,v.\`participe_passé\` AS participe_passe,
           p.pronom,t.name AS temps_name,t.code AS tense_code,
           t.isTempsCompose AS is_compound,m.name AS mode_name,m.code AS mode_code
    FROM verbesconjugues vc
    INNER JOIN verbes v ON v.id=vc.verbe_id AND v.est_archive=0
    INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE COALESCE(vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,'')<>''
    ORDER BY vc.verbe_id,vc.temp_id,vc.personne_id
  `)
  rows = storedRows
})

after(async () => database?.end())

function forms(row) {
  return [row.conjugaison1, row.conjugaison2, row.conjugaison3]
    .map(value => String(value || '').trim())
    .filter(Boolean)
}

function questionFor(row) {
  return formatConjugationQuestion(row, row.pronom)
}

function groupedBy(keyFor) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFor(row)
    groups.set(key, [...(groups.get(key) || []), row])
  }
  return groups
}

describe('correcteur appliqué à tout le catalogue de conjugaisons', { skip: !databaseConfigured }, () => {
  it('accepte chaque variante stockée et chaque corrigé affiché', () => {
    const failures = []
    let checkedForms = 0
    let checkedCorrections = 0

    for (const row of rows) {
      const question = questionFor(row)
      if (!question.reponses.length || !question.reponsesPourCorrige.length) {
        failures.push(`${row.infinitif} | ${row.temps_name} (${row.mode_name}) | ${row.pronom} : réponses vides`)
        continue
      }
      for (const form of forms(row)) {
        checkedForms += 1
        const displayed = formatAnswer(row.pronom, form, row.mode_name, row.infinitif)
        if (!isAnswerCorrect(form, question.reponses) || !isAnswerCorrect(displayed, question.reponses)) {
          failures.push(`${row.infinitif} | ${row.temps_name} (${row.mode_name}) | ${row.pronom} : ${form}`)
        }
      }
      for (const correction of question.reponsesPourCorrige) {
        checkedCorrections += 1
        if (!isAnswerCorrect(correction, question.reponses)) {
          failures.push(`${row.infinitif} | ${row.temps_name} (${row.mode_name}) | ${row.pronom} : corrigé ${correction}`)
        }
      }
    }

    assert.ok(checkedForms > 50_000, `${checkedForms} formes seulement ont été contrôlées`)
    assert.ok(checkedCorrections > 45_000, `${checkedCorrections} corrigés seulement ont été contrôlés`)
    assert.deepEqual(failures.slice(0, 30), [], `${failures.length} réponse(s) générée(s) refusée(s) par le correcteur`)
  })

  it('refuse une forme d’une autre personne lorsqu’elle n’est pas homographe', () => {
    const failures = []
    let checked = 0
    for (const group of groupedBy(row => `${row.verbe_id}:${row.temp_id}`).values()) {
      for (const target of group) {
        const question = questionFor(target)
        const accepted = new Set(question.reponses.map(normalizeAnswer))
        const candidate = group
          .filter(row => Number(row.personne_id) !== Number(target.personne_id))
          .flatMap(forms)
          .find(form => !accepted.has(normalizeAnswer(form)))
        if (!candidate) continue
        checked += 1
        if (isAnswerCorrect(candidate, question.reponses)) {
          failures.push(`${target.infinitif} | ${target.temps_name} (${target.mode_name}) | ${target.pronom} accepte ${candidate}`)
        }
      }
    }

    assert.ok(checked > 40_000, `${checked} oppositions de personnes seulement ont été contrôlées`)
    assert.deepEqual(failures.slice(0, 30), [], `${failures.length} confusion(s) de personne acceptée(s)`)
  })

  it('refuse une forme d’un autre temps lorsqu’elle n’est pas homographe', () => {
    const failures = []
    let checked = 0
    for (const group of groupedBy(row => `${row.verbe_id}:${row.personne_id}`).values()) {
      for (const target of group) {
        const question = questionFor(target)
        const accepted = new Set(question.reponses.map(normalizeAnswer))
        const candidate = group
          .filter(row => Number(row.temp_id) !== Number(target.temp_id))
          .flatMap(forms)
          .find(form => !accepted.has(normalizeAnswer(form)))
        if (!candidate) continue
        checked += 1
        if (isAnswerCorrect(candidate, question.reponses)) {
          failures.push(`${target.infinitif} | ${target.temps_name} (${target.mode_name}) | ${target.pronom} accepte ${candidate}`)
        }
      }
    }

    assert.ok(checked > 40_000, `${checked} oppositions de temps seulement ont été contrôlées`)
    assert.deepEqual(failures.slice(0, 30), [], `${failures.length} confusion(s) de temps acceptée(s)`)
  })
})
