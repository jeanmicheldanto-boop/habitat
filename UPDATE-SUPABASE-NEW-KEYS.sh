#!/bin/bash

# 🔐 MISE À JOUR - Nouvelles clés Supabase (2026)
# Supabase a changé: service_role_key → sb_secret_*

# 1. Copier la clé secrète du Dashboard
# Supabase Dashboard → Settings → API Keys
# Section "Secret keys" → Copier la clé (sb_secret_...)

# 2. Mettre à jour .env.local
# AVANT: SUPABASE_SERVICE_ROLE_KEY=...
# APRÈS:
SUPABASE_SECRET_KEY="votre_sb_secret_key_ici"

# 3. Les Edge Functions vont utiliser:
# const SECRET_KEY = Deno.env.get('SUPABASE_SECRET_KEY')

# 4. Redéployer les Edge Functions
supabase functions deploy send-verification-email
supabase functions deploy confirm-email

# 5. Vérifier les env vars
grep -E "SUPABASE_SECRET_KEY|sb_" .env.local

echo "✅ Mise à jour complète"
