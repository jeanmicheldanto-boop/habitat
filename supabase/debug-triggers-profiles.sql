-- ========================================
-- DEBUG DES TRIGGERS SUR LA TABLE PROFILES
-- ========================================

-- 1. Lister tous les triggers actifs sur profiles
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  t.tgtype,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'profiles'
AND t.tgname NOT LIKE 'RI_%'  -- Exclure les triggers internes
ORDER BY t.tgname;

-- 2. Désactiver temporairement le trigger de bienvenue si nécessaire
-- ALTER TABLE profiles DISABLE TRIGGER welcome_gestionnaire_notification;

-- 3. Pour réactiver après test
-- ALTER TABLE profiles ENABLE TRIGGER welcome_gestionnaire_notification;

-- 4. Vérifier la structure de profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
