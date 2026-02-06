-- Vérifier que le trigger de notification est bien installé et actif
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier si le trigger existe
SELECT 
  trigger_name,
  event_manipulation as event_type,
  action_timing as timing,
  action_statement as function_called
FROM information_schema.triggers
WHERE event_object_table = 'propositions'
  AND trigger_schema = 'public'
  AND trigger_name LIKE '%notification%'
ORDER BY trigger_name;

-- Si aucun résultat, le trigger n'est PAS installé!
-- → Exécutez: supabase/add-notification-trigger.sql

-- 2. Vérifier si la fonction existe
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notify%'
ORDER BY routine_name;

-- 3. Vérifier si l'extension http est activée (nécessaire pour le trigger)
SELECT * FROM pg_extension WHERE extname = 'http';

-- Si pas de résultat, exécutez:
-- CREATE EXTENSION IF NOT EXISTS http;

-- 4. Tester manuellement l'envoi depuis la fonction trigger
-- (Remplacez les valeurs par des vraies données)
SELECT notify_proposition_status_change();

-- 5. Vérifier les dernières propositions qui ont changé de statut
SELECT 
  id,
  created_by,
  statut,
  reviewed_at,
  payload->>'nom' as etablissement_nom,
  (SELECT email FROM profiles WHERE id = propositions.created_by) as email_destinataire
FROM propositions
WHERE statut IN ('approuvee', 'rejetee')
  AND reviewed_at > NOW() - INTERVAL '1 hour'
ORDER BY reviewed_at DESC;

-- 6. Compter les propositions qui devraient avoir déclenché un email
SELECT 
  statut,
  COUNT(*) as nombre,
  MAX(reviewed_at) as derniere_action
FROM propositions
WHERE statut IN ('approuvee', 'rejetee')
  AND reviewed_at > NOW() - INTERVAL '24 hours'
GROUP BY statut;
