-- Vérifier le résultat de la normalisation des départements

-- Tous les départements avec leur nombre d'établissements
SELECT 
  departement,
  COUNT(*) as nombre_etablissements
FROM etablissements
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement;

-- Compter combien ont le bon format
SELECT 
  CASE 
    WHEN departement ~ '^.+ \(\d+\)$' THEN 'Format correct: Nom (XX)'
    WHEN departement ~ '^\d+$' THEN 'Format incorrect: code seul'
    WHEN departement LIKE 'Département (%' THEN 'Format incorrect: Département (XX)'
    ELSE 'Autre format'
  END as format_type,
  COUNT(*) as nombre
FROM etablissements
WHERE departement IS NOT NULL
GROUP BY format_type;
