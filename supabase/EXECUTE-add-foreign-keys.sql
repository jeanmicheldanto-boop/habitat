-- ============================================================================
-- VÉRIFIER ET CORRIGER LES CLÉS ÉTRANGÈRES
-- ============================================================================
-- Les contraintes existent mais Supabase ne les trouve pas pour les JOINs
-- Vérifions leur configuration
-- ============================================================================

-- D'abord, voir toutes les FK existantes sur propositions et reclamations_propriete
SELECT
  'EXISTING FOREIGN KEYS' as info,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS references_table,
  af.attname AS references_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid IN ('public.propositions'::regclass, 'public.reclamations_propriete'::regclass)
  AND c.contype = 'f'
ORDER BY table_name, constraint_name;

-- ============================================================================
-- TEST MANUEL DES JOINS
-- ============================================================================
-- Essayons de comprendre pourquoi Supabase ne trouve pas la relation

-- Test 1: JOIN simple avec la notation standard PostgreSQL
SELECT 
  'TEST 1: PostgreSQL JOIN' as test,
  p.id,
  p.created_by,
  pr.nom,
  pr.email
FROM public.propositions p
LEFT JOIN public.profiles pr ON p.created_by = pr.id
LIMIT 3;

-- Test 2: Vérifier le schéma de la table profiles
SELECT 
  'TEST 2: Profiles table info' as test,
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_name = 'profiles';

-- Test 3: Vérifier si auth.users existe et si profiles.id référence bien auth.users
SELECT
  'TEST 3: Profiles structure' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'email')
ORDER BY ordinal_position;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que les contraintes ont bien été créées
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS references_table,
  af.attname AS references_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid IN ('public.propositions'::regclass, 'public.reclamations_propriete'::regclass)
  AND c.contype = 'f'
  AND conname LIKE '%created_by%' OR conname LIKE '%reviewed_by%' OR conname LIKE '%user_id%'
ORDER BY table_name, constraint_name;
