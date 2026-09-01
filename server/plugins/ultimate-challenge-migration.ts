import type { RowDataPacket } from 'mysql2/promise'
import {
  challengePresetDefinitions,
  ultimateChallengeId,
} from '../../shared/data/challenge-presets'
import { invalidateCatalogueCache } from '../services/catalogue'
import { useDatabase } from '../utils/database'

interface CategoryRow extends RowDataPacket {
  id: number
  slug: string
}

interface IdRow extends RowDataPacket {
  id: number
}

export default defineNitroPlugin(async () => {
  const definition = challengePresetDefinitions.find(preset => preset.id === ultimateChallengeId)
  if (!definition) return

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()

    const [categoriesBefore] = await connection.query<CategoryRow[]>(`
      SELECT id,slug FROM challenge_preset_categories ORDER BY sort_order,id FOR UPDATE
    `)
    const spellingIndex = categoriesBefore.findIndex(category => category.slug === 'spelling')
    if (spellingIndex < 0) throw new Error('Catégorie « Difficultés particulières » introuvable.')

    await connection.execute(`
      INSERT INTO challenge_preset_categories
        (slug,name,description,sort_order,is_active)
      VALUES ('ultimate','Le défi ultime','Le catalogue complet pour un défi imprévisible.',32767,1)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),description=VALUES(description),is_active=1
    `)

    const [categories] = await connection.query<CategoryRow[]>(`
      SELECT id,slug FROM challenge_preset_categories ORDER BY sort_order,id FOR UPDATE
    `)
    const ultimate = categories.find(category => category.slug === 'ultimate')
    if (!ultimate) throw new Error('Impossible de créer la catégorie « Le défi ultime ».')

    const orderedCategories = categories.filter(category => category.slug !== 'ultimate')
    const currentSpellingIndex = orderedCategories.findIndex(category => category.slug === 'spelling')
    orderedCategories.splice(currentSpellingIndex + 1, 0, ultimate)
    for (const [index, category] of orderedCategories.entries()) {
      await connection.execute(
        'UPDATE challenge_preset_categories SET sort_order=? WHERE id=?',
        [index + 1, category.id],
      )
    }

    await connection.execute(`
      INSERT INTO challenge_presets (
        preset_key,category_id,name,description,question_count,exercise_kind,
        past_simple_pronouns,inclusive_pronouns,complement_options,
        learning_support_mode,verb_selection_mode,criteria_json,sort_order,is_active
      ) VALUES (?,? ,?,?,?,'conjugation','all',0,JSON_ARRAY(),'normal','criteria',?,1,1)
      ON DUPLICATE KEY UPDATE
        category_id=VALUES(category_id),name=VALUES(name),description=VALUES(description),
        question_count=VALUES(question_count),exercise_kind='conjugation',
        past_simple_pronouns='all',inclusive_pronouns=0,complement_options=JSON_ARRAY(),
        learning_support_mode='normal',verb_selection_mode='criteria',
        criteria_json=VALUES(criteria_json),sort_order=1,is_active=1
    `, [
      definition.id,
      ultimate.id,
      definition.label,
      definition.description,
      definition.questionCount,
      JSON.stringify(definition.criteria),
    ])

    const [[preset]] = await connection.query<IdRow[]>(
      'SELECT id FROM challenge_presets WHERE preset_key=? LIMIT 1 FOR UPDATE',
      [definition.id],
    )
    if (!preset) throw new Error('Impossible de créer le défi ultime.')

    await connection.execute('DELETE FROM challenge_preset_verbs WHERE preset_id=?', [preset.id])
    await connection.execute('DELETE FROM challenge_preset_tenses WHERE preset_id=?', [preset.id])
    for (const [index, tenseId] of definition.tenseIds.entries()) {
      await connection.execute(`
        INSERT INTO challenge_preset_tenses (preset_id,tense_id,sort_order)
        VALUES (?,?,?)
      `, [preset.id, tenseId, index + 1])
    }

    await connection.commit()
    invalidateCatalogueCache()
    console.info('[database] Le défi ultime est disponible après les difficultés particulières.')
  }
  catch (error) {
    try { await connection.rollback() } catch {}
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code !== 'ER_NO_SUCH_TABLE') {
      console.error('[database] Échec de la création du défi ultime.', error)
    }
  }
  finally {
    connection.release()
  }
})
