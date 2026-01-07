-- ========================================
-- LISTER TOUS LES COMPTES ADMIN
-- ========================================

SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  is_admin,
  created_at
FROM profiles
WHERE is_admin = true OR role = 'admin'
ORDER BY created_at;

-- Si aucun résultat, vérifier tous les profils
SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  is_admin
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
