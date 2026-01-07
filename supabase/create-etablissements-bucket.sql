-- ========================================
-- CRÉER LE BUCKET STORAGE POUR LES PHOTOS D'ÉTABLISSEMENTS
-- ========================================

-- Créer le bucket etablissements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'etablissements',
  'etablissements',
  true,  -- Public pour que les photos soient accessibles
  10485760,  -- 10 Mo max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Politique: Tout le monde peut lire les images
CREATE POLICY "Public can view establishment photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'etablissements');

-- Politique: Les gestionnaires authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload establishment photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'etablissements');

-- Politique: Les gestionnaires peuvent mettre à jour leurs propres photos
CREATE POLICY "Users can update their own establishment photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'etablissements');

-- Politique: Les gestionnaires peuvent supprimer leurs propres photos
CREATE POLICY "Users can delete their own establishment photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'etablissements');

-- Afficher les buckets créés
SELECT * FROM storage.buckets WHERE id = 'etablissements';
