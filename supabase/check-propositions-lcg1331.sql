-- ========================================
-- VÉRIFIER LES PROPOSITIONS EN ATTENTE
-- ========================================

-- 1. Propositions créées par lcg1331@gmail.com
SELECT 
  p.id,
  p.type_cible,
  p.action,
  p.statut,
  p.created_at,
  p.payload->>'nom' as nom_etablissement,
  p.payload->>'commune' as commune
FROM propositions p
WHERE p.created_by = (SELECT id FROM profiles WHERE email = 'lcg1331@gmail.com')
ORDER BY p.created_at DESC;

-- 2. Toutes les propositions récentes (dernières 24h)
SELECT 
  p.id,
  p.type_cible,
  p.action,
  p.statut,
  p.created_at,
  p.payload->>'nom' as nom_etablissement,
  pr.email as createur_email
FROM propositions p
LEFT JOIN profiles pr ON pr.id = p.created_by
WHERE p.created_at > NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;

-- 3. Compter les propositions par statut
SELECT 
  statut,
  COUNT(*) as nombre
FROM propositions
GROUP BY statut;
