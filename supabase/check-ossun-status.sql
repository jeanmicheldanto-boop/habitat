-- ========================================
-- VÉRIFIER L'ÉTAT DE LA PROPOSITION OSSUN
-- ========================================

-- Vérifier toutes les propositions avec "ossun"
SELECT 
    id,
    type_cible,
    action,
    statut,
    source,
    etablissement_id,
    created_at,
    payload->>'nom' as nom_payload,
    payload->>'commune' as commune_payload
FROM propositions 
WHERE (payload->>'commune') ILIKE '%ossun%'
ORDER BY created_at DESC;

-- Vérifier l'établissement Ossun
SELECT 
    id,
    nom,
    commune,
    statut_editorial,
    gestionnaire,
    created_at
FROM etablissements 
WHERE commune ILIKE '%ossun%';
