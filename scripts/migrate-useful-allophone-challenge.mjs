import {
  challengePresetDefinitions,
  usefulAllophoneChallengeId,
  usefulAllophoneVerbInfinitives,
} from '../shared/data/challenge-presets.ts'

export async function migrateUsefulAllophoneChallenge(connection) {
  const definition = challengePresetDefinitions.find(preset => preset.id === usefulAllophoneChallengeId)
  if (!definition) throw new Error('Définition du défi pour allophones introuvable.')
  if (new Set(usefulAllophoneVerbInfinitives).size !== 100) {
    throw new Error('Le défi pour allophones doit contenir exactement 100 verbes distincts.')
  }

  const [[category]] = await connection.execute(
    'SELECT id FROM challenge_preset_categories WHERE slug=? LIMIT 1 FOR UPDATE',
    [definition.group],
  )
  if (!category) throw new Error('Catégorie CIF (FLE) introuvable.')

  await connection.execute(`INSERT INTO challenge_presets
    (preset_key,category_id,name,description,question_count,exercise_kind,
     past_simple_pronouns,inclusive_pronouns,complement_options,
     verb_selection_mode,criteria_json,sort_order,is_active)
    VALUES (?,?,?,?,?,'conjugation','all',0,'[]','criteria',?,32767,1)
    ON DUPLICATE KEY UPDATE
      category_id=VALUES(category_id),name=VALUES(name),description=VALUES(description),
      question_count=VALUES(question_count),exercise_kind='conjugation',
      past_simple_pronouns='all',inclusive_pronouns=0,complement_options='[]',
      verb_selection_mode='criteria',criteria_json=VALUES(criteria_json),sort_order=32767,is_active=1`, [
    definition.id,
    category.id,
    definition.label,
    definition.description,
    definition.questionCount,
    JSON.stringify(definition.criteria),
  ])

  const [[preset]] = await connection.execute(
    'SELECT id FROM challenge_presets WHERE preset_key=? LIMIT 1 FOR UPDATE',
    [definition.id],
  )
  if (!preset) throw new Error('Impossible de retrouver le défi pour allophones.')

  await connection.execute('DELETE FROM challenge_preset_verbs WHERE preset_id=?', [preset.id])
  await connection.execute('DELETE FROM challenge_preset_tenses WHERE preset_id=?', [preset.id])
  for (const [index, tenseId] of definition.tenseIds.entries()) {
    await connection.execute(
      'INSERT INTO challenge_preset_tenses (preset_id,tense_id,sort_order) VALUES (?,?,?)',
      [preset.id, tenseId, index],
    )
  }

  return {
    presetId: Number(preset.id),
    verbCount: usefulAllophoneVerbInfinitives.length,
    tenseCount: definition.tenseIds.length,
  }
}
