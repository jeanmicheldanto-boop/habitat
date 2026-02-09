-- ====================================================================
-- VÉRIFICATION DU SYSTÈME DE NOTIFICATION DES PROPOSITIONS
-- ====================================================================

-- 1. Vérifier que le trigger existe et est activé
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  event_object_table,
  action_condition
FROM information_schema.triggers
WHERE event_object_table = 'propositions'
  AND trigger_name LIKE '%notification%';

-- 2. Vérifier que la fonction existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%proposition%notification%';

-- 3. Voir le code de la fonction
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'notify_proposition_status_change';

-- 4. Vérifier que l'extension http est activée (nécessaire pour les appels API)
SELECT * FROM pg_extension WHERE extname = 'http';

-- 5. Tester une notification (simulation)
-- Cette requête simule ce qui se passe quand on approuve une proposition
SELECT 
  p.id,
  p.statut,
  p.action,
  prof.email,
  prof.prenom,
  prof.nom,
  p.payload->>'nom' as etablissement_nom
FROM propositions p
LEFT JOIN profiles prof ON prof.id = p.created_by
WHERE p.statut IN ('approuvee', 'rejetee')
ORDER BY p.updated_at DESC
LIMIT 5;

-- 6. Vérifier les notifications in-app créées
SELECT 
  n.id,
  n.created_at,
  n.type,
  n.title,
  n.message,
  n.data->>'proposition_id' as proposition_id,
  n.read
FROM notifications n
WHERE n.type IN ('proposition_approved', 'proposition_rejected')
ORDER BY n.created_at DESC
LIMIT 10;
