#!/usr/bin/env pwsh

# Update Vercel Environment Variables
# Évite les problèmes de BOM et retours à la ligne parasites

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🚀 MISE À JOUR - VERCEL ENVIRONMENT VARIABLES                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$vars = @(
    @{ name = "SUPABASE_SECRET_KEY"; value = "[SECRET - See .env.local]" },
    @{ name = "SUPABASE_PUBLISHABLE_KEY"; value = "[SECRET - See .env.local]" },
    @{ name = "ELASTICEMAIL_API_KEY"; value = "[SECRET - See .env.local]" },
    @{ name = "GEMINI_API_KEY"; value = "[SECRET - See .env.local]" },
    @{ name = "RESEND_API_KEY"; value = "[SECRET - See .env.local]" }
)

Write-Host "📋 Variables à ajouter:`n"
foreach ($v in $vars) {
    $shortValue = $v.value.Substring(0, [math]::Min(20, $v.value.Length)) + "..."
    Write-Host "   $($v.name) = $shortValue"
}

Write-Host "`n🔧 Utilise les commandes suivantes manuellement dans Vercel Dashboard:`n"
foreach ($v in $vars) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "Variable: $($v.name)"
    Write-Host "Valeur:   $($v.value)"
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "`n📍 Adresse: https://vercel.com/dashboard → habitat → Settings → Environment Variables`n"

Write-Host "✅ OU utiliser les commandes Vercel CLI (une à la fois):`n" -ForegroundColor Green

foreach ($v in $vars) {
    Write-Host "echo $($v.value) | npx vercel env add $($v.name) --yes"
}

Write-Host "`n🎯 Vérification:`n"
Write-Host "npx vercel env list`n"

# Essayer de lire depuis le Dashboard via une API token (si disponible)
$vercelToken = $env:VERCEL_TOKEN
if ($vercelToken) {
    Write-Host "✅ Token Vercel détecté - Utilisation API possible" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Pas de token Vercel - Utilise le Dashboard manuellement" -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
