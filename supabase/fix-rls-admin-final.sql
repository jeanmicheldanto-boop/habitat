-- ========================================
-- RÉACTIVER RLS ET CORRIGER POLICIES ADMIN
-- ========================================

-- 1. Réactiver RLS
ALTER TABLE etablissements ENABLE ROW LEVEL SECURITY;

-- 2. La policy "Admins full access insert" existe déjà avec WITH CHECK (true)
-- Mais elle ne fonctionne pas. Supprimons tout et recréons proprement

-- Supprimer les policies en double
DROP POLICY IF EXISTS "Admins can insert etablissements" ON etablissements;
DROP POLICY IF EXISTS "Admins can update etablissements" ON etablissements;
DROP POLICY IF EXISTS "Admins full access insert" ON etablissements;
DROP POLICY IF EXISTS "Admins full access update" ON etablissements;
DROP POLICY IF EXISTS "Allow insert for all" ON etablissements;

-- 3. Créer UNE SEULE policy admin qui fonctionne vraiment
CREATE POLICY "Admins bypass RLS"
ON etablissements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. Garder la policy de lecture publique
-- (elle existe déjà: "Public can read published establishments")

-- 5. Vérifier
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'etablissements'
ORDER BY cmd, policyname;
