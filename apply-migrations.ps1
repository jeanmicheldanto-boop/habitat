# Script PowerShell pour appliquer les migrations Supabase
# Usage: .\apply-migrations.ps1

Write-Host "🚀 Application des migrations Supabase..." -ForegroundColor Green

# Vérifier si Supabase CLI est installé
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI détecté : $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Installez avec : npm install -g supabase" -ForegroundColor Red
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase\migrations")) {
    Write-Host "❌ Dossier migrations non trouvé. Exécutez ce script depuis la racine du projet." -ForegroundColor Red
    exit 1
}

# Liste des migrations dans l'ordre
$migrations = @(
    "001_handle_user_profiles.sql",
    "002_notifications.sql", 
    "003_storage.sql"
)

Write-Host "`n📋 Migrations à appliquer :" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    Write-Host "   • $migration" -ForegroundColor Gray
}

Write-Host "`n⚠️  ATTENTION : Assurez-vous d'être connecté à votre projet Supabase" -ForegroundColor Yellow
$confirm = Read-Host "Continuer ? (o/N)"

if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host "Annulé par l'utilisateur." -ForegroundColor Gray
    exit 0
}

# Appliquer chaque migration
foreach ($migration in $migrations) {
    $migrationPath = "supabase\migrations\$migration"
    
    if (Test-Path $migrationPath) {
        Write-Host "`n🔄 Application de $migration..." -ForegroundColor Blue
        
        try {
            # Note: Cette commande nécessite une configuration locale Supabase
            # Pour l'instant, mieux vaut utiliser le SQL Editor
            Write-Host "   → Veuillez exécuter manuellement dans SQL Editor de Supabase :" -ForegroundColor Yellow
            Write-Host "   → Fichier : $migrationPath" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Erreur lors de l'application de $migration" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Migration non trouvée : $migrationPath" -ForegroundColor Red
    }
}

Write-Host "`n✅ Pour appliquer les migrations :" -ForegroundColor Green
Write-Host "   1. Allez sur https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   2. Sélectionnez votre projet" -ForegroundColor Gray  
Write-Host "   3. Allez dans SQL Editor" -ForegroundColor Gray
Write-Host "   4. Copiez-collez chaque fichier SQL et exécutez" -ForegroundColor Gray

Write-Host "`n🎯 Une fois fait, votre application aura :" -ForegroundColor Green
Write-Host "   • Système d'authentification complet" -ForegroundColor Gray
Write-Host "   • Notifications temps réel" -ForegroundColor Gray
Write-Host "   • Stockage de fichiers sécurisé" -ForegroundColor Gray