-- Vérifier les utilisateurs et leurs rôles

-- 1. Lister tous les profils
SELECT 
  'TOUS LES PROFILS' as info,
  id,
  email,
  role,
  nom,
  prenom
FROM public.profiles
ORDER BY created_at DESC;

-- 2. Lister tous les utilisateurs Supabase Auth
-- Note: Cette requête nécessite des droits superuser
SELECT 
  'UTILISATEURS AUTH' as info,
  id,
  email,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
