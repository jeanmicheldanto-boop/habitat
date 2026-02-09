-- DIAGNOSTIC: Pourquoi l'INSERT medias échoue malgré les RLS policies

-- 1. Vérifier que la policy INSERT existe pour medias
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK clause exists'
    ELSE 'NO WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT'
ORDER BY policyname;

-- 2. Vérifier le lien etablissement_proprietaires pour cet établissement
-- REMPLACER l'user_id par celui du gestionnaire qui teste
SELECT 
  ep.etablissement_id,
  ep.user_id,
  ep.role,
  ep.active,
  e.nom as etablissement_nom
FROM etablissement_proprietaires ep
JOIN etablissements e ON e.id = ep.etablissement_id
WHERE ep.etablissement_id = 'b71d1c07-b400-41f9-a5aa-40eb55d78b71';

-- 3. Tester si auth.uid() fonctionne dans le contexte actuel
-- (Cela devrait retourner NULL en SQL Editor, mais confirme la fonction existe)
SELECT auth.uid() as current_user_id;

-- 4. SOLUTION TEMPORAIRE: Créer une policy PERMISSIVE pour débugger
-- Cette policy autorise TOUS les inserts medias pour les utilisateurs authentifiés
-- À retirer une fois qu'on a trouvé le problème

DROP POLICY IF EXISTS "DEBUG allow all medias insert" ON medias;
CREATE POLICY "DEBUG allow all medias insert"
ON medias
FOR INSERT
TO authenticated
WITH CHECK (true); -- Autorise TOUT le monde (TEMPORAIRE !)

-- 5. Vérifier que la policy a été créée
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'medias'
AND policyname = 'DEBUG allow all medias insert';

SELECT 'Policy DEBUG créée - Testez l''upload maintenant' as resultat;
