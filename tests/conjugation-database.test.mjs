import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import mysql from 'mysql2/promise'

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

after(async () => {
  await database?.end()
})

async function formFor(infinitive, mode, tense, pronoun) {
  const [rows] = await database.execute(`
    SELECT vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
    FROM verbesconjugues vc
    INNER JOIN verbes v ON v.id = vc.verbe_id
    INNER JOIN personnes p ON p.id = vc.personne_id
    INNER JOIN temps t ON t.id = vc.temp_id
    INNER JOIN modes m ON m.id = t.mode_id
    WHERE v.infinitif = ? AND m.name = ? AND t.name = ? AND p.pronom = ?
    LIMIT 1
  `, [infinitive, mode, tense, pronoun])
  assert.ok(rows[0], `Forme absente : ${pronoun} | ${infinitive} | ${tense} (${mode})`)
  return [rows[0].conjugaison1, rows[0].conjugaison2, rows[0].conjugaison3]
    .map(value => String(value || '').trim())
    .filter(Boolean)
}

function referenceCases(title, cases) {
  describe(title, { skip: !databaseConfigured }, () => {
    for (const testCase of cases) {
      it(`${testCase.pronoun} ${testCase.infinitive} — ${testCase.tense} (${testCase.mode}) contient « ${testCase.expected.join(' » ou « ')} »`, async () => {
        const actual = await formFor(testCase.infinitive, testCase.mode, testCase.tense, testCase.pronoun)
        for (const expected of testCase.expected) {
          assert.ok(actual.includes(expected), `Attendu : ${testCase.expected.join(' | ')}\nObtenu : ${actual.join(' | ') || '(vide)'}`)
        }
      })
    }
  })
}

referenceCases('couverture de tous les temps personnels', [
  ['indicatif', 'présent', 'je', 'aime'],
  ['indicatif', 'imparfait', 'je', 'aimais'],
  ['indicatif', 'futur', 'je', 'aimerai'],
  ['indicatif', 'passé simple', 'je', 'aimai'],
  ['indicatif', 'passé composé', 'je', 'ai aimé'],
  ['indicatif', 'futur antérieur', 'je', 'aurai aimé'],
  ['indicatif', 'plus-que-parfait', 'je', 'avais aimé'],
  ['indicatif', 'passé antérieur', 'je', 'eus aimé'],
  ['subjonctif', 'présent', 'je', 'aime'],
  ['subjonctif', 'passé', 'je', 'aie aimé'],
  ['subjonctif', 'imparfait', 'je', 'aimasse'],
  ['subjonctif', 'plus-que-parfait', 'je', 'eusse aimé'],
  ['conditionnel', 'présent', 'je', 'aimerais'],
  ['conditionnel', 'passé 1', 'je', 'aurais aimé'],
  ['conditionnel', 'passé 2', 'je', 'eusse aimé'],
  ['impératif', 'présent', 'tu', 'aime'],
  ['impératif', 'passé', 'tu', 'aie aimé'],
].map(([mode, tense, pronoun, expected]) => ({ infinitive: 'aimer', mode, tense, pronoun, expected: [expected] })))

referenceCases('variantes reconnues par les ouvrages de référence', [
  { infinitive: 'asseoir', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['assieds', 'assois'] },
  { infinitive: 'asseoir', mode: 'indicatif', tense: 'présent', pronoun: 'nous', expected: ['asseyons', 'assoyons'] },
  { infinitive: 'asseoir', mode: 'indicatif', tense: 'imparfait', pronoun: 'vous', expected: ['asseyiez', 'assoyiez'] },
  { infinitive: 'asseoir', mode: 'indicatif', tense: 'futur', pronoun: 'ils', expected: ['assiéront', 'assoiront'] },
  { infinitive: 'asseoir', mode: 'subjonctif', tense: 'présent', pronoun: 'je', expected: ['asseye', 'assoie'] },
  { infinitive: 'asseoir', mode: 'impératif', tense: 'présent', pronoun: 'tu', expected: ['assieds', 'assois'] },
  { infinitive: 'payer', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['paie', 'paye'] },
  { infinitive: 'essayer', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['essaie', 'essaye'] },
  { infinitive: 'pouvoir', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['peux', 'puis'] },
])

