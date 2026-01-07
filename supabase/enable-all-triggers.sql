-- ========================================
-- RÉACTIVER TOUS LES TRIGGERS DE NOTIFICATION
-- À utiliser APRÈS l'import en masse
-- ========================================

-- 1. Réactiver le trigger de bienvenue
ALTER TABLE profiles ENABLE TRIGGER welcome_gestionnaire_notification;

-- 2. Réactiver les triggers d'établissement (si ils existent)
DO $$
BEGIN
  ALTER TABLE etablissements ENABLE TRIGGER etablissement_creation_notification;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE etablissements ENABLE TRIGGER etablissement_update_notification;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 3. Réactiver les triggers de réclamation (si ils existent)
DO $$
BEGIN
  ALTER TABLE reclamations_propriete ENABLE TRIGGER reclamation_creation_notification;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE reclamations_propriete ENABLE TRIGGER reclamation_status_notification;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Vérifier que tous sont activés
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  CASE t.tgenabled 
    WHEN 'O' THEN '✅ Activé'
    WHEN 'D' THEN '❌ Désactivé'
    ELSE 'Autre'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname LIKE '%notification%'
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY c.relname, t.tgname;
