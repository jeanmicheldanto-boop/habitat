-- Test de la fonction send-notification avec Resend
-- Remplacez 'votre-email@exemple.com' par votre vraie adresse email pour tester

-- 1. Test email de bienvenue
SELECT
  net.http_post(
    url:='https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"}'::jsonb,
    body:=jsonb_build_object(
      'email', 'patrick.danto@outlook.fr',
      'name', 'Test Utilisateur',
      'type', 'welcome'
    )
  ) as request_id;

-- 2. Test email de création d'établissement
SELECT
  net.http_post(
    url:='https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"}'::jsonb,
    body:=jsonb_build_object(
      'email', 'patrick.danto@outlook.fr',
      'name', 'Test Utilisateur',
      'type', 'etablissement_created',
      'etablissement', 'Résidence Test'
    )
  ) as request_id;

-- 3. Test email de réclamation approuvée
SELECT
  net.http_post(
    url:='https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTI0NjIsImV4cCI6MjA0NTY4ODQ2Mn0.4iyuPw7IuDNpL6QyK8c5HOB_v0ydg3_IEaIrqpRvXgg"}'::jsonb,
    body:=jsonb_build_object(
      'email', 'patrick.danto@outlook.fr',
      'name', 'Test Utilisateur',
      'type', 'reclamation_status_change',
      'etablissement', 'Résidence Test',
      'statut', 'verifiee'
    )
  ) as request_id;
