-- ========================================
-- SUPPRIMER ET RECRÉER LE COMPTE PATRICK
-- ========================================

-- 1. Supprimer le profil
DELETE FROM profiles WHERE email = 'patrick.danto@outlook.fr';

-- 2. Supprimer l'utilisateur auth (ceci supprime automatiquement via CASCADE)
DELETE FROM auth.users WHERE email = 'patrick.danto@outlook.fr';

-- 3. Vérifier la suppression
SELECT COUNT(*) as count_auth FROM auth.users WHERE email = 'patrick.danto@outlook.fr';
SELECT COUNT(*) as count_profile FROM profiles WHERE email = 'patrick.danto@outlook.fr';

-- 4. Maintenant, recréez le compte via PowerShell:
--
-- $body = @{
--   email = "patrick.danto@outlook.fr"
--   password = "Admin2025!"
--   email_confirm = $true
--   user_metadata = @{
--     prenom = "Patrick"
--     nom = "Danto"
--   }
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
-- Write-Host "Nouveau compte créé, ID: $userId"
--
-- # Puis créer le profil:
-- INSERT INTO profiles (id, email, prenom, nom, role, is_admin)
-- VALUES ('$userId', 'patrick.danto@outlook.fr', 'Patrick', 'Danto', 'admin', true);
