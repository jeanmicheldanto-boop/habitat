-- Créer un bucket pour les fichiers de justificatifs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'justificatifs',
  'justificatifs',
  false,
  5242880, -- 5MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
);

-- Politique RLS pour le bucket justificatifs
CREATE POLICY "Les utilisateurs peuvent uploader leurs justificatifs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'justificatifs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Les utilisateurs peuvent voir leurs justificatifs" ON storage.objects
  FOR SELECT USING (bucket_id = 'justificatifs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Les administrateurs peuvent voir tous les justificatifs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'justificatifs' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs justificatifs" ON storage.objects
  FOR DELETE USING (bucket_id = 'justificatifs' AND auth.uid()::text = (storage.foldername(name))[1]);