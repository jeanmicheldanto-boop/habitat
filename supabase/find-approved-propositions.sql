-- ========================================
-- RECHERCHER TOUTES LES PROPOSITIONS APPROUVÉES
-- ========================================

-- Voir toutes les propositions approuvées ou rejetées (pas en_attente)
SELECT 
    id,
    type_cible,
    action,
    statut,
    source,
    etablissement_id,
    created_at,
    payload->>'nom' as nom,
    payload->>'commune' as commune,
    payload->>'adresse_l1' as adresse
FROM propositions 
WHERE statut != 'en_attente'
ORDER BY created_at DESC
LIMIT 10;

-- Voir les établissements créés récemment
SELECT 
    id,
    nom,
    commune,
    statut_editorial,
    created_at,
    updated_at
FROM etablissements 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
