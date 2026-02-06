# Script pour corriger les policies RLS sur la table propositions
# Pour permettre au public de créer des propositions et aux admins de les voir

Write-Host "🔧 Correction des policies RLS pour propositions publiques..." -ForegroundColor Cyan

# Charger les variables d'environnement
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Variables d'environnement manquantes" -ForegroundColor Red
    Write-Host "   Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local" -ForegroundColor Yellow
    exit 1
}

# Lire le fichier SQL
$sqlContent = Get-Content "supabase\fix-rls-propositions-public.sql" -Raw

# Découper en commandes individuelles (séparées par ;)
$commands = $sqlContent -split ';' | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith('--') }

Write-Host "`n📋 Exécution de $($commands.Count) commandes SQL..." -ForegroundColor Yellow

$successCount = 0
$errorCount = 0

foreach ($cmd in $commands) {
    $trimmedCmd = $cmd.Trim()
    if (-not $trimmedCmd) { continue }
    
    # Extraire le type de commande pour l'affichage
    $cmdType = if ($trimmedCmd -match '^(DROP|CREATE|SELECT)') { $matches[1] } else { "SQL" }
    
    Write-Host "`n⚙️  $cmdType..." -ForegroundColor Gray
    
    try {
        $body = @{
            query = $trimmedCmd
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod `
            -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" `
            -Method Post `
            -Headers @{
                "apikey" = $supabaseKey
                "Authorization" = "Bearer $supabaseKey"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "   ✅ Succès" -ForegroundColor Green
        $successCount++
        
    } catch {
        # Certaines commandes peuvent échouer sans problème (ex: DROP IF EXISTS sur une policy qui n'existe pas)
        if ($_.Exception.Response.StatusCode -eq 404 -or $trimmedCmd -match "DROP.*IF EXISTS") {
            Write-Host "   ⚠️  Non trouvé (normal si n'existe pas)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Terminé: $successCount succès" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "⚠️  Erreurs: $errorCount" -ForegroundColor Yellow
}

# Vérifier manuellement les policies via l'API Supabase
Write-Host "`n🔍 Vérification des policies via SQL direct..." -ForegroundColor Cyan

# On utilise une requête SQL directe via psql si disponible
$verifyQuery = @"
SELECT 
  policyname,
  roles::text,
  cmd::text
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;
"@

Write-Host "`n📊 Pour vérifier manuellement, exécutez dans le SQL Editor de Supabase:" -ForegroundColor Yellow
Write-Host $verifyQuery -ForegroundColor White

Write-Host "`n💡 Les propositions publiques devraient maintenant être visibles dans le dashboard admin!" -ForegroundColor Green
