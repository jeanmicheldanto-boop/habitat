-- CONSULTATION UNIQUEMENT: Vérifier pourquoi l'INSERT medias échoue

-- 1. Policies INSERT sur la table medias
SELECT 
  policyname,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as a_with_check
FROM pg_policies
WHERE tablename = 'medias'
AND cmd = 'INSERT'
ORDER BY policyname;

COMMENT ON QUERY IS '=== SECTION 2 ===';

-- 2. Lien etablissement_proprietaires pour La Maison Ossunaise
SELECT 
  ep.user_id,
  ep.role,
  ep.active,
  ep.created_at,
  e.nom as etablissement_nom
FROM etablissement_proprietaires ep
JOIN etablissements e ON e.id = ep.etablissement_id
WHERE ep.etablissement_id = 'b71d1c07-b400-41f9-a5aa-40eb55d78b71';
