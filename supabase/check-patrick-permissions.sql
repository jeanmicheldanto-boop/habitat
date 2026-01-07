-- ========================================
-- VÉRIFIER LES PERMISSIONS DE PATRICK
-- ========================================

-- 1. Vérifier le profil complet
SELECT 
  id,
  email,
  role,
  is_admin,
  created_at
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';

-- 2. Vérifier si l'utilisateur peut voir les propositions (test RLS)
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "3e02294b-14ee-4f68-ab67-1c38eb5fdc8e", "role": "authenticated"}';

SELECT COUNT(*) as proposition_count
FROM propositions;

-- Réinitialiser
RESET role;

-- 3. Si is_admin est NULL ou false, le corriger
UPDATE profiles
SET is_admin = true
WHERE email = 'patrick.danto@outlook.fr'
  AND (is_admin IS NULL OR is_admin = false);

-- 4. Vérifier à nouveau
SELECT 
  id,
  email,
  role,
  is_admin,
  updated_at
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';
