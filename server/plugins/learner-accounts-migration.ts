import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'
import { LEARNER_ERROR_TAXONOMY } from '~~/shared/utils/learner-error-diagnostics'
import { CURRENT_PRIVACY_NOTICE_VERSION } from '~~/shared/data/privacy-notice'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL,
        username_normalized VARCHAR(80) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        recovery_code_hash VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        session_version INT UNSIGNED NOT NULL DEFAULT 1,
        privacy_notice_version VARCHAR(30) NOT NULL DEFAULT '${CURRENT_PRIVACY_NOTICE_VERSION}',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME NULL,
        activated_at DATETIME NULL,
        deletion_scheduled_at DATETIME NULL,
        deleted_at DATETIME NULL,
        UNIQUE KEY uq_learner_accounts_username (username_normalized),
        KEY idx_learner_accounts_status_created (status, created_at),
        KEY idx_learner_accounts_deletion (deletion_scheduled_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        session_version INT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        UNIQUE KEY uq_learner_sessions_token (token_hash),
        KEY idx_learner_sessions_account (account_id),
        KEY idx_learner_sessions_expiry (expires_at),
        CONSTRAINT fk_learner_sessions_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_registration_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        bucket VARCHAR(50) NOT NULL,
        request_count INT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_learner_rate_limits_updated (updated_at),
        KEY idx_learner_rate_limits_bucket (bucket)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_challenge_runs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        client_run_id VARCHAR(100) NOT NULL,
        challenge_fingerprint CHAR(64) NOT NULL,
        challenge_label VARCHAR(160) NOT NULL,
        challenge_config_json LONGTEXT NOT NULL,
        presentation VARCHAR(20) NOT NULL,
        is_review TINYINT(1) NOT NULL DEFAULT 0,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_answered_at DATETIME NULL,
        completed_at DATETIME NULL,
        correct_count INT UNSIGNED NOT NULL DEFAULT 0,
        incorrect_count INT UNSIGNED NOT NULL DEFAULT 0,
        UNIQUE KEY uq_learner_runs_client (account_id, client_run_id),
        KEY idx_learner_runs_account_activity (account_id, last_answered_at),
        KEY idx_learner_runs_challenge (account_id, challenge_fingerprint, last_answered_at),
        CONSTRAINT fk_learner_runs_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_answer_attempts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        run_id BIGINT UNSIGNED NOT NULL,
        client_attempt_id VARCHAR(100) NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        form_key CHAR(64) NOT NULL,
        verb_id BIGINT UNSIGNED NULL,
        tense_id BIGINT UNSIGNED NULL,
        person_id BIGINT UNSIGNED NULL,
        infinitive VARCHAR(100) NOT NULL,
        tense_label VARCHAR(100) NOT NULL,
        mode_label VARCHAR(100) NOT NULL,
        question_json LONGTEXT NOT NULL,
        learner_answer VARCHAR(500) NOT NULL,
        is_correct TINYINT(1) NOT NULL,
        answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_attempt_client (run_id, client_attempt_id),
        KEY idx_learner_attempt_run_date (run_id, answered_at),
        KEY idx_learner_attempt_form (run_id, form_key, answered_at),
        CONSTRAINT fk_learner_attempt_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_error_types (
        code VARCHAR(80) NOT NULL PRIMARY KEY,
        domain VARCHAR(80) NOT NULL,
        label VARCHAR(160) NOT NULL,
        advice VARCHAR(500) NOT NULL,
        taxonomy_version VARCHAR(30) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_learner_error_types_domain (domain, active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    for (const errorType of LEARNER_ERROR_TAXONOMY) {
      await database.execute(`
        INSERT INTO learner_error_types
          (code, domain, label, advice, taxonomy_version, active)
        VALUES (?, ?, ?, ?, '1', 1)
        ON DUPLICATE KEY UPDATE domain=VALUES(domain), label=VALUES(label),
          advice=VALUES(advice), taxonomy_version=VALUES(taxonomy_version), active=1
      `, [errorType.code, errorType.domain, errorType.label, errorType.advice])
    }
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_attempt_error_tags (
        attempt_id BIGINT UNSIGNED NOT NULL,
        error_type_code VARCHAR(80) NOT NULL,
        is_primary TINYINT(1) NOT NULL DEFAULT 0,
        confidence VARCHAR(10) NOT NULL,
        is_initial TINYINT(1) NOT NULL DEFAULT 1,
        detector_version VARCHAR(30) NOT NULL,
        evidence_json LONGTEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (attempt_id, error_type_code),
        KEY idx_learner_error_tags_type_date (error_type_code, created_at),
        CONSTRAINT fk_learner_error_tags_attempt
          FOREIGN KEY (attempt_id) REFERENCES learner_answer_attempts(id) ON DELETE CASCADE,
        CONSTRAINT fk_learner_error_tags_type
          FOREIGN KEY (error_type_code) REFERENCES learner_error_types(code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_skill_daily_stats (
        account_id BIGINT UNSIGNED NOT NULL,
        stat_date DATE NOT NULL,
        error_type_code VARCHAR(80) NOT NULL,
        opportunities INT UNSIGNED NOT NULL DEFAULT 0,
        errors INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (account_id, stat_date, error_type_code),
        KEY idx_learner_skill_stats_account_type (account_id, error_type_code, stat_date),
        CONSTRAINT fk_learner_skill_stats_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_learner_skill_stats_type
          FOREIGN KEY (error_type_code) REFERENCES learner_error_types(code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_run_forms (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        run_id BIGINT UNSIGNED NOT NULL,
        form_key CHAR(64) NOT NULL,
        last_client_attempt_id VARCHAR(100) NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        verb_id BIGINT UNSIGNED NULL,
        tense_id BIGINT UNSIGNED NULL,
        person_id BIGINT UNSIGNED NULL,
        infinitive VARCHAR(100) NOT NULL,
        tense_label VARCHAR(100) NOT NULL,
        mode_label VARCHAR(100) NOT NULL,
        question_json LONGTEXT NULL,
        attempt_count INT UNSIGNED NOT NULL DEFAULT 1,
        incorrect_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_mastered TINYINT(1) NOT NULL DEFAULT 0,
        first_answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_run_forms (run_id, form_key),
        KEY idx_learner_run_forms_status (run_id, is_mastered, last_answered_at),
        CONSTRAINT fk_learner_run_forms_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_run_questions (
        run_id BIGINT UNSIGNED NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        question_json LONGTEXT NOT NULL,
        result_status VARCHAR(12) NULL,
        attempt_number TINYINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (run_id, question_index),
        CONSTRAINT fk_learner_run_questions_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    const [runQuestionColumns] = await database.query<Array<RowDataPacket & { Field: string }>>(
      'SHOW COLUMNS FROM learner_run_questions',
    )
    const runQuestionColumnNames = new Set(runQuestionColumns.map(column => column.Field))
    if (!runQuestionColumnNames.has('result_status')) {
      await database.query(
        'ALTER TABLE learner_run_questions ADD COLUMN result_status VARCHAR(12) NULL AFTER question_json',
      )
    }
    if (!runQuestionColumnNames.has('attempt_number')) {
      await database.query(
        'ALTER TABLE learner_run_questions ADD COLUMN attempt_number TINYINT UNSIGNED NULL AFTER result_status',
      )
    }
    await database.query(`
      INSERT IGNORE INTO learner_run_forms
        (run_id, form_key, last_client_attempt_id, question_index, verb_id,
         tense_id, person_id, infinitive, tense_label, mode_label, question_json,
         attempt_count, incorrect_count, is_mastered, first_answered_at,
         last_answered_at)
      SELECT latest.run_id, latest.form_key, latest.client_attempt_id,
             latest.question_index, latest.verb_id, latest.tense_id,
             latest.person_id, latest.infinitive, latest.tense_label,
             latest.mode_label,
             IF(latest.is_correct = 0, latest.question_json, NULL),
             summary.attempt_count, summary.incorrect_count, latest.is_correct,
             summary.first_answered_at, summary.last_answered_at
      FROM learner_answer_attempts latest
      INNER JOIN (
        SELECT run_id, form_key, MAX(id) AS latest_id, COUNT(*) AS attempt_count,
               SUM(is_correct = 0) AS incorrect_count,
               MIN(answered_at) AS first_answered_at,
               MAX(answered_at) AS last_answered_at
        FROM learner_answer_attempts
        GROUP BY run_id, form_key
      ) summary ON summary.latest_id = latest.id
    `)
    await database.query(`
      UPDATE learner_run_questions q
      INNER JOIN learner_run_forms f
        ON f.run_id=q.run_id AND f.question_index=q.question_index
      SET q.result_status=IF(f.is_mastered=1, 'correct', 'incorrect'),
          q.attempt_number=IF(f.attempt_count > 1, 2, 1)
      WHERE q.result_status IS NULL
    `)
    await database.query(`
      UPDATE learner_challenge_runs runs
      INNER JOIN (
        SELECT run_id, MAX(question_index) + 1 AS question_count
        FROM learner_run_questions
        GROUP BY run_id
        HAVING SUM(result_status IS NULL) > 0
      ) review_plan ON review_plan.run_id=runs.id
      SET runs.challenge_config_json=JSON_SET(
        runs.challenge_config_json,
        '$.questionCount',
        review_plan.question_count
      )
      WHERE runs.is_review=1
    `)
    await database.query(`
      UPDATE learner_challenge_runs runs
      SET runs.completed_at=NULL
      WHERE runs.completed_at IS NOT NULL
        AND (
          SELECT COUNT(*)
          FROM learner_run_questions answered_questions
          WHERE answered_questions.run_id=runs.id
            AND answered_questions.question_index < GREATEST(
              1,
              COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
                runs.challenge_config_json,
                '$.questionCount'
              )) AS UNSIGNED), 1)
            )
            AND answered_questions.result_status IN ('correct', 'incorrect')
        ) < GREATEST(
          1,
          COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
            runs.challenge_config_json,
            '$.questionCount'
          )) AS UNSIGNED), 1)
        )
    `)
    await database.query('DELETE FROM learner_answer_attempts WHERE is_correct = 1')
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_login_events (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        event_type VARCHAR(20) NOT NULL DEFAULT 'login',
        occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_learner_login_events_account_date (account_id, occurred_at),
        CONSTRAINT fk_learner_login_events_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_preferences (
        account_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        interface_locale VARCHAR(5) NOT NULL DEFAULT 'fr',
        color_theme VARCHAR(10) NOT NULL DEFAULT 'light',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_learner_preferences_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query('DELETE FROM learner_sessions WHERE expires_at < CURRENT_TIMESTAMP')
    await database.query(
      "DELETE FROM learner_accounts WHERE status = 'pending' AND activated_at IS NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL 48 HOUR"
    )
    await database.query(
      'DELETE FROM learner_registration_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 2 DAY'
    )
    console.info('[learner] Comptes pseudonymes et protections disponibles.')
  } catch (error) {
    console.error('[learner] Échec de la préparation des comptes pseudonymes.', error)
  }
})
