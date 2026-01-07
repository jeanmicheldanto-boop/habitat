-- ========================================
-- RECHERCHE PLUS LARGE DES PROPOSITIONS
-- ========================================

-- Voir toutes les propositions récentes (dernières 10)
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
ORDER BY created_at DESC
LIMIT 10;

-- Voir tous les établissements récents (derniers 10)
SELECT 
    id,
    nom,
    commune,
    statut_editorial,
    gestionnaire,
    created_at
FROM etablissements 
ORDER BY created_at DESC
LIMIT 10;