referenceCases('familles à modification orthographique', [
  { infinitive: 'manger', mode: 'indicatif', tense: 'présent', pronoun: 'nous', expected: ['mangeons'] },
  { infinitive: 'commencer', mode: 'indicatif', tense: 'présent', pronoun: 'nous', expected: ['commençons'] },
  { infinitive: 'appeler', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['appelle'] },
  { infinitive: 'jeter', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['jette'] },
  { infinitive: 'acheter', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['achète'] },
  { infinitive: 'envoyer', mode: 'indicatif', tense: 'futur', pronoun: 'je', expected: ['enverrai'] },
  { infinitive: 'acquérir', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['acquiers'] },
  { infinitive: 'haïr', mode: 'indicatif', tense: 'présent', pronoun: 'je', expected: ['hais'] },
  { infinitive: 'haïr', mode: 'indicatif', tense: 'présent', pronoun: 'nous', expected: ['haïssons'] },
])

referenceCases('doléances vérifiées des utilisateurs', [
  { infinitive: 'naître', mode: 'indicatif', tense: 'présent', pronoun: 'il', expected: ['naît', 'nait'] },
  { infinitive: 'naître', mode: 'indicatif', tense: 'futur', pronoun: 'je', expected: ['naîtrai', 'naitrai'] },
  { infinitive: 'reconnaître', mode: 'indicatif', tense: 'présent', pronoun: 'il', expected: ['reconnaît', 'reconnait'] },
  { infinitive: 'reconnaître', mode: 'indicatif', tense: 'passé simple', pronoun: 'nous', expected: ['reconnûmes'] },
  { infinitive: 'reconnaître', mode: 'conditionnel', tense: 'présent', pronoun: 'je', expected: ['reconnaîtrais', 'reconnaitrais'] },
  { infinitive: 'rougir', mode: 'indicatif', tense: 'présent', pronoun: 'nous', expected: ['rougissons'] },
  { infinitive: 'rougir', mode: 'subjonctif', tense: 'présent', pronoun: 'ils', expected: ['rougissent'] },
  { infinitive: 'rougir', mode: 'impératif', tense: 'passé', pronoun: 'vous', expected: ['ayez rougi'] },
])

referenceCases('verbes irréguliers fondamentaux', [
  { infinitive: 'être', mode: 'indicatif', tense: 'présent', pronoun: 'vous', expected: ['êtes'] },
  { infinitive: 'avoir', mode: 'subjonctif', tense: 'présent', pronoun: 'je', expected: ['aie'] },
  { infinitive: 'aller', mode: 'indicatif', tense: 'futur', pronoun: 'je', expected: ['irai'] },
  { infinitive: 'faire', mode: 'indicatif', tense: 'présent', pronoun: 'vous', expected: ['faites'] },
  { infinitive: 'dire', mode: 'indicatif', tense: 'présent', pronoun: 'vous', expected: ['dites'] },
  { infinitive: 'venir', mode: 'indicatif', tense: 'passé simple', pronoun: 'nous', expected: ['vînmes'] },
  { infinitive: 'tenir', mode: 'subjonctif', tense: 'présent', pronoun: 'ils', expected: ['tiennent'] },
  { infinitive: 'prendre', mode: 'indicatif', tense: 'présent', pronoun: 'ils', expected: ['prennent'] },
])

describe('verbes défectifs et impersonnels', { skip: !databaseConfigured }, () => {
  it('falloir ne possède que la troisième personne du singulier au présent', async () => {
    assert.deepEqual(await formFor('falloir', 'indicatif', 'présent', 'il'), ['faut'])
    for (const pronoun of ['je', 'tu', 'nous', 'vous', 'ils']) {
      assert.deepEqual(await formFor('falloir', 'indicatif', 'présent', pronoun), [])
    }
  })

  it('pleuvoir possède la forme il pleut', async () => {
    assert.deepEqual(await formFor('pleuvoir', 'indicatif', 'présent', 'il'), ['pleut'])
  })

  it('les personnes inexistantes ne sont jamais proposées comme réponses', async () => {
    for (const infinitive of ['falloir', 'pleuvoir']) {
      for (const pronoun of ['je', 'tu', 'nous', 'vous', 'ils']) {
        assert.deepEqual(await formFor(infinitive, 'indicatif', 'présent', pronoun), [], `${pronoun} ${infinitive} devrait rester vide`)
      }
    }
  })
})

describe('intégrité des 488 verbes du catalogue', { skip: !databaseConfigured }, () => {
  it('ne contient aucun infinitif en double', async () => {
    const [rows] = await database.query('SELECT id, infinitif FROM verbes ORDER BY infinitif, id')
    const seen = new Map()
    const duplicates = []
    for (const row of rows) {
      const key = row.infinitif.trim().toLocaleLowerCase('fr')
      if (seen.has(key)) duplicates.push(`${row.infinitif} (#${seen.get(key)} et #${row.id})`)
      seen.set(key, row.id)
    }
    assert.deepEqual(duplicates, [], `Infinitifs en double : ${duplicates.join(', ')}`)
  })

  it('possède un infinitif, un auxiliaire et des participes renseignés', async () => {
    const [rows] = await database.query('SELECT * FROM verbes ORDER BY infinitif')
    const noPresentParticiple = new Set(['déchoir'])
    const noPastParticiple = new Set(['gésir'])
    const invalid = rows.filter(row => !String(row.infinitif || '').trim()
      || !String(row.auxiliaire || '').trim()
      || (!noPresentParticiple.has(row.infinitif) && !String(row['participe_présent'] || '').trim())
      || (!noPastParticiple.has(row.infinitif) && !String(row['participe_passé'] || '').trim()))
    assert.deepEqual(invalid.map(row => row.infinitif || `#${row.id}`), [], 'Métadonnées obligatoires manquantes')
  })

  it('ne répète pas exactement une variante dans la même ligne', async () => {
    const [rows] = await database.query(`
      SELECT vc.id, v.infinitif, m.name AS mode, t.name AS temps, p.pronom,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
    `)
    const duplicates = rows.flatMap((row) => {
      const forms = [row.conjugaison1, row.conjugaison2, row.conjugaison3].map(value => String(value || '').trim()).filter(Boolean)
      return new Set(forms).size === forms.length ? [] : [`${row.pronom} | ${row.infinitif} | ${row.temps} (${row.mode}) : ${forms.join(' | ')}`]
    })
    assert.deepEqual(duplicates.slice(0, 30), [], `${duplicates.length} ligne(s) contiennent une variante strictement dupliquée`)
  })

  it('ne contient aucune conjugaison orpheline', async () => {
    const [rows] = await database.query(`
      SELECT vc.id FROM verbesconjugues vc
      LEFT JOIN verbes v ON v.id = vc.verbe_id
      LEFT JOIN personnes p ON p.id = vc.personne_id
      LEFT JOIN temps t ON t.id = vc.temp_id
      WHERE v.id IS NULL OR p.id IS NULL OR t.id IS NULL
    `)
    assert.deepEqual(
      rows.slice(0, 30).map(row => row.id),
      [],
      `${rows.length} conjugaison(s) rattachée(s) à un verbe, un temps ou un pronom inexistant ; les 30 premiers identifiants sont affichés`,
    )
  })

  it('possède les six personnes du présent pour les verbes non défectifs', async () => {
    const allowedDefective = new Set(['falloir', 'pleuvoir', 'clore'])
    const [rows] = await database.query(`
      SELECT v.infinitif, SUM(vc.conjugaison1 <> '') AS filled
      FROM verbes v
      LEFT JOIN verbesconjugues vc ON vc.verbe_id = v.id AND vc.temp_id = 1
      GROUP BY v.id, v.infinitif
      HAVING filled < 6
      ORDER BY v.infinitif
    `)
    const unexpected = rows.filter(row => !allowedDefective.has(row.infinitif))
    assert.deepEqual(unexpected, [], `Formes obligatoires manquantes : ${unexpected.map(row => `${row.infinitif} (${row.filled}/6)`).join(', ')}`)
  })

  it('utilise uniquement avoir ou être comme auxiliaire', async () => {
    const [rows] = await database.query("SELECT infinitif, auxiliaire FROM verbes WHERE auxiliaire NOT IN ('avoir', 'être') OR auxiliaire IS NULL OR auxiliaire = ''")
    assert.deepEqual(rows, [], `Auxiliaires invalides : ${rows.map(row => `${row.infinitif}=${row.auxiliaire}`).join(', ')}`)
  })
})
