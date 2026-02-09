-- ====================================================================
-- DEBUG : PROPOSITION MAISON MOCHEZ
-- ====================================================================

-- 1. Voir TOUTES les données de la proposition
SELECT 
  id,
  created_by,
  statut,
  action,
  etablissement_id,
  review_note,
  created_at,
  payload
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 2. Vérifier si created_by existe
SELECT 
  p.id,
  p.created_by,
  p.created_by IS NULL as "pas_de_created_by"
FROM propositions p
WHERE p.id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 3. Si created_by existe, vérifier le profil
SELECT 
  p.id,
  p.created_by,
  prof.id as profile_id,
  prof.email,
  prof.prenom,
  prof.nom
FROM propositions p
LEFT JOIN profiles prof ON prof.id = p.created_by
WHERE p.id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 4. Voir tous les champs du profil si il existe
SELECT *
FROM profiles
WHERE id = (SELECT created_by FROM propositions WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e');

-- 5. Vérifier la structure du payload
SELECT 
  id,
  payload->>'nom' as nom_direct,
  payload->'modifications'->>'nom' as nom_modifications,
  jsonb_pretty(payload) as payload_complet
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';
