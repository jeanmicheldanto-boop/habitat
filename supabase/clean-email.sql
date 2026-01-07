-- ========================================
-- VÉRIFIER ET SUPPRIMER UN COMPTE PAR EMAIL
-- ========================================

-- 1. Vérifier si l'email existe déjà
SELECT 
  'auth.users' as table_name,
  id::text,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'jeanmichel.danto@gmail.com'
UNION ALL
SELECT 
  'profiles',
  id::text,
  email,
  created_at::timestamptz,
  NULL
FROM profiles
WHERE email = 'jeanmichel.danto@gmail.com';

-- 2. Si le compte existe, récupérer l'ID
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Trouver l'ID de l'utilisateur
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'jeanmichel.danto@gmail.com';
  
  IF user_uuid IS NOT NULL THEN
    -- Supprimer les dépendances
    DELETE FROM etablissement_proprietaires WHERE user_id = user_uuid;
    DELETE FROM reclamations_propriete WHERE user_id = user_uuid;
    DELETE FROM profiles WHERE id = user_uuid;
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE 'Compte supprimé: %', user_uuid;
  ELSE
    RAISE NOTICE 'Aucun compte trouvé avec cet email';
  END IF;
END $$;

-- 3. Vérifier que tout est supprimé
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
WHERE email = 'jeanmichel.danto@gmail.com'
UNION ALL
SELECT 
  'profiles',
  COUNT(*)
FROM profiles
WHERE email = 'jeanmichel.danto@gmail.com';
