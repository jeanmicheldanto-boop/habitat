-- Vérifier les propositions dans la base de données

-- 1. Compter toutes les propositions
SELECT 
  'TOTAL PROPOSITIONS' as info,
  COUNT(*) as total
FROM public.propositions;

-- 2. Compter par statut
SELECT 
  'PROPOSITIONS PAR STATUT' as info,
  statut,
  COUNT(*) as total
FROM public.propositions
GROUP BY statut;

-- 3. Lister les 10 dernières propositions
SELECT 
  id,
  type_cible,
  action,
  statut,
  source,
  created_by,
  created_at,
  etablissement_id
FROM public.propositions
ORDER BY created_at DESC
LIMIT 10;

-- 4. Voir les propositions avec les infos du proposeur dans le payload
SELECT 
  id,
  statut,
  source,
  created_at,
  payload->'proposeur' as proposeur_info,
  payload->'modifications' as modifications
FROM public.propositions
WHERE source = 'public'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Vérifier si created_by est NULL pour les propositions publiques
SELECT 
  'PROPOSITIONS AVEC created_by NULL' as info,
  COUNT(*) as total
FROM public.propositions
WHERE created_by IS NULL;
