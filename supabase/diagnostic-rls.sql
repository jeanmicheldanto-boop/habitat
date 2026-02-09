-- ========================================
-- DIAGNOSTIC COMPLET DES POLICIES RLS
-- ========================================
-- Exécutez ce script dans Supabase SQL Editor pour diagnostiquer

-- 1. Vérifier si RLS est activé
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'propositions';

-- 2. Lister TOUTES les policies actuelles
SELECT 
  'All Policies' as check_type,
  policyname,
  roles::text,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- 3. Test d'insertion en tant qu'anon (devrait fonctionner)
-- Commentez cette section si vous ne voulez pas créer de test
/*
SET ROLE anon;
INSERT INTO propositions (
  etablissement_id,
  type_cible,
  action,
  source,
  created_by,
  payload,
  statut
) VALUES (
  'dc2e1556-64d0-451f-9759-9d9f1849fe10',
  'etablissement',
  'update',
  'public',
  NULL,
  '{"test": "diagnostic"}'::jsonb,
  'en_attente'
) RETURNING id, created_at;
RESET ROLE;
*/
