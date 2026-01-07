-- ========================================
-- REMETTRE LA PROPOSITION OSSUN EN 'EN_ATTENTE'
-- ========================================

-- Trouver la proposition Ossun (même si approuvée)
SELECT 
    id,
    statut,
    etablissement_id,
    payload->>'nom' as nom,
    payload->>'commune' as commune
FROM propositions 
WHERE (payload->>'commune') ILIKE '%ossun%';

-- Remettre en 'en_attente' et détacher l'établissement
UPDATE propositions
SET 
    statut = 'en_attente',
    etablissement_id = NULL
WHERE (payload->>'commune') ILIKE '%ossun%'
RETURNING id, statut, etablissement_id, payload->>'nom' as nom, payload->>'commune' as commune;
