-- ========================================
-- VÉRIFIER CONTRAINTES TABLE ETABLISSEMENTS
-- ========================================

-- 1. Colonnes avec NOT NULL
SELECT 
  column_name,
  is_nullable,
  column_default,
  data_type
FROM information_schema.columns
WHERE table_name = 'etablissements'
  AND table_schema = 'public'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 2. Contraintes CHECK
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'etablissements'::regclass
  AND contype = 'c';
