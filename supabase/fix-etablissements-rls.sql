-- ========================================
-- VÉRIFIER ET CORRIGER RLS ETABLISSEMENTS
-- ========================================

-- 1. Voir les policies actuelles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'etablissements';

-- 2. Ajouter policy pour permettre aux admins d'insérer
DROP POLICY IF EXISTS "Admins can insert etablissements" ON etablissements;

CREATE POLICY "Admins can insert etablissements"
ON etablissements
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 3. Ajouter policy pour permettre aux admins de modifier
DROP POLICY IF EXISTS "Admins can update etablissements" ON etablissements;

CREATE POLICY "Admins can update etablissements"
ON etablissements
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. Vérifier les nouvelles policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'etablissements'
ORDER BY cmd, policyname;
