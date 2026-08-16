import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { challengePresetDefinitions } from '../../shared/data/challenge-presets'
import {
  frenchSchoolMissingVerbClones,
  transformFrenchSchoolVerbForm,
} from '../../shared/data/french-school-programme'
import { useDatabase } from '../utils/database'
import { refreshVerbMetadata } from '../services/verb-metadata'

interface CountRow extends RowDataPacket { count: number }
interface IdRow extends RowDataPacket { id: number }
interface CategoryRow extends RowDataPacket { id: number, slug: string, sortOrder: number }
interface StoredVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  'participe_présent': string
  'participe_passé': string
  auxiliaire: string
  groupe_conjugaison: number | null
  famille_conjugaison_id: number | null
  terminaison_infinitif: string | null
  type_pronominal: string
  est_impersonnel: number
  est_defectif: number
  personnes_disponibles: string | null
  type_h_initial: string | null
  niveau_difficulte: number | null
  niveau_cecrl: string | null
  registre_principal: string
  particularites: string | null
  parcours_cif: string | null
  pronominalisable: number
}
interface StoredFormRow extends RowDataPacket {
  personne_id: number
  temp_id: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

async function ensureMissingVerbs(connection: PoolConnection) {
  let inserted = 0
  for (const clone of frenchSchoolMissingVerbClones) {
    const [[existing]] = await connection.query<IdRow[]>(
      'SELECT id FROM verbes WHERE infinitif=? LIMIT 1 FOR UPDATE',
      [clone.infinitive],
    )
    if (existing?.id) {
      await refreshVerbMetadata(connection, Number(existing.id))
      continue
    }

    const [[model]] = await connection.query<StoredVerbRow[]>(
      'SELECT * FROM verbes WHERE infinitif=? LIMIT 1 FOR UPDATE',
      [clone.model],
    )
    if (!model?.id) throw new Error(`Verbe modèle introuvable : ${clone.model}.`)

    const [result] = await connection.execute<ResultSetHeader>(`
      INSERT INTO verbes (
        infinitif, \`participe_présent\`, \`participe_passé\`, auxiliaire,
        groupe_conjugaison, famille_conjugaison_id, terminaison_infinitif,
        type_pronominal, est_impersonnel, est_defectif, personnes_disponibles,
        type_h_initial, niveau_difficulte, niveau_cecrl, rang_frequence,
        registre_principal, forme_canonique, statut_validation, particularites,
        niveaux_scolaires, parcours_cif, pronominalisable, est_archive
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?,?, ?,JSON_ARRAY(),?,?,0)
    `, [
      clone.infinitive,
      transformFrenchSchoolVerbForm(model['participe_présent'], clone),
      transformFrenchSchoolVerbForm(model['participe_passé'], clone),
      model.auxiliaire,
      model.groupe_conjugaison,
      model.famille_conjugaison_id,
      clone.infinitive.endsWith('er') ? 'er' : model.terminaison_infinitif,
      model.type_pronominal,
      model.est_impersonnel,
      model.est_defectif,
      model.personnes_disponibles,
      model.type_h_initial,
      model.niveau_difficulte,
      model.niveau_cecrl,
      model.registre_principal,
      clone.infinitive,
      'genere',
      model.particularites,
      model.parcours_cif,
      model.pronominalisable,
    ])
    const verbId = Number(result.insertId)

    const [forms] = await connection.query<StoredFormRow[]>(`
      SELECT personne_id,temp_id,conjugaison1,conjugaison2,conjugaison3
      FROM verbesconjugues WHERE verbe_id=? ORDER BY temp_id,personne_id
    `, [model.id])
    if (!forms.length) throw new Error(`Conjugaisons du modèle absentes : ${clone.model}.`)

    for (const form of forms) {
      await connection.execute(`
        INSERT INTO verbesconjugues
          (verbe_id,verbe_infinitif,personne_id,temp_id,conjugaison1,conjugaison2,conjugaison3)
        VALUES (?,?,?,?,?,?,?)
      `, [
        verbId,
        clone.infinitive,
        form.personne_id,
        form.temp_id,
        transformFrenchSchoolVerbForm(form.conjugaison1 || '', clone),
        transformFrenchSchoolVerbForm(form.conjugaison2 || '', clone),
        transformFrenchSchoolVerbForm(form.conjugaison3 || '', clone),
      ])
    }
    await refreshVerbMetadata(connection, verbId)
    inserted += 1
  }
  return inserted
}

async function ensureFrenchSchoolPresets(connection: PoolConnection) {
  const [categories] = await connection.query<CategoryRow[]>(`
    SELECT id,slug,sort_order AS sortOrder
    FROM challenge_preset_categories ORDER BY sort_order,id FOR UPDATE
  `)
  const swiss = categories.find(category => category.slug === 'school')
  if (!swiss) throw new Error('Catégorie « Niveaux scolaires suisses » introuvable.')

  let french: { id: number, slug: string, sortOrder: number } | undefined
    = categories.find(category => category.slug === 'school-france')
  if (!french) {
    await connection.execute(
      'UPDATE challenge_preset_categories SET sort_order=sort_order+1 WHERE sort_order>?',
      [swiss.sortOrder],
    )
    const [result] = await connection.execute<ResultSetHeader>(`
      INSERT INTO challenge_preset_categories
        (slug,name,description,sort_order,is_active)
      VALUES ('school-france','Niveaux scolaires français',?, ?,1)
    `, [
      'Défis alignés sur les niveaux scolaires français du CP à la 3e.',
      swiss.sortOrder + 1,
    ])
    french = { id: Number(result.insertId), slug: 'school-france', sortOrder: swiss.sortOrder + 1 }
  }
  if (!french) throw new Error('Impossible de créer la catégorie scolaire française.')

  const definitions = challengePresetDefinitions.filter(definition => definition.group === 'school-france')
  let inserted = 0
  for (const [sortOrder, definition] of definitions.entries()) {
    const [result] = await connection.execute<ResultSetHeader>(`
      INSERT INTO challenge_presets (
        preset_key,category_id,name,description,question_count,exercise_kind,
        past_simple_pronouns,inclusive_pronouns,complement_options,
        verb_selection_mode,criteria_json,sort_order,is_active
      ) VALUES (?, ?,?,?,?,'conjugation','all',0,JSON_ARRAY(),'criteria',?,?,1)
      ON DUPLICATE KEY UPDATE preset_key=preset_key
    `, [
      definition.id,
      french.id,
      definition.label,
      definition.description,
      definition.questionCount,
      JSON.stringify(definition.criteria),
      sortOrder + 1,
    ])
    inserted += Number(result.insertId > 0)

    const [[preset]] = await connection.query<IdRow[]>(
      'SELECT id FROM challenge_presets WHERE preset_key=? LIMIT 1',
      [definition.id],
    )
    if (!preset?.id) throw new Error(`Défi français introuvable après insertion : ${definition.id}.`)
    for (const [tenseOrder, tenseId] of definition.tenseIds.entries()) {
      await connection.execute(`
        INSERT IGNORE INTO challenge_preset_tenses (preset_id,tense_id,sort_order)
        VALUES (?,?,?)
      `, [preset.id, tenseId, tenseOrder + 1])
    }
  }
  return inserted
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()
  const connection = await database.getConnection()
  try {
    const [[tables]] = await connection.query<CountRow[]>(`
      SELECT COUNT(*) AS count FROM information_schema.tables
      WHERE table_schema=DATABASE() AND table_name IN (
        'verbes','verbesconjugues','challenge_preset_categories',
        'challenge_presets','challenge_preset_tenses','familles_conjugaison',
        'temps','modes','verbe_sens','verbe_sens_categories','categories_semantiques'
      )
    `)
    if (Number(tables?.count) !== 11) {
      console.info('[database] Défis scolaires français différés : tables prérequises absentes.')
      return
    }

    await connection.beginTransaction()
    const insertedVerbs = await ensureMissingVerbs(connection)
    const insertedPresets = await ensureFrenchSchoolPresets(connection)
    await connection.commit()
    console.info(
      `[database] Niveaux scolaires français disponibles : 9 défis`
      + ` (${insertedPresets} ajouté${insertedPresets > 1 ? 's' : ''}),`
      + ` ${insertedVerbs} verbe${insertedVerbs > 1 ? 's' : ''} ajouté${insertedVerbs > 1 ? 's' : ''}.`,
    )
  }
  catch (error) {
    try { await connection.rollback() } catch {}
    console.error('[database] Échec de la migration des niveaux scolaires français.', error)
  }
  finally {
    connection.release()
  }
})
