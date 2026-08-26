-- Remplace les phrases artificielles comme « nous avions mon idée »
-- tout en conservant au moins dix COD naturels pour le verbe avoir.
UPDATE complements_verbaux AS complement
INNER JOIN constructions_verbales AS construction ON construction.id = complement.construction_id
INNER JOIN verbe_sens AS meaning ON meaning.id = construction.sens_id
INNER JOIN verbes AS verb ON verb.id = meaning.verbe_id
SET complement.texte = CASE complement.texte
      WHEN 'mon idée' THEN 'une bonne raison'
      WHEN 'ton idée' THEN 'une grande envie'
      WHEN 'son idée' THEN 'une nouvelle occasion'
      WHEN 'notre idée' THEN 'une forte motivation'
      WHEN 'votre idée' THEN 'une vraie possibilité'
      WHEN 'leur idée' THEN 'une priorité'
    END,
    complement.actif = 1
WHERE verb.infinitif = 'avoir'
  AND complement.texte IN ('mon idée', 'ton idée', 'son idée', 'notre idée', 'votre idée', 'leur idée');
