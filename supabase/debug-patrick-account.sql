-- ========================================
-- VÉRIFIER LE COMPTE patrick.danto@outlook.fr
-- ========================================

-- 1. Vérifier l'existence et le statut du compte
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at,
  banned_until,
  deleted_at
FROM auth.users
WHERE email = 'patrick.danto@outlook.fr';

-- 2. Confirmer l'email si pas confirmé
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'patrick.danto@outlook.fr'
  AND (email_confirmed_at IS NULL OR confirmed_at IS NULL);

-- 3. Vérifier le profil
SELECT 
  id,
  email,
  role,
  is_admin
FROM profiles
WHERE email = 'patrick.danto@outlook.fr';

-- 4. Si pas de résultat, créer un nouveau compte admin simple
-- Exécutez cette commande PowerShell si le compte ne fonctionne pas:
-- 
-- $body = @{
--   email = "admin@habitat-intermediaire.fr"
--   password = "Admin2025!"
--   email_confirm = $true
-- } | ConvertTo-Json
-- 
-- $response = Invoke-RestMethod -Method POST `
--   -Uri "https://minwoumfgutampcgrcbr.supabase.co/auth/v1/admin/users" `
--   -Headers @{
--     "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
--     "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
--     "Content-Type" = "application/json"
--   } `
--   -Body $body
-- 
-- $userId = $response.id
-- Write-Host "Nouvel admin créé avec ID: $userId"
-- 
-- # Puis créer le profil:
-- INSERT INTO profiles (id, email, prenom, nom, role, is_admin)
-- VALUES ('$userId', 'admin@habitat-intermediaire.fr', 'Admin', 'Habitat', 'admin', true);
