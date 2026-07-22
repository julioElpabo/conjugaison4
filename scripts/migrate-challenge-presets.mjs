import mysql from 'mysql2/promise'
import {
  challengePresetDefinitions,
  challengePresetGroupLabels,
  challengePresetGroupOrder,
} from '../shared/data/challenge-presets.ts'
import { legacyComplementOptions } from '../shared/utils/complement-options.ts'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  await database.query(`CREATE TABLE IF NOT EXISTS challenge_preset_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS challenge_presets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    preset_key VARCHAR(80) NOT NULL UNIQUE,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    question_count SMALLINT UNSIGNED NOT NULL DEFAULT 20,
    exercise_kind VARCHAR(40) NOT NULL DEFAULT 'conjugation',
    past_simple_pronouns VARCHAR(40) NOT NULL DEFAULT 'all',
    inclusive_pronouns TINYINT(1) NOT NULL DEFAULT 0,
    complement_options JSON NOT NULL,
    verb_selection_mode ENUM('criteria','explicit') NOT NULL DEFAULT 'criteria',
    criteria_json JSON NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge_preset_category FOREIGN KEY (category_id)
      REFERENCES challenge_preset_categories(id),
    INDEX idx_challenge_presets_public (is_active, category_id, sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS challenge_preset_verbs (
    preset_id INT UNSIGNED NOT NULL,
    selection_id INT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (preset_id, selection_id),
    CONSTRAINT fk_challenge_preset_verb_preset FOREIGN KEY (preset_id)
      REFERENCES challenge_presets(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS challenge_preset_tenses (
    preset_id INT UNSIGNED NOT NULL,
    tense_id INT UNSIGNED NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (preset_id, tense_id),
    CONSTRAINT fk_challenge_preset_tense_preset FOREIGN KEY (preset_id)
      REFERENCES challenge_presets(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.beginTransaction()
  for (const [sortOrder, slug] of challengePresetGroupOrder.entries()) {
    await database.execute(`INSERT INTO challenge_preset_categories
      (slug,name,description,sort_order,is_active) VALUES (?,?,?, ?,1)
      ON DUPLICATE KEY UPDATE slug=slug`, [
      slug,
      challengePresetGroupLabels[slug] ?? slug,
      '',
      sortOrder,
    ])
  }

  for (const [sortOrder, definition] of challengePresetDefinitions.entries()) {
    const [[category]] = await database.execute(
      'SELECT id FROM challenge_preset_categories WHERE slug=? LIMIT 1',
      [definition.group],
    )
    const includeComplements = definition.includeComplements ?? false
    const placement = definition.complementPlacement ?? 'after'
    await database.execute(`INSERT INTO challenge_presets
      (preset_key,category_id,name,description,question_count,exercise_kind,
       past_simple_pronouns,inclusive_pronouns,complement_options,
       verb_selection_mode,criteria_json,sort_order,is_active)
      VALUES (?,?,?,?,?,'conjugation','all',0,?,'criteria',?,?,1)
      ON DUPLICATE KEY UPDATE preset_key=preset_key`, [
      definition.id,
      category.id,
      definition.label,
      definition.description,
      definition.questionCount,
      JSON.stringify(legacyComplementOptions(includeComplements, placement)),
      JSON.stringify(definition.criteria),
      sortOrder,
    ])
    const [[preset]] = await database.execute(
      'SELECT id FROM challenge_presets WHERE preset_key=? LIMIT 1',
      [definition.id],
    )
    const [[tenseCount]] = await database.execute(
      'SELECT COUNT(*) AS total FROM challenge_preset_tenses WHERE preset_id=?',
      [preset.id],
    )
    if (Number(tenseCount.total) === 0) {
      for (const [tenseOrder, tenseId] of definition.tenseIds.entries()) {
        await database.execute(`INSERT INTO challenge_preset_tenses
          (preset_id,tense_id,sort_order) VALUES (?,?,?)`, [preset.id, tenseId, tenseOrder])
      }
    }
  }

  const [categories] = await database.execute('SELECT id FROM challenge_preset_categories ORDER BY sort_order,id')
  for (const category of categories) {
    const [presets] = await database.execute(
      'SELECT id FROM challenge_presets WHERE category_id=? ORDER BY sort_order,name,id',
      [category.id],
    )
    for (const [index, preset] of presets.entries()) {
      await database.execute('UPDATE challenge_presets SET sort_order=? WHERE id=?', [index + 1, preset.id])
    }
  }
  await database.commit()

  const [[summary]] = await database.query(`SELECT
    (SELECT COUNT(*) FROM challenge_preset_categories) AS categories,
    (SELECT COUNT(*) FROM challenge_presets) AS presets,
    (SELECT COUNT(*) FROM challenge_preset_tenses) AS tenses`)
  console.log(`Défis pré-enregistrés : ${summary.presets} défis dans ${summary.categories} catégories, ${summary.tenses} associations de temps.`)
} catch (error) {
  try { await database.rollback() } catch {}
  throw error
} finally {
  await database.end()
}
