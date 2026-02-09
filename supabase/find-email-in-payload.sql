-- ====================================================================
-- CHERCHER L'EMAIL DANS LE PAYLOAD
-- ====================================================================

-- 1. Voir la structure complète du payload
SELECT 
  id,
  jsonb_pretty(payload) as payload_structure
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 2. Chercher tous les champs qui pourraient contenir l'email
SELECT 
  id,
  payload->>'email' as email_direct,
  payload->'proposeur'->>'email' as email_proposeur,
  payload->'modifications'->>'email' as email_modifications,
  payload->>'contact_email' as contact_email,
  payload->>'proposeur_email' as proposeur_email
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';

-- 3. Chercher le nom
SELECT 
  id,
  payload->>'nom_proposeur' as nom_proposeur,
  payload->>'prenom_proposeur' as prenom_proposeur,
  payload->'proposeur'->>'nom' as proposeur_nom,
  payload->'proposeur'->>'prenom' as proposeur_prenom,
  payload->>'name' as name,
  payload->>'contact_name' as contact_name
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';
