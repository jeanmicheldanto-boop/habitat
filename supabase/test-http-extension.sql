-- Test direct de l'appel HTTP depuis PostgreSQL
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier que l'extension http existe
SELECT * FROM pg_available_extensions WHERE name = 'http';

-- 2. Vérifier qu'elle est activée
SELECT * FROM pg_extension WHERE extname = 'http';

-- 3. Test SANS headers (retourne 401)
SELECT '=== Test SANS headers ===' as test;
SELECT status, content FROM http_post(
  'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
  '{"email":"patrick.genevaux@proton.me","name":"Test Direct","etablissement":"Test","statut":"approuvee"}',
  'application/json'
);

-- 4. Test avec Authorization: Bearer service_role_key
SELECT '=== Test AVEC Authorization service_role ===' as test;
-- ATTENTION: NE JAMAIS COMMITER LA SERVICE_ROLE_KEY
-- Remplacez YOUR_SERVICE_ROLE_KEY par votre vraie clé uniquement en local
SELECT status, content FROM http((
  'POST',
  'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
  ARRAY[
    http_header('Content-Type', 'application/json'),
    http_header('Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY')
  ],
  'application/json',
  '{"email":"patrick.genevaux@proton.me","name":"Test Direct","etablissement":"Test","statut":"approuvee"}'
));
