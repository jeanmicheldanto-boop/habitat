-- ========================================
-- VÉRIFIER ET CORRIGER LE STATUT ADMIN
-- ========================================

-- 1. Vérifier le profil admin actuel
SELECT 
  id,
  email,
  prenom,
  nom,
  role,
  is_admin
FROM profiles
WHERE email = 'jeanmichel.danto@gmail.com';

-- 2. SI is_admin = false ou NULL, le corriger:
UPDATE profiles
SET is_admin = true
WHERE email = 'jeanmichel.danto@gmail.com';

-- 3. Vérifier la correction
SELECT 
  id,
  email,
  is_admin,
  role
FROM profiles
WHERE email = 'jeanmichel.danto@gmail.com';

-- 4. Tester maintenant l'accès aux propositions
SELECT 
  p.id,
  p.type_cible,
  p.action,
  p.statut,
  p.payload->>'nom' as nom_etablissement
FROM propositions p
WHERE p.statut = 'en_attente'
ORDER BY p.created_at DESC;
