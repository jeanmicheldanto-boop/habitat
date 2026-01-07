-- Vérifier quels triggers existent dans la base

SELECT 
  trigger_name,
  event_manipulation as "event",
  event_object_table as "table",
  action_statement as "function"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
