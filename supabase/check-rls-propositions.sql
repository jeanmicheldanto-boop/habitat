-- ========================================
-- VÉRIFIER LES POLITIQUES RLS SUR PROPOSITIONS
-- ========================================

-- 1. Vérifier si RLS est activé sur propositions
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'propositions';

-- 2. Lister toutes les politiques sur propositions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- 3. Tester la visibilité avec votre compte admin
-- Remplacez <votre_admin_email> par votre email admin
SELECT 
  p.id,
  p.type_cible,
  p.action,
  p.statut,
  p.created_at,
  p.payload->>'nom' as nom_etablissement,
  u.email as admin_actuel
FROM propositions p
CROSS JOIN auth.users u
WHERE u.email = 'jeanmichel.danto@gmail.com' -- Votre compte admin
  AND p.statut = 'en_attente'
ORDER BY p.created_at DESC;
