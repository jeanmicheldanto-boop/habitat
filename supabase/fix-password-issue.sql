-- ========================================
-- DIAGNOSTIC COMPLET AUTHENTIFICATION
-- ========================================

-- 1. Vérifier si un mot de passe est défini (encrypted_password existe)
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  LENGTH(encrypted_password) as password_length,
  confirmation_token,
  recovery_token,
  email_change_token_current,
  reauthentication_token
FROM auth.users
WHERE email = 'patrick.danto@outlook.fr';

-- 2. Vérifier les tentatives de connexion récentes
SELECT 
  created_at,
  factor_id,
  factor_type
FROM auth.mfa_factors
WHERE user_id = '3e02294b-14ee-4f68-ab67-1c38eb5fdc8e';

-- 3. Forcer la réinitialisation du mot de passe en supprimant l'ancien
UPDATE auth.users
SET 
  encrypted_password = NULL,
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 'patrick.danto@outlook.fr';

-- Maintenant, utilisez cette commande PowerShell pour définir un NOUVEAU mot de passe:
-- 
-- $body = '{"password":"TestPassword2025!"}'; 
-- $response = Invoke-RestMethod -Method PUT -Uri "https://minwoumfgutampcgrcbr.supabase.co/auth/v1/admin/users/3e02294b-14ee-4f68-ab67-1c38eb5fdc8e" -Headers @{"apikey"="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA";"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA";"Content-Type"="application/json"} -Body $body
-- $response | ConvertTo-Json

-- 4. Vérifier que le mot de passe est maintenant défini
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password_after,
  LENGTH(encrypted_password) as password_length_after,
  updated_at
FROM auth.users
WHERE email = 'patrick.danto@outlook.fr';
