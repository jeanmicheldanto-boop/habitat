-- ========================================
-- DIAGNOSTIC COMPLET VALIDATION PROPOSITIONS
-- ========================================

-- 1. Vérifier la structure de la table etablissements
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'etablissements'
ORDER BY ordinal_position;

-- 2. Voir le détail du payload de la proposition en attente
SELECT 
  id,
  type_cible,
  action,
  statut,
  payload::text as payload_complet,
  etablissement_id,
  created_by
FROM propositions
WHERE id = 'a6ebead7-5072-4639-9b97-bb5b24ac175e';

-- 3. Vérifier les RLS policies sur etablissements pour les admins
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'etablissements'
  AND (qual LIKE '%is_admin%' OR qual LIKE '%admin%')
ORDER BY cmd, policyname;

-- 4. Tester l'insertion manuelle avec les données du payload
-- (Cette requête va échouer pour identifier les colonnes manquantes/problématiques)


