-- Vérifier le format des départements dans la base

-- Voir les différents formats de départements pour l'Aisne
SELECT DISTINCT 
  departement,
  COUNT(*) as nombre
FROM etablissements
WHERE code_postal LIKE '02%'
GROUP BY departement
ORDER BY nombre DESC;

-- Voir quelques exemples
SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE code_postal LIKE '02%'
LIMIT 10;

-- Vérifier tous les formats de départements dans la base
SELECT DISTINCT 
  departement,
  COUNT(*) as nombre
FROM etablissements
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement;
