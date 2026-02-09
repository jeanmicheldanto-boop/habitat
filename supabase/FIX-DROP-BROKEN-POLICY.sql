-- Vérifier si la table "profiles" existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_table_exists;

-- Si elle n'existe pas, SUPPRIMER la policy cassée
DROP POLICY IF EXISTS "gestionnaire insert own medias" ON medias;

-- Vérifier combien de policies INSERT restent
SELECT COUNT(*) as remaining_insert_policies
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT';

SELECT 'Policy gestionnaire supprimée - Testez l''upload maintenant' as instruction;
