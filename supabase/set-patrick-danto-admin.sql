-- ========================================
-- ACTIVER LE STATUT ADMIN POUR patrick.danto@outlook.fr
-- ========================================

UPDATE profiles
SET is_admin = true
WHERE email = 'patrick.danto@outlook.fr';

-- Vérifier
SELECT 
  email,
  role,
  is_admin
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';
