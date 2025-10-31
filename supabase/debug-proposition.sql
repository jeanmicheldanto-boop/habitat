-- Voir les détails de la proposition qui pose problème
SELECT 
  id,
  action,
  type_cible,
  statut,
  source,
  created_by,
  created_at,
  etablissement_id,
  payload
FROM public.propositions
ORDER BY created_at DESC
LIMIT 1;
