# GUIDE: Voir les logs des notifications

## 1. Logs de l'Edge Function send-notification
```powershell
# Via Supabase CLI
supabase functions logs send-notification --project-ref minwoumfgutampcgrcbr
```

Ou dans le Dashboard Supabase:
- Allez sur https://supabase.com/dashboard/project/minwoumfgutampcgrcbr
- Cliquez sur "Edge Functions" dans le menu
- Cliquez sur "send-notification"
- Onglet "Logs"

## 2. Logs PostgreSQL des triggers
```sql
-- Voir les warnings/notices récents
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%notify_welcome%' 
ORDER BY last_exec_time DESC 
LIMIT 10;

-- Vérifier les erreurs pg_net
SELECT * FROM net._http_response 
ORDER BY created_at DESC 
LIMIT 10;
```

## 3. Tester manuellement l'envoi d'email
```sql
-- Simuler l'appel HTTP du trigger
SELECT net.http_post(
  url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
  body := jsonb_build_object(
    'email', 'jeanmichel.danto@gmail.com',
    'name', 'Patrick Danto',
    'type', 'welcome'
  ),
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDExMjQ2MiwiZXhwIjoyMDQ1Njg4NDYyfQ.hE_w8kN52g1HKgV3TzBrZr0Y56wv5J_AoGrAiNrXCNo'
  )
);

-- Voir la réponse
SELECT * FROM net._http_response ORDER BY created_at DESC LIMIT 1;
```

## 4. Dashboard Resend
Vérifiez https://resend.com/emails pour voir si les emails sont envoyés mais non délivrés.
