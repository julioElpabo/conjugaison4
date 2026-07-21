import mysql from 'mysql2/promise'

const databaseConfig = {
  host: process.env.NUXT_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.NUXT_DB_PORT || process.env.DB_PORT || 3306),
  database: process.env.NUXT_DB_NAME || process.env.DB_NAME,
  user: process.env.NUXT_DB_USER || process.env.DB_USER,
  password: process.env.NUXT_DB_PASSWORD || process.env.DB_PASSWORD,
  charset: 'utf8mb4',
}

const missingVariables = [
  ['NUXT_DB_HOST', databaseConfig.host],
  ['NUXT_DB_NAME', databaseConfig.database],
  ['NUXT_DB_USER', databaseConfig.user],
  ['NUXT_DB_PASSWORD', databaseConfig.password],
].filter(([, value]) => !value).map(([name]) => name)

if (missingVariables.length) {
  throw new Error(`Variables de base de données absentes : ${missingVariables.join(', ')}`)
}

const database = await mysql.createConnection(databaseConfig)

try {
  await database.execute(`CREATE TABLE IF NOT EXISTS coach_help_feedback (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    feedback_type ENUM('useful','unclear','error','remark') NOT NULL,
    origin ENUM('user','automatic') NOT NULL DEFAULT 'user',
    error_code VARCHAR(120) NULL,
    severity ENUM('warning','error') NULL,
    fingerprint CHAR(64) NULL,
    occurrence_count INT UNSIGNED NOT NULL DEFAULT 1,
    first_seen_at TIMESTAMP NULL DEFAULT NULL,
    last_seen_at TIMESTAMP NULL DEFAULT NULL,
    comment TEXT NULL,
    session_id VARCHAR(120) NULL,
    exercise_run_id VARCHAR(120) NULL,
    question_number INT UNSIGNED NULL,
    help_id INT UNSIGNED NULL,
    help_name VARCHAR(120) NULL,
    coach_id INT UNSIGNED NULL,
    coach_name VARCHAR(120) NULL,
    verb_id INT UNSIGNED NULL,
    verb VARCHAR(120) NULL,
    tense_id INT UNSIGNED NULL,
    tense VARCHAR(120) NULL,
    mode VARCHAR(120) NULL,
    person VARCHAR(80) NULL,
    expected_answer VARCHAR(300) NULL,
    context_json LONGTEXT NULL,
    question_json LONGTEXT NULL,
    exercise_context_json LONGTEXT NULL,
    attempts_json LONGTEXT NULL,
    messages_json LONGTEXT NULL,
    displayed_help_json LONGTEXT NULL,
    displayed_help_html LONGTEXT NULL,
    ui_context_json LONGTEXT NULL,
    user_agent VARCHAR(500) NULL,
    validation_status ENUM('unvalidated','validated') NOT NULL DEFAULT 'unvalidated',
    validated_at TIMESTAMP NULL DEFAULT NULL,
    moderation_status ENUM('active','removed') NOT NULL DEFAULT 'active',
    moderation_note VARCHAR(500) NULL,
    moderated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_coach_help_feedback_created (created_at),
    KEY idx_coach_help_feedback_type (feedback_type),
    KEY idx_coach_help_feedback_context (verb_id, tense_id, feedback_type),
    KEY idx_coach_help_feedback_session (session_id),
    KEY idx_coach_help_feedback_moderation (moderation_status, deleted_at),
    KEY idx_coach_help_feedback_origin_status (origin, validation_status, moderation_status),
    UNIQUE KEY uq_coach_help_feedback_fingerprint (fingerprint)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  async function addColumnIfMissing(column, definition) {
    const [columns] = await database.query(`SHOW COLUMNS FROM coach_help_feedback LIKE ${database.escape(column)}`)
    if (!columns.length) await database.execute(`ALTER TABLE coach_help_feedback ADD COLUMN ${definition}`)
  }

  async function addIndexIfMissing(indexName, definition) {
    const [indexes] = await database.query(`SHOW INDEX FROM coach_help_feedback WHERE Key_name = ${database.escape(indexName)}`)
    if (!indexes.length) await database.execute(`ALTER TABLE coach_help_feedback ADD ${definition}`)
  }

  await addColumnIfMissing('session_id', 'session_id VARCHAR(120) NULL AFTER comment')
  await addColumnIfMissing('origin', "origin ENUM('user','automatic') NOT NULL DEFAULT 'user' AFTER feedback_type")
  await addColumnIfMissing('error_code', 'error_code VARCHAR(120) NULL AFTER origin')
  await addColumnIfMissing('severity', "severity ENUM('warning','error') NULL AFTER error_code")
  await addColumnIfMissing('fingerprint', 'fingerprint CHAR(64) NULL AFTER severity')
  await addColumnIfMissing('occurrence_count', 'occurrence_count INT UNSIGNED NOT NULL DEFAULT 1 AFTER fingerprint')
  await addColumnIfMissing('first_seen_at', 'first_seen_at TIMESTAMP NULL DEFAULT NULL AFTER occurrence_count')
  await addColumnIfMissing('last_seen_at', 'last_seen_at TIMESTAMP NULL DEFAULT NULL AFTER first_seen_at')
  await addColumnIfMissing('exercise_run_id', 'exercise_run_id VARCHAR(120) NULL AFTER session_id')
  await addColumnIfMissing('question_json', 'question_json LONGTEXT NULL AFTER context_json')
  await addColumnIfMissing('exercise_context_json', 'exercise_context_json LONGTEXT NULL AFTER question_json')
  await addColumnIfMissing('attempts_json', 'attempts_json LONGTEXT NULL AFTER exercise_context_json')
  await addColumnIfMissing('messages_json', 'messages_json LONGTEXT NULL AFTER attempts_json')
  await addColumnIfMissing('displayed_help_json', 'displayed_help_json LONGTEXT NULL AFTER messages_json')
  await addColumnIfMissing('displayed_help_html', 'displayed_help_html LONGTEXT NULL AFTER displayed_help_json')
  await addColumnIfMissing('ui_context_json', 'ui_context_json LONGTEXT NULL AFTER displayed_help_html')
  await addColumnIfMissing('validation_status', "validation_status ENUM('unvalidated','validated') NOT NULL DEFAULT 'unvalidated' AFTER user_agent")
  await addColumnIfMissing('validated_at', 'validated_at TIMESTAMP NULL DEFAULT NULL AFTER validation_status')
  await addColumnIfMissing('moderation_status', "moderation_status ENUM('active','removed') NOT NULL DEFAULT 'active' AFTER validated_at")
  await addColumnIfMissing('moderation_note', 'moderation_note VARCHAR(500) NULL AFTER moderation_status')
  await addColumnIfMissing('moderated_at', 'moderated_at TIMESTAMP NULL DEFAULT NULL AFTER moderation_note')
  await addColumnIfMissing('deleted_at', 'deleted_at TIMESTAMP NULL DEFAULT NULL AFTER moderated_at')
  await addIndexIfMissing('idx_coach_help_feedback_session', 'KEY idx_coach_help_feedback_session (session_id)')
  await addIndexIfMissing('idx_coach_help_feedback_moderation', 'KEY idx_coach_help_feedback_moderation (moderation_status, deleted_at)')
  await addIndexIfMissing('idx_coach_help_feedback_validation', 'KEY idx_coach_help_feedback_validation (validation_status, created_at)')
  await addIndexIfMissing('idx_coach_help_feedback_origin_status', 'KEY idx_coach_help_feedback_origin_status (origin, validation_status, moderation_status)')
  await addIndexIfMissing('uq_coach_help_feedback_fingerprint', 'UNIQUE KEY uq_coach_help_feedback_fingerprint (fingerprint)')

  console.log('Table coach_help_feedback prête.')
}
finally {
  await database.end()
}
