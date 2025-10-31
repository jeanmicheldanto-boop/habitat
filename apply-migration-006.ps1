# Script PowerShell pour appliquer la migration via l'API Supabase
# Ce script utilise l'API REST de Supabase pour exécuter du SQL

$supabaseUrl = "https://saqujdywlbhgnuwsrzrk.supabase.co"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcXVqZHl3bGJoZ251d3NyenJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzEyNDM0NCwiZXhwIjoyMDUyNzAwMzQ0fQ.9cYVHs0bX_YkLCBWGd_qcCfp2hKvmTdeBbH2c10-MaQ"

Write-Host "🔧 Application de la migration 006_add_slug_to_sous_categories.sql..." -ForegroundColor Cyan
Write-Host ""

# Lire le fichier SQL
$sqlContent = Get-Content -Path "supabase\migrations\006_add_slug_to_sous_categories.sql" -Raw

Write-Host "⚠️  ATTENTION: Cette migration va:" -ForegroundColor Yellow
Write-Host "  1. Ajouter un champ 'slug' à la table sous_categories" -ForegroundColor Yellow
Write-Host "  2. Remplir les slugs selon habitatTaxonomy.ts" -ForegroundColor Yellow  
Write-Host "  3. Recréer les vues v_liste_publication et v_liste_publication_geoloc" -ForegroundColor Yellow
Write-Host "  4. Les vues utiliseront désormais sc.slug au lieu de sc.libelle" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "❌ Migration annulée" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📤 Envoi de la migration à Supabase..." -ForegroundColor Cyan

# Note: L'API REST de Supabase ne permet pas d'exécuter du SQL arbitraire
# Il faut utiliser psql ou l'interface web

Write-Host ""
Write-Host "⚠️  Pour appliquer cette migration, vous devez:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ouvrir le SQL Editor dans Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/saqujdywlbhgnuwsrzrk/sql/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Copier-coller le contenu du fichier:" -ForegroundColor White
Write-Host "   supabase\migrations\006_add_slug_to_sous_categories.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Cliquer sur 'Run' pour exécuter la migration" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: utiliser psql avec la bonne chaîne de connexion" -ForegroundColor Gray
Write-Host ""

# Ouvrir le fichier dans le bloc-notes pour faciliter le copier-coller
$openFile = Read-Host "Voulez-vous ouvrir le fichier SQL dans le bloc-notes? (oui/non)"
if ($openFile -eq "oui") {
    notepad "supabase\migrations\006_add_slug_to_sous_categories.sql"
}
