# Test de connexion avec le compte qui fonctionne
# Email: lgenevaux@yahoo.fr
# Mot de passe: Admin2025!

$body = '{"password":"Admin2025!"}'; 

$response = Invoke-RestMethod -Method PUT `
  -Uri "https://minwoumfgutampcgrcbr.supabase.co/auth/v1/admin/users/f2606e91-728b-4136-9776-bae713edea4e" `
  -Headers @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA"
    "Content-Type" = "application/json"
  } `
  -Body $body

Write-Host "✅ Mot de passe défini pour lgenevaux@yahoo.fr"
Write-Host "📧 Email: lgenevaux@yahoo.fr"
Write-Host "🔑 Mot de passe: Admin2025!"
Write-Host ""
Write-Host "Testez avec ce compte pour comparer"
