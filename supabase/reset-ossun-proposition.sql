-- ========================================
-- REMETTRE OSSUN EN PROPOSITION À MODÉRER
-- ========================================

-- 1. Trouver la proposition et l'établissement
SELECT 
    p.id as proposition_id, 
    p.statut as proposition_statut,
    p.etablissement_id,
    e.id as etablissement_id_reel,
    e.nom as etablissement_nom
FROM propositions p 
LEFT JOIN etablissements e ON p.etablissement_id = e.id 
WHERE e.nom ILIKE '%ossun%' 
   OR (p.payload->>'nom') ILIKE '%ossun%'
ORDER BY p.created_at DESC 
LIMIT 5;

-- 2. Supprimer l'établissement Ossun
DELETE FROM etablissements 
WHERE nom ILIKE '%ossun%'
RETURNING id, nom;

-- 3. Remettre la proposition en 'en_attente'
UPDATE propositions
SET 
    statut = 'en_attente',
    etablissement_id = NULL
WHERE (payload->>'nom') ILIKE '%ossun%'
RETURNING id, statut, etablissement_id;
