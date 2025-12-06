-- Script de diagnostic complet pour identifier le problème

-- 1. Vérifier si created_by est bien nullable
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'propositions'
  AND column_name IN ('created_by', 'created_at', 'statut');

-- 2. Vérifier les policies RLS actuelles
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'propositions'
ORDER BY policyname;

-- 3. Vérifier si le RLS est activé
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'propositions';

-- 4. Tester une insertion simple (devrait fonctionner)
-- Cette requête simule ce que fait le formulaire
-- Si elle échoue, elle donnera l'erreur exacte
INSERT INTO propositions (
  etablissement_id,
  cible_id,
  type_cible,
  action,
  source,
  created_by,
  payload,
  statut
) VALUES (
  'a324904f-5463-4550-b6df-61654e6e4cde', -- Un ID d'établissement existant
  'a324904f-5463-4550-b6df-61654e6e4cde',
  'etablissement',
  'update',
  'public',
  NULL, -- Utilisateur non-authentifié
  '{"proposeur": {"nom": "Test", "email": "test@test.com"}, "modifications": {}}',
  'en_attente'
);

-- 5. Si l'insertion a réussi, supprimer le test
DELETE FROM propositions 
WHERE payload->>'proposeur'->>'email' = 'test@test.com'
  AND created_at > NOW() - INTERVAL '5 minutes';
