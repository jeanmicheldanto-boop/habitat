-- Afficher les détails des établissements avec codes postaux invalides

SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region,
  adresse_l1,
  adresse_l2
FROM etablissements
WHERE code_postal IN ('nan', 'NaN', 'null', 'NULL', '')
   OR code_postal IS NULL
   OR code_postal !~ '^\d{5}$'
ORDER BY commune;
