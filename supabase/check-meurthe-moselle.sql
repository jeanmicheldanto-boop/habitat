-- Vérifier les établissements en Meurthe-et-Moselle (54)

-- Compter les établissements
SELECT COUNT(*) as nombre_etablissements
FROM etablissements
WHERE departement = '54' OR code_postal LIKE '54%';

-- Voir quelques exemples
SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region,
  statut_editorial
FROM etablissements
WHERE departement = '54' OR code_postal LIKE '54%'
LIMIT 10;
