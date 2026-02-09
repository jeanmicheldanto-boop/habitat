-- ====================================================================
-- ENVOYER MANUELLEMENT L'EMAIL D'APPROBATION POUR MAISON MOCHEZ
-- ====================================================================
-- Ce script envoie l'email et crée la notification in-app manuellement

-- 1. Récupérer les infos de la proposition
SELECT 
  p.id as proposition_id,
  p.statut,
  p.action,
  p.payload->>'nom' as etablissement_nom,
  p.payload->'modifications'->>'nom' as etablissement_nom_modif,
  p.created_by as user_id,
  COALESCE(prof.email, p.payload->'proposeur'->>'email') as email,
  COALESCE(prof.prenom, p.payload->'proposeur'->>'prenom', '') as prenom,
  COALESCE(prof.nom, p.payload->'proposeur'->>'nom', '') as nom,
  p.review_note
FROM propositions p
LEFT JOIN profiles prof ON prof.id = p.created_by
WHERE p.id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 2. Créer la notification in-app si elle n'existe pas déjà
-- Note: Pour les propositions anonymes, on ne crée pas de notification in-app (pas d'user_id)
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
  p.created_by,
  'proposition_approved',
  'Proposition approuvée',
  'Votre demande de modification d''établissement a été approuvée !',
  jsonb_build_object(
    'proposition_id', p.id,
    'review_note', p.review_note
  )
FROM propositions p
WHERE p.id = '38b4d49d-15c8-48a9-912a-0593098d426e'
  AND p.created_by IS NOT NULL  -- Seulement si utilisateur authentifié
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.user_id = p.created_by 
      AND n.data->>'proposition_id' = p.id::text
  )
RETURNING id, type, title, message;

-- 3. Appeler la fonction edge pour envoyer l'email via HTTP
-- Note: Ceci nécessite que l'extension pg_net soit activée
SELECT 
  net.http_post(
    url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
    body := json_build_object(
      'email', COALESCE(prof.email, p.payload->'proposeur'->>'email'),
      'name', TRIM(COALESCE(prof.prenom, p.payload->'proposeur'->>'prenom', '') || ' ' || COALESCE(prof.nom, p.payload->'proposeur'->>'nom', '')),
      'etablissement', COALESCE(p.payload->'modifications'->>'nom', p.payload->>'nom', 'votre établissement'),
      'statut', p.statut,
      'action', p.action,
      'review_note', p.review_note,
      'hasAccount', p.created_by IS NOT NULL,
      'etablissement_id', p.etablissement_id
    )::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE'
    )
    -- ⚠️ NOTER: Cette clé exposée a été révoquée le 9 février 2026
    -- ⚠️ Utiliser `supabase functions deploy` pour les Edge Functions (auto-inject la clé)
  ) as http_request_id
FROM propositions p
LEFT JOIN profiles prof ON prof.id = p.created_by
WHERE p.id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 4. Vérifier que l'email a bien été envoyé (check le statut HTTP)
-- Si le statut est 200, c'est bon !
