import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  await database.execute(`CREATE TABLE IF NOT EXISTS coach_help_feedback (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    feedback_type ENUM('useful','unclear','error','remark') NOT NULL,
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
    KEY idx_coach_help_feedback_moderation (moderation_status, deleted_at)
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

  console.log('Table coach_help_feedback prête.')
}
finally {
  await database.end()
}
