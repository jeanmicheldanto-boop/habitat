-- ========================================
-- VÉRIFIER LE COMPTE patrick.genevaux@gmail.com
-- ========================================

-- 1. Vérifier si le compte existe dans auth.users
SELECT 
  'auth.users' as table_name,
  id::text,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'patrick.genevaux@gmail.com';

-- 2. Vérifier si le profil a été créé
SELECT 
  'profiles' as table_name,
  id::text,
  email,
  prenom,
  nom,
  role,
  created_at
FROM profiles
WHERE email = 'patrick.genevaux@gmail.com';

-- 3. Vérifier les dernières réponses HTTP (logs des emails)
SELECT 
  id,
  status_code,
  content::text,
  created,
  error_msg
FROM net._http_response 
WHERE created > NOW() - INTERVAL '30 minutes'
ORDER BY created DESC 
LIMIT 10;
