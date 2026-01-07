-- ========================================
-- ACTIVER LE STATUT ADMIN POUR jeanmichel.danto@gmail.com
-- ========================================

UPDATE profiles
SET is_admin = true
WHERE email = 'jeanmichel.danto@gmail.com';

-- Vérifier
SELECT 
  email,
  role,
  is_admin
FROM profiles
WHERE email = 'jeanmichel.danto@gmail.com';
