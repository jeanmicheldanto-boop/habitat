-- ========================================
-- RÉCUPÉRER LE SERVICE ROLE KEY
-- ========================================

-- Le service_role_key actuel dans les triggers est invalide (401 Invalid JWT)

-- Pour obtenir le vrai service_role_key :
-- 1. Allez sur https://supabase.com/dashboard/project/minwoumfgutampcgrcbr/settings/api
-- 2. Copiez la clé "service_role" (secret) dans la section "Project API keys"
-- 3. Remplacez dans ce fichier la variable ci-dessous
-- 4. Puis exécutez ce script pour mettre à jour TOUS les triggers

-- COLLEZ LE VRAI SERVICE_ROLE_KEY ICI :
-- 'Bearer VOTRE_VRAIE_CLE_SERVICE_ROLE'

-- Une fois que vous avez la vraie clé, je mettrai à jour tous les triggers
