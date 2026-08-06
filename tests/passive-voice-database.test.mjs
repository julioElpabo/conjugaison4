import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import mysql from 'mysql2/promise'
import { formatPassiveQuestion } from '../server/services/passive-voice.ts'
import { isAnswerCorrect } from '../shared/utils/answer.ts'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
let database

before(async () => {
  if (!databaseConfigured) return
  database = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
})

after(async () => database?.end())

const expectedAuxiliaries = new Map([
  ['indicatif|présent', ['est', 'sont']],
  ['indicatif|imparfait', ['était', 'étaient']],
  ['indicatif|futur', ['sera', 'seront']],
  ['indicatif|passé simple', ['fut', 'furent']],
  ['indicatif|passé composé', ['a été', 'ont été']],
  ['indicatif|futur antérieur', ['aura été', 'auront été']],
  ['indicatif|plus-que-parfait', ['avait été', 'avaient été']],
  ['indicatif|passé antérieur', ['eut été', 'eurent été']],
  ['subjonctif|présent', ['soit', 'soient']],
  ['subjonctif|passé', ['ait été', 'aient été']],
  ['subjonctif|imparfait', ['fût', 'fussent']],
  ['subjonctif|plus-que-parfait', ['eût été', 'eussent été']],
  ['conditionnel|présent', ['serait', 'seraient']],
  ['conditionnel|passé 1', ['aurait été', 'auraient été']],
  ['conditionnel|passé 2', ['eût été', 'eussent été']],
])

describe('couverture exhaustive des formes passives stockées', { skip: !databaseConfigured }, () => {
  it('conjugue être et accorde le participe aux 15 temps compatibles', async () => {
    const [auxiliaryForms] = await database.query(`
      SELECT vc.personne_id,m.name AS mode_name,t.name AS temps_name,vc.conjugaison1
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id=vc.verbe_id
      INNER JOIN temps t ON t.id=vc.temp_id
      INNER JOIN modes m ON m.id=t.mode_id
      WHERE v.infinitif='être' AND vc.personne_id IN (6,9)
        AND m.name IN ('indicatif','subjonctif','conditionnel')
        AND t.code<>'near-future' AND vc.conjugaison1<>''
      ORDER BY m.id,t.id,vc.personne_id
    `)

    assert.equal(auxiliaryForms.length, expectedAuxiliaries.size * 2)
    for (const [coordinate, expected] of expectedAuxiliaries) {
      const [mode, tense] = coordinate.split('|')
      for (const [index, personId] of [6, 9].entries()) {
        const auxiliary = auxiliaryForms.find(row => (
          Number(row.personne_id) === personId
          && row.mode_name === mode
          && row.temps_name === tense
        ))
        assert.equal(auxiliary?.conjugaison1, expected[index], `${coordinate}, personne ${personId}`)

        const plural = personId === 9
        const question = formatPassiveQuestion({
          id: 100 + personId,
          verbe_id: 7,
          personne_id: personId,
          temp_id: 1,
          conjugaison1: '',
          infinitif: 'abandonner',
          participe_passe: 'abandonné',
          temps_name: tense,
          is_compound: Number(tense !== 'présent'),
          mode_name: mode,
        }, {
          id: personId,
          texte_antepose: plural ? 'les missions' : 'la mission',
          genre: 'feminin',
          nombre: plural ? 'pluriel' : 'singulier',
        }, auxiliaryForms)

        assert.ok(question, `${coordinate}, personne ${personId}`)
        assert.equal(
          question.conjugaison1,
          `${expected[index]} ${plural ? 'abandonnées' : 'abandonnée'}`,
          `${coordinate}, personne ${personId}`,
        )
        assert.ok(question.reponses.every(answer => isAnswerCorrect(answer, question.reponses)))
        assert.ok(question.reponsesPourCorrige.every(answer => isAnswerCorrect(answer, question.reponses)))

        const wrongAgreement = `${expected[index]} abandonné`
        if (wrongAgreement !== question.conjugaison1) {
          assert.equal(isAnswerCorrect(wrongAgreement, question.reponses), false, `${coordinate}, personne ${personId}`)
        }
      }
    }
  })
})
