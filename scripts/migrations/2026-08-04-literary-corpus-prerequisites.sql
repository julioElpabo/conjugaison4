-- Références grammaticales nécessaires au corpus littéraire.
-- Migration idempotente : elle ne dépend d'aucun identifiant numérique local.

INSERT INTO modes (code, name, `order`)
SELECT 'infinitive', 'infinitif', 60
WHERE NOT EXISTS (
  SELECT 1 FROM modes WHERE code='infinitive' OR name='infinitif'
);

INSERT INTO modes (code, name, `order`)
SELECT 'gerund', 'gérondif', 50
WHERE NOT EXISTS (
  SELECT 1 FROM modes WHERE code='gerund' OR name='gérondif'
);

INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
SELECT mode.id, 'present', 'présent', 0, 0
FROM modes mode
WHERE (mode.code='infinitive' OR mode.name='infinitif')
  AND NOT EXISTS (
    SELECT 1 FROM temps tense
    WHERE tense.mode_id=mode.id AND (tense.code='present' OR tense.name='présent')
  )
ORDER BY mode.id LIMIT 1;

INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
SELECT mode.id, 'past', 'passé', 1, 0
FROM modes mode
WHERE (mode.code='infinitive' OR mode.name='infinitif')
  AND NOT EXISTS (
    SELECT 1 FROM temps tense
    WHERE tense.mode_id=mode.id AND (tense.code='past' OR tense.name='passé')
  )
ORDER BY mode.id LIMIT 1;

INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
SELECT mode.id, 'present', 'présent', 0, 0
FROM modes mode
WHERE (mode.code='gerund' OR mode.name='gérondif')
  AND NOT EXISTS (
    SELECT 1 FROM temps tense
    WHERE tense.mode_id=mode.id AND (tense.code='present' OR tense.name='présent')
  )
ORDER BY mode.id LIMIT 1;

INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
SELECT mode.id, 'past', 'passé', 1, 0
FROM modes mode
WHERE (mode.code='gerund' OR mode.name='gérondif')
  AND NOT EXISTS (
    SELECT 1 FROM temps tense
    WHERE tense.mode_id=mode.id AND (tense.code='past' OR tense.name='passé')
  )
ORDER BY mode.id LIMIT 1;

-- Contrôle attendu : quatre lignes, quels que soient leurs identifiants.
SELECT mode.code AS mode_code, mode.name AS mode_name,
       tense.code AS tense_code, tense.name AS tense_name
FROM modes mode
INNER JOIN temps tense ON tense.mode_id=mode.id
WHERE (mode.code IN ('infinitive','gerund') OR mode.name IN ('infinitif','gérondif'))
ORDER BY mode.`order`, tense.isTempsCompose, tense.id;
