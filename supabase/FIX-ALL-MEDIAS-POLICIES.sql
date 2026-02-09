-- 1. Supprimer la policy SELECT cassée (qui référence probablement "profiles")
DROP POLICY IF EXISTS "gestionnaire read own medias" ON medias;

-- 2. Supprimer aussi la policy DELETE cassée
DROP POLICY IF EXISTS "gestionnaire delete own medias" ON medias;

-- 3. Ajouter une policy SELECT pour les proprietaires
CREATE POLICY "Proprietaires can select medias"
ON medias
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 4. Vérifier les policies restantes
SELECT 
  cmd as operation,
  policyname,
  roles::text
FROM pg_policies
WHERE tablename = 'medias'
AND policyname LIKE '%roprietaire%'
ORDER BY cmd, policyname;

SELECT 'Policies cassées supprimées, policy SELECT proprietaires ajoutée - Testez l''upload' as instruction;
