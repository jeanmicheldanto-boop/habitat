-- Test simple: créer un utilisateur de test et déclencher l'envoi

-- D'abord, vérifiez que l'extension http est activée
CREATE EXTENSION IF NOT EXISTS http;

-- Test manuel de la fonction via HTTP depuis Postgres
SELECT * FROM http((
  'POST',
  'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
  ARRAY[http_header('Content-Type', 'application/json'), http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))],
  'application/json',
  '{"email":"patrick.danto@outlook.fr","name":"Patrick Test","type":"welcome"}'
)::http_request);
