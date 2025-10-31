-- Corriger la fonction is_admin() pour vérifier le rôle dans profiles

-- Remplacer la fonction (pas besoin de DROP car CREATE OR REPLACE gère cela)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql 
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Tester la fonction
SELECT 
  'TEST is_admin()' as info,
  public.is_admin() as resultat,
  auth.uid() as user_id;

-- Vérifier le profil actuel
SELECT 
  'PROFIL ACTUEL' as info,
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

SELECT '✅ Fonction is_admin() mise à jour pour utiliser profiles.role' as resultat;
