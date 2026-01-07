-- Script pour vérifier la structure de la table etablissements
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'etablissements'
  AND table_schema = 'public'
ORDER BY ordinal_position;
