-- Script pour corriger les permissions RLS sur la table propositions
-- Permet aux utilisateurs non-authentifiés d'envoyer des propositions

-- 1. Vérifier l'état actuel du RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'propositions';

-- 2. Vérifier les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'propositions';

-- 3. Activer le RLS si pas déjà fait
ALTER TABLE propositions ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Permettre INSERT public pour propositions" ON propositions;
DROP POLICY IF EXISTS "Permettre SELECT public pour propositions" ON propositions;
DROP POLICY IF EXISTS "Permettre tout aux admins pour propositions" ON propositions;

-- 5. Créer une policy pour permettre aux utilisateurs NON-AUTHENTIFIÉS d'insérer des propositions
CREATE POLICY "Permettre INSERT public pour propositions"
ON propositions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Créer une policy pour permettre la lecture (optionnel, selon vos besoins)
CREATE POLICY "Permettre SELECT pour créateur et admins"
ON propositions
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- 7. Créer une policy pour les admins (tout accès)
CREATE POLICY "Permettre tout aux admins pour propositions"
ON propositions
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

-- 8. Vérifier que les policies sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'propositions'
ORDER BY policyname;

-- 9. Test : voir si on peut insérer (à exécuter en tant qu'utilisateur non-authentifié)
-- Cette requête devrait maintenant fonctionner depuis le formulaire public
