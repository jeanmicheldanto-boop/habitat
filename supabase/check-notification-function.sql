-- Vérifier le contenu de la fonction de notification actuelle
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_notification_on_status_change';
