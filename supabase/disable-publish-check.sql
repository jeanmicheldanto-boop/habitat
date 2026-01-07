-- ========================================
-- VÉRIFIER LA FONCTION can_publish
-- ========================================

-- 1. Voir la définition de la fonction
SELECT 
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'can_publish';

-- 2. Désactiver temporairement la contrainte pour tester
ALTER TABLE etablissements
  DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 3. Vérifier que la contrainte est supprimée
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'etablissements'::regclass
  AND contype = 'c';
