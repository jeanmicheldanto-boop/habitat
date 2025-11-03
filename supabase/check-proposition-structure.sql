-- Script pour vérifier la structure de la table propositions_corrections

-- 1. Structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'propositions_corrections'
ORDER BY ordinal_position;

-- 2. Voir quelques exemples de propositions
SELECT 
  id,
  etablissement_id,
  action,
  source,
  statut,
  created_at,
  payload::text as payload_preview
FROM propositions_corrections
ORDER BY created_at DESC
LIMIT 5;

-- 3. Vérifier les propositions avec erreur potentielle
SELECT 
  id,
  etablissement_id,
  action,
  statut,
  payload->'modifications' as modifications,
  payload->'nouvelle_photo_base64' IS NOT NULL as has_photo
FROM propositions_corrections
WHERE statut = 'en_attente'
ORDER BY created_at DESC
LIMIT 10;
