-- ========================================
-- CHANGER LE MOT DE PASSE DIRECTEMENT
-- patrick.danto@outlook.fr
-- ========================================

-- Option 1: Via l'API Supabase (recommandé)
-- Exécutez cette commande dans PowerShell:

-- $body = @{
--   email = "patrick.danto@outlook.fr"
--   password = "VotreNouveauMotDePasse123!"
-- } | ConvertTo-Json
-- 
-- Invoke-RestMethod -Method POST `
--   -Uri "https://minwoumfgutampcgrcbr.supabase.co/auth/v1/admin/users/3e02294b-14ee-4f68-ab67-1c38eb5fdc8e" `
--   -Headers @{
--     "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
--     "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
--     "Content-Type" = "application/json"
--   } `
--   -Body $body

-- Option 2: Via le Dashboard Supabase
-- 1. Allez sur https://supabase.com/dashboard/project/minwoumfgutampcgrcbr/auth/users
-- 2. Trouvez patrick.danto@outlook.fr
-- 3. Cliquez sur les "..." à droite
-- 4. "Reset Password" → Définissez un nouveau mot de passe

-- Option 3: Créer un nouveau compte admin
-- Si les 2 options ci-dessus ne fonctionnent pas
