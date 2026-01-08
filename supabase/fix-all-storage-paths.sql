-- ====================================================================
-- MIGRATION GLOBALE : Corriger tous les storage_path dans medias
-- ====================================================================
-- Problème : Les storage_path n'ont pas le préfixe "etablissements/"
-- Solution : Ajouter le préfixe pour tous les chemins incorrects

-- 1. Voir l'état actuel
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN storage_path LIKE 'etablissements/%' OR storage_path LIKE 'medias/%' THEN 1 END) as avec_prefixe,
  COUNT(CASE WHEN storage_path NOT LIKE 'etablissements/%' AND storage_path NOT LIKE 'medias/%' THEN 1 END) as sans_prefixe
FROM medias;

-- 2. Corriger tous les chemins sans préfixe
-- NOTE: On suppose que tous les fichiers sont dans le bucket "etablissements"
-- (puisque l'API upload désormais vers ce bucket)
UPDATE medias
SET storage_path = 'etablissements/' || storage_path
WHERE storage_path NOT LIKE 'etablissements/%'
  AND storage_path NOT LIKE 'medias/%';

-- 3. Vérifier le résultat
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN storage_path LIKE 'etablissements/%' OR storage_path LIKE 'medias/%' THEN 1 END) as avec_prefixe,
  COUNT(CASE WHEN storage_path NOT LIKE 'etablissements/%' AND storage_path NOT LIKE 'medias/%' THEN 1 END) as sans_prefixe
FROM medias;

-- 4. Afficher quelques exemples
SELECT 
  e.nom,
  m.storage_path,
  m.priority
FROM medias m
JOIN etablissements e ON e.id = m.etablissement_id
ORDER BY m.created_at DESC
LIMIT 10;
