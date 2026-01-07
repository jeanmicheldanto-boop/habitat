-- ========================================
-- METTRE À JOUR LE PROFIL PATRICK EN ADMIN
-- ========================================

UPDATE profiles
SET 
  role = 'admin',
  is_admin = true,
  prenom = 'Patrick',
  nom = 'Danto'
WHERE email = 'patrick.danto@outlook.fr';

-- Vérifier
SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  is_admin
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';
