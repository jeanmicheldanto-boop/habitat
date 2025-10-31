-- Vérifier toutes les propositions dans la base

-- 1. Compter par action
SELECT 
  'PROPOSITIONS PAR ACTION' as info,
  action,
  COUNT(*) as total
FROM public.propositions
GROUP BY action;

-- 2. Lister toutes les propositions récentes
SELECT 
  id,
  action,
  type_cible,
  statut,
  source,
  created_at,
  etablissement_id,
  payload->'proposeur'->>'nom' as proposeur_nom,
  payload->'proposeur'->>'email' as proposeur_email
FROM public.propositions
ORDER BY created_at DESC
LIMIT 10;

-- 3. Voir spécifiquement les propositions UPDATE
SELECT 
  'PROPOSITIONS UPDATE' as info,
  id,
  statut,
  source,
  created_at,
  etablissement_id,
  payload->'proposeur' as proposeur,
  payload->'modifications' as modifications
FROM public.propositions
WHERE action = 'update'
ORDER BY created_at DESC;
