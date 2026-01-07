-- ========================================
-- LISTER LES COMPTES GESTIONNAIRES
-- ========================================

SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  created_at,
  updated_at
FROM profiles
WHERE role = 'gestionnaire'
ORDER BY created_at DESC;

-- Compter le nombre total de gestionnaires
SELECT COUNT(*) as total_gestionnaires
FROM profiles
WHERE role = 'gestionnaire';
