-- CLEANUP FINAL: Supprimer la policy DEBUG temporaire

-- 1. Supprimer la policy DEBUG
DROP POLICY IF EXISTS "DEBUG allow all medias insert" ON medias;

-- 2. Vérifier les policies finales sur medias
SELECT 
  cmd as operation,
  COUNT(*) as count,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'medias'
GROUP BY cmd
ORDER BY cmd;

-- 3. Lister toutes les policies proprietaires (celles qu'on a créées)
SELECT 
  cmd as operation,
  policyname
FROM pg_policies
WHERE tablename = 'medias'
AND policyname LIKE '%roprietaire%'
ORDER BY cmd, policyname;

SELECT 'Cleanup terminé - Policy DEBUG supprimée' as resultat;
