-- ========================================
-- VÉRIFIER TOUTES LES PROPOSITIONS ET ÉTABLISSEMENTS
-- ========================================

-- Compter toutes les propositions par statut
SELECT statut, COUNT(*) as count
FROM propositions
GROUP BY statut;

-- Voir toutes les propositions (toutes)
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
LIMIT 20;

-- Compter tous les établissements
SELECT COUNT(*) as total_etablissements
FROM etablissements;

-- Voir tous les établissements récents
SELECT 
    id,
    nom,
    commune,
    statut_editorial,
    created_at
FROM etablissements 
ORDER BY created_at DESC
LIMIT 20;
