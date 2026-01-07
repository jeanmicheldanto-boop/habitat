-- ========================================
-- METTRE PATRICK EN ADMIN
-- ========================================

-- 1. Récupérer l'ID du compte
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'patrick.danto@outlook.fr';

-- 2. Créer le profil admin (remplacez l'ID par celui de la query 1)
INSERT INTO profiles (id, email, prenom, nom, role, is_admin)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'patrick.danto@outlook.fr'),
  'patrick.danto@outlook.fr',
  'Patrick',
  'Danto',
  'admin',
  true
);

-- 3. Vérifier
SELECT 
  id,
  email,
  role,
  is_admin
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';
