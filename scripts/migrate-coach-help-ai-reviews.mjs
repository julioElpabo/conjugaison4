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
  await database.execute(`CREATE TABLE IF NOT EXISTS coach_help_automatic_reviews (
    help_id INT UNSIGNED NOT NULL,
    verb_id INT NOT NULL,
    status ENUM('approved','rejected') NOT NULL,
    audit_version VARCHAR(64) NOT NULL,
    help_updated_at DATETIME NOT NULL,
    help_fingerprint CHAR(64) NOT NULL,
    verb_fingerprint CHAR(64) NOT NULL,
    checked_cases INT UNSIGNED NOT NULL DEFAULT 0,
    total_cases INT UNSIGNED NOT NULL DEFAULT 0,
    checked_signatures INT UNSIGNED NOT NULL DEFAULT 0,
    issue_count INT UNSIGNED NOT NULL DEFAULT 0,
    review_layers JSON NOT NULL,
    issues_json JSON NOT NULL,
    reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (help_id,verb_id),
    KEY idx_help_automatic_status (help_id,status),
    KEY idx_help_automatic_verb (verb_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.execute(`CREATE TABLE IF NOT EXISTS coach_help_verb_reviews (
    help_id INT UNSIGNED NOT NULL,
    verb_id INT NOT NULL,
    status ENUM('approved','rejected') NOT NULL,
    audit_version VARCHAR(64) NOT NULL,
    help_updated_at DATETIME NOT NULL,
    help_fingerprint CHAR(64) NOT NULL,
    verb_fingerprint CHAR(64) NOT NULL,
    checked_cases INT UNSIGNED NOT NULL DEFAULT 0,
    total_cases INT UNSIGNED NOT NULL DEFAULT 0,
    checked_signatures INT UNSIGNED NOT NULL DEFAULT 0,
    issue_count INT UNSIGNED NOT NULL DEFAULT 0,
    review_layers JSON NOT NULL,
    issues_json JSON NOT NULL,
    reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (help_id,verb_id),
    KEY idx_help_review_status (help_id,status),
    KEY idx_help_review_verb (verb_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  console.log('Tables des audits automatiques et des revues IA prêtes.')
} finally {
  await database.end()
}
