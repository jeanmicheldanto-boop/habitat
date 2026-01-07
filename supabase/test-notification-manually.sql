-- ========================================
-- TESTER MANUELLEMENT L'ENVOI D'EMAIL
-- ========================================

-- 1. Tester l'appel HTTP avec pg_net (comme le trigger)
SELECT net.http_post(
  url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
  body := jsonb_build_object(
    'email', 'jeanmichel.danto@gmail.com',
    'name', 'Patrick Danto',
    'type', 'welcome'
  ),
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
  ),
  timeout_milliseconds := 5000
) as request_id;

-- 2. Attendre quelques secondes, puis vérifier la réponse
SELECT 
  id,
  status_code,
  content::text,
  created,
  error_msg
FROM net._http_response 
ORDER BY created DESC 
LIMIT 5;
