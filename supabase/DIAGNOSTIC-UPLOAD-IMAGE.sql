-- Diagnostic complet de l'échec d'upload
-- Vérifier EXACTEMENT ce qui bloque

-- 1. Vérifier que les policies ont été créées
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'medias'
ORDER BY policyname;

-- 2. Tester si l'utilisateur peut INSERT dans medias
-- Remplacer par vos vraies valeurs
DO $$
DECLARE
  test_user_id UUID := '5e94aca4-0dc2-4c8a-8066-3c010d4b34bc';
  test_etab_id UUID := 'b71d1c07-b400-41f9-a5aa-40eb55d78b71';
  test_media_id UUID;
BEGIN
  -- Simuler l'auth de l'utilisateur
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  
  -- Vérifier que le lien proprietaire existe
  IF NOT EXISTS (
    SELECT 1 FROM etablissement_proprietaires 
    WHERE etablissement_id = test_etab_id 
    AND user_id = test_user_id
    AND active = true
  ) THEN
    RAISE EXCEPTION 'ERREUR: Aucun lien proprietaire trouvé pour user % et etab %', test_user_id, test_etab_id;
  END IF;
  
  RAISE NOTICE 'OK: Lien proprietaire existe';
  
  -- Tenter INSERT
  BEGIN
    INSERT INTO medias (etablissement_id, storage_path, priority)
    VALUES (test_etab_id, 'test/diagnostic-' || now()::text || '.jpg', 1)
    RETURNING id INTO test_media_id;
    
    RAISE NOTICE 'OK: INSERT réussi! Media ID = %', test_media_id;
    
    -- Nettoyer le test
    DELETE FROM medias WHERE id = test_media_id;
    RAISE NOTICE 'OK: Test nettoyé';
    
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE EXCEPTION 'ERREUR RLS: Pas de permission INSERT sur medias pour user %', test_user_id;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'ERREUR: % (%)', SQLERRM, SQLSTATE;
  END;
END $$;

-- 3. Vérifier les buckets Supabase Storage
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name LIKE '%media%' OR name LIKE '%image%' OR name LIKE '%photo%';

-- 4. Vérifier les policies de storage
SELECT 
  bucket_id,
  name,
  definition
FROM storage.policies
WHERE bucket_id IN (
  SELECT id FROM storage.buckets 
  WHERE name LIKE '%media%' OR name LIKE '%image%' OR name LIKE '%photo%'
);
