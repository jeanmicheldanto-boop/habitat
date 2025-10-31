-- Tester si l'utilisateur actuel est reconnu comme admin

-- 1. Vérifier l'utilisateur actuel
SELECT 
  'UTILISATEUR ACTUEL' as info,
  auth.uid() as user_id,
  auth.email() as email;

-- 2. Vérifier le profil et le rôle
SELECT 
  'PROFIL' as info,
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

-- 3. Tester la fonction is_admin()
SELECT 
  'TEST is_admin()' as info,
  public.is_admin() as est_admin;

-- 4. Compter les propositions visibles avec RLS
SELECT 
  'PROPOSITIONS VISIBLES (avec RLS)' as info,
  COUNT(*) as total
FROM public.propositions;

-- 5. Compter toutes les propositions (bypass RLS - nécessite droits superuser)
SET ROLE postgres;
SELECT 
  'TOUTES LES PROPOSITIONS (sans RLS)' as info,
  COUNT(*) as total
FROM public.propositions;
RESET ROLE;
