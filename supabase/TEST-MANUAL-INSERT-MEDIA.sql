-- TEST: Simuler l'INSERT que fait le gestionnaire depuis le frontend

-- 1. Vérifier si la policy DEBUG existe toujours
SELECT policyname, permissive 
FROM pg_policies 
WHERE tablename = 'medias' 
AND policyname = 'DEBUG allow all medias insert';

-- 2. Tester l'INSERT avec auth.uid() simulé
-- ATTENTION: En SQL Editor, auth.uid() retourne NULL
-- On ne peut PAS tester avec le vrai auth context ici

-- 3. Afficher TOUTES les policies INSERT pour comprendre laquelle bloque
SELECT 
  policyname,
  permissive,
  roles::text,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as check_clause
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT'
ORDER BY policyname;

-- 4. DÉSACTIVER TEMPORAIREMENT les RLS pour tester
-- WARNING: Cela désactive TOUTE sécurité sur medias !
ALTER TABLE medias DISABLE ROW LEVEL SECURITY;

SELECT 'RLS désactivé temporairement sur table medias - Testez l''upload MAINTENANT' as instruction;

-- APRÈS LE TEST, RÉACTIVER AVEC:
-- ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
