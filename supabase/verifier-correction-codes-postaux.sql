-- Vérification après correction des codes postaux

-- 1. Vérifier qu'il n'y a plus de codes postaux à 4 chiffres
SELECT 
  'Codes postaux à 4 chiffres restants' as statut,
  COUNT(*) as nombre
FROM etablissements
WHERE LENGTH(code_postal) = 4;

-- 2. Vérifier les départements 01-09
SELECT 
  departement,
  region,
  COUNT(*) as nombre,
  MIN(code_postal) as code_min,
  MAX(code_postal) as code_max
FROM etablissements
WHERE departement IN ('Ain (01)', 'Aisne (02)', 'Allier (03)', 'Alpes-de-Haute-Provence (04)', 
                      'Hautes-Alpes (05)', 'Alpes-Maritimes (06)', 'Ardèche (07)', 
                      'Ardennes (08)', 'Ariège (09)')
GROUP BY departement, region
ORDER BY departement;

-- 3. Voir quelques exemples pour l'Aisne (02)
SELECT 
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE departement = 'Aisne (02)'
LIMIT 5;

-- 4. Compter tous les établissements avec codes postaux commençant par 0
SELECT 
  'Total établissements avec code postal 0X' as info,
  COUNT(*) as nombre
FROM etablissements
WHERE code_postal LIKE '0%';

-- 5. Vérifier s'il reste des anomalies
SELECT 
  'Codes postaux avec points' as anomalie,
  COUNT(*) as nombre
FROM etablissements
WHERE code_postal LIKE '%.%'
UNION ALL
SELECT 
  'Codes postaux NULL' as anomalie,
  COUNT(*) as nombre
FROM etablissements
WHERE code_postal IS NULL;
