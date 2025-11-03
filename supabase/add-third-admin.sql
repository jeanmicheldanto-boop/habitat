-- Script pour ajouter le 3ème utilisateur (lgenevaux@yahoo.fr) en tant qu'admin

-- 0. Vérifier la structure de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 1. Ajouter la colonne is_admin si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        COMMENT ON COLUMN profiles.is_admin IS 'Indique si l''utilisateur a les droits d''administration';
    END IF;
END $$;

-- 2. Vérifier si un profil existe déjà
SELECT * FROM profiles WHERE id = 'f2606e91-728b-4136-9776-bae713edea4e';

-- 3. Insérer ou mettre à jour le profil avec is_admin = true
INSERT INTO profiles (id, is_admin, created_at, updated_at)
VALUES (
  'f2606e91-728b-4136-9776-bae713edea4e',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  updated_at = NOW();

-- 4. Vérifier que le profil a bien été créé/mis à jour
SELECT 
  p.id,
  p.is_admin,
  p.created_at,
  au.email
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.id = 'f2606e91-728b-4136-9776-bae713edea4e';

-- 5. Lister tous les admins
SELECT 
  p.id,
  au.email,
  p.is_admin,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.is_admin = true
ORDER BY p.created_at;
