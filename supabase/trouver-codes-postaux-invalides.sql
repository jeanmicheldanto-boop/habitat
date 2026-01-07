-- Trouver les codes postaux invalides

-- 1. Chercher "nan" et autres valeurs invalides
SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE code_postal IN ('nan', 'NaN', 'null', 'NULL', '')
   OR code_postal IS NULL
   OR code_postal !~ '^\d{5}$'  -- Pas exactement 5 chiffres
LIMIT 50;

-- 2. Compter par type d'anomalie
SELECT 
  CASE 
    WHEN code_postal IS NULL THEN 'NULL'
    WHEN code_postal IN ('nan', 'NaN') THEN 'nan'
    WHEN code_postal = '' THEN 'vide'
    WHEN LENGTH(code_postal) != 5 THEN 'longueur incorrecte'
    WHEN code_postal !~ '^\d+$' THEN 'contient non-chiffres'
    ELSE 'autre'
  END as type_anomalie,
  COUNT(*) as nombre
FROM etablissements
WHERE code_postal IN ('nan', 'NaN', 'null', 'NULL', '')
   OR code_postal IS NULL
   OR code_postal !~ '^\d{5}$'
GROUP BY type_anomalie;
