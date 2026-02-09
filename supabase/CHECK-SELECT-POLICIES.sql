-- Vérifier les policies SELECT sur medias
SELECT 
  policyname,
  permissive as is_permissive,
  roles::text
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Compter combien de policies SELECT existent
SELECT COUNT(*) as total_select_policies
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'SELECT';
