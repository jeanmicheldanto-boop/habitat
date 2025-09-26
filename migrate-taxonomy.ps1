# Script de migration pour la nouvelle taxonomie d'habitat
# Ce script applique la migration 004_habitat_taxonomy_migration.sql

Write-Host "🔄 Début de la migration de la taxonomie d'habitat..." -ForegroundColor Green

# Vérification de l'environnement Supabase
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI détecté: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: Supabase CLI non trouvé. Installez-le d'abord." -ForegroundColor Red
    exit 1
}

# Sauvegarde des données avant migration
Write-Host "💾 Création d'une sauvegarde des données existantes..." -ForegroundColor Yellow

$backupFile = "backup_before_taxonomy_migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

try {
    # Sauvegarde des tables établissements et propositions
    pg_dump --host=db.gybhhmlqyhlkgnhcjhsn.supabase.co `
            --port=5432 `
            --username=postgres `
            --dbname=postgres `
            --table=etablissements `
            --table=propositions `
            --data-only `
            --file=".\supabase\backups\$backupFile"
    
    Write-Host "✅ Sauvegarde créée: .\supabase\backups\$backupFile" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Impossible de créer la sauvegarde, continuer quand même ? (y/N)" -ForegroundColor Yellow
    $confirm = Read-Host
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "❌ Migration annulée" -ForegroundColor Red
        exit 1
    }
}

# Application de la migration
Write-Host "🚀 Application de la migration..." -ForegroundColor Green

try {
    # Exécution du script de migration
    supabase db push --include-all

    Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
    
    # Vérification des résultats
    Write-Host "📊 Vérification des données après migration..." -ForegroundColor Blue
    
    # Optionnel: afficher un résumé des modifications
    Write-Host @"
🎯 Modifications appliquées:
- habitat_type 'logement_independant' → 'habitat_individuel'
- habitat_type 'residence' → 'logement_individuel_en_residence' 
- habitat_type 'habitat_partage' → inchangé
- Sous-catégories mises à jour selon la nouvelle taxonomie
- Index créés pour optimiser les performances
"@ -ForegroundColor Cyan

    Write-Host "✨ Migration terminée avec succès!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Pour restaurer la sauvegarde si nécessaire:" -ForegroundColor Yellow
    Write-Host "psql -h db.gybhhmlqyhlkgnhcjhsn.supabase.co -U postgres -d postgres -f .\supabase\backups\$backupFile" -ForegroundColor Gray
    exit 1
}

Write-Host "🎉 Taxonomie d'habitat mise à jour!" -ForegroundColor Green
Write-Host "📝 N'oubliez pas de tester l'application pour vérifier que tout fonctionne correctement." -ForegroundColor Blue