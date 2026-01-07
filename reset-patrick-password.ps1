# Réinitialiser le mot de passe de patrick.danto@outlook.fr
# Nouveau mot de passe: Admin2025!

$body = '{"password":"Admin2025!"}'; 

$response = Invoke-RestMethod -Method PUT `
  -Uri "https://minwoumfgutampcgrcbr.supabase.co/auth/v1/admin/users/3e02294b-14ee-4f68-ab67-1c38eb5fdc8e" `
  -Headers @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
    "Content-Type" = "application/json"
  } `
  -Body $body

Write-Host "✅ Mot de passe changé avec succès pour patrick.danto@outlook.fr"
Write-Host "📧 Email: patrick.danto@outlook.fr"
Write-Host "🔑 Mot de passe: Admin2025!"
Write-Host ""
Write-Host "⚠️ TESTEZ IMMÉDIATEMENT sur http://localhost:3000/admin/login"

$response | ConvertTo-Json
