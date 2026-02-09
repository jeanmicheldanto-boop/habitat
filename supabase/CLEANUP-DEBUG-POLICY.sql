-- Supprimer la policy DEBUG temporaire (elle autorise tout le monde)
DROP POLICY IF EXISTS "DEBUG allow all medias insert" ON medias;

-- Vérifier que les vraies policies sont toujours là
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT'
ORDER BY policyname;

SELECT 'Policy DEBUG supprimée, policies normales actives' as resultat;
