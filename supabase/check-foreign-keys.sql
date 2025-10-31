-- Vérifier les clés étrangères sur les tables propositions et reclamations_propriete

-- 1. Vérifier les contraintes FK sur la table propositions
SELECT
  'PROPOSITIONS - Foreign Keys' as info,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  a.attname AS column_name,
  af.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid = 'public.propositions'::regclass
  AND c.contype = 'f'
ORDER BY conname;

-- 2. Vérifier les contraintes FK sur la table reclamations_propriete
SELECT
  'RECLAMATIONS_PROPRIETE - Foreign Keys' as info,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  a.attname AS column_name,
  af.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid = 'public.reclamations_propriete'::regclass
  AND c.contype = 'f'
ORDER BY conname;

-- 3. Lister TOUTES les colonnes de propositions pour vérifier si created_by existe
SELECT
  'PROPOSITIONS - Colonnes' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'propositions'
ORDER BY ordinal_position;
