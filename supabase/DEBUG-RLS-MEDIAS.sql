-- DIAGNOSTIC APPROFONDI: État complet des RLS sur table medias

-- 1. RLS est-il activé sur la table medias ?
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'medias';

-- 2. TOUTES les policies sur medias (avec leur type PERMISSIVE/RESTRICTIVE)
SELECT 
  policyname,
  cmd as operation,
  permissive as is_permissive,
  roles
FROM pg_policies
WHERE tablename = 'medias'
ORDER BY cmd, policyname;

-- 3. Vérifier si la policy DEBUG existe
SELECT COUNT(*) as policy_debug_count
FROM pg_policies
WHERE tablename = 'medias'
AND policyname = 'DEBUG allow all medias insert';

-- 4. Compter les policies INSERT
SELECT 
  COUNT(*) as total_insert_policies,
  COUNT(*) FILTER (WHERE permissive = 'PERMISSIVE') as permissive_policies,
  COUNT(*) FILTER (WHERE permissive = 'RESTRICTIVE') as restrictive_policies
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT';
