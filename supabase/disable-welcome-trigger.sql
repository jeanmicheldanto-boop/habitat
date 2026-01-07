-- ========================================
-- DÉSACTIVER TEMPORAIREMENT LE TRIGGER DE BIENVENUE
-- Pour permettre l'inscription sans blocage
-- ========================================

ALTER TABLE profiles DISABLE TRIGGER welcome_gestionnaire_notification;

-- Vérifier qu'il est bien désactivé
SELECT 
  t.tgname as trigger_name,
  CASE t.tgenabled 
    WHEN 'O' THEN 'Activé'
    WHEN 'D' THEN 'Désactivé'
    ELSE 'Autre'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'profiles'
  AND t.tgname = 'welcome_gestionnaire_notification';
