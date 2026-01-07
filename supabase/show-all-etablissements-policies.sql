-- ========================================
-- VOIR TOUTES LES POLICIES ETABLISSEMENTS
-- ========================================

SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'etablissements'
ORDER BY cmd, policyname;
