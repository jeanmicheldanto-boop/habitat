-- ========================================
-- VÉRIFIER ET CORRIGER LES POLICIES RLS SUR PROFILES
-- ========================================

-- 1. Voir les policies actuelles sur profiles
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
WHERE tablename = 'profiles';

-- 2. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 3. Corriger: permettre aux utilisateurs authentifiés de lire leur propre profil
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Permettre aussi la lecture publique (pour le cas où c'est nécessaire)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- 5. Vérifier que les policies sont bien créées
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles';
