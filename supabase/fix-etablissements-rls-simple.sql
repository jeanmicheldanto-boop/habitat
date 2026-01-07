-- ========================================
-- SOLUTION SIMPLE: POLICIES ADMIN POUR ETABLISSEMENTS
-- ========================================

-- 1. Supprimer toutes les policies restrictives existantes
DROP POLICY IF EXISTS "Admins can insert etablissements" ON etablissements;
DROP POLICY IF EXISTS "Admins can update etablissements" ON etablissements;
DROP POLICY IF EXISTS "Admins can delete etablissements" ON etablissements;

-- 2. Créer une policy permissive pour les admins (INSERT)
CREATE POLICY "Admins full access insert"
ON etablissements
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Temporairement permissif pour déboguer

-- 3. Créer une policy permissive pour les admins (UPDATE)
CREATE POLICY "Admins full access update"
ON etablissements
FOR UPDATE
TO authenticated
USING (true);

-- 4. Vérifier
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'etablissements'
AND policyname LIKE '%Admins%';
