-- Corrige les formes signalées au présent de l'indicatif
-- pour appeler, rappeler et élever. La requête est idempotente : seules les
-- graphies fautives exactes sont modifiées.

START TRANSACTION;

UPDATE verbesconjugues AS vc
INNER JOIN verbes AS v ON v.id = vc.verbe_id
INNER JOIN personnes AS p ON p.id = vc.personne_id
INNER JOIN temps AS t ON t.id = vc.temp_id
INNER JOIN modes AS m ON m.id = t.mode_id
SET vc.conjugaison1 = CASE v.infinitif
  WHEN 'appeler' THEN 'appelons'
  WHEN 'rappeler' THEN 'rappelons'
  WHEN 'élever' THEN 'élève'
  ELSE vc.conjugaison1
END
WHERE m.name = 'indicatif'
  AND t.name = 'présent'
  AND (
    (v.infinitif = 'appeler' AND vc.conjugaison1 = 'appellons')
    OR (v.infinitif = 'rappeler' AND vc.conjugaison1 = 'rappellons')
    OR (v.infinitif = 'élever' AND p.pronom = 'il' AND vc.conjugaison1 = 'élèves')
  );

COMMIT;

-- Contrôle après correction.
SELECT
  v.infinitif,
  p.pronom,
  m.name AS mode,
  t.name AS temps,
  vc.conjugaison1
FROM verbesconjugues AS vc
INNER JOIN verbes AS v ON v.id = vc.verbe_id
INNER JOIN personnes AS p ON p.id = vc.personne_id
INNER JOIN temps AS t ON t.id = vc.temp_id
INNER JOIN modes AS m ON m.id = t.mode_id
WHERE v.infinitif IN ('appeler', 'rappeler', 'élever')
  AND ((v.infinitif IN ('appeler', 'rappeler') AND p.pronom = 'nous')
    OR (v.infinitif = 'élever' AND p.pronom = 'il'))
  AND m.name = 'indicatif'
  AND t.name = 'présent'
ORDER BY v.infinitif;
