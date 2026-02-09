-- Vérifier les RLS policies sur la table medias
-- Problème: Les propriétaires (via etablissement_proprietaires) ne peuvent peut-être pas insérer

-- 1. Voir les policies actuelles sur medias
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'medias';

-- 2. Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables  
WHERE tablename = 'medias';

-- 3. Tester l'INSERT pour un proprietaire
-- Remplacer les UUIDs par les vraies valeurs de votre test
DO $$
DECLARE
  test_user_id UUID := '5e94aca4-0dc2-4c8a-8066-3c010d4b34bc';  -- Votre user_id
  test_etab_id UUID := 'b71d1c07-b400-41f9-a5aa-40eb55d78b71';   -- La Maison Ossunaise
BEGIN
  -- Simuler l'utilisateur actuel
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, false);
  
  -- Tenter un INSERT
  INSERT INTO medias (etablissement_id, storage_path, priority)
  VALUES (test_etab_id, 'test/image.jpg', 1);
  
  RAISE NOTICE 'INSERT réussi!';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'INSERT échoué: %', SQLERRM;
END $$;

-- 4. Si échec, ajouter la policy manquante:
CREATE POLICY IF NOT EXISTS "Proprietaires can insert medias"
ON medias
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 5. Ajouter aussi UPDATE et DELETE si besoin
CREATE POLICY IF NOT EXISTS "Proprietaires can update medias"
ON medias
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can delete medias"
ON medias
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 6. Vérifier les nouvelles policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'medias' ORDER BY policyname;
