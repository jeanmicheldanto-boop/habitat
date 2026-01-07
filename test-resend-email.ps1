# Test de l'Edge Function send-notification avec Resend
# Exécutez ces commandes dans PowerShell

# Test 1: Email de bienvenue
$body1 = @{
    email = "patrick.danto@outlook.fr"
    name = "Test Utilisateur"
    type = "welcome"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"
    } `
    -Body $body1

Write-Host "`n✅ Test 1 envoyé - Vérifiez votre boîte mail et le dashboard Resend`n"

# Test 2: Email de création d'établissement
$body2 = @{
    email = "patrick.danto@outlook.fr"
    name = "Test Utilisateur"
    type = "etablissement_created"
    etablissement = "Résidence Test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"
    } `
    -Body $body2

Write-Host "`n✅ Test 2 envoyé`n"

# Test 3: Email de réclamation approuvée
$body3 = @{
    email = "patrick.danto@outlook.fr"
    name = "Test Utilisateur"
    type = "reclamation_status_change"
    etablissement = "Résidence Test"
    statut = "verifiee"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"
    } `
    -Body $body3

Write-Host "`n✅ Test 3 envoyé - Allez voir https://resend.com/emails pour vérifier les envois`n"
