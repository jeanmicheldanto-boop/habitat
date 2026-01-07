-- ========================================
-- DIAGNOSTIC ÉTABLISSEMENT CRÉÉ PAR lcg1331@gmail.com
-- ========================================

-- 1. Trouver l'ID du gestionnaire
SELECT id, email, prenom, nom, role
FROM profiles
WHERE email = 'lcg1331@gmail.com';

-- 2. Vérifier les établissements créés récemment (dernières 24h)
SELECT 
  e.id,
  e.nom,
  e.commune,
  e.code_postal,
  e.created_at
FROM etablissements e
WHERE e.created_at > NOW() - INTERVAL '24 hours'
ORDER BY e.created_at DESC;

-- 2b. Tous les établissements (sans filtre de date)
SELECT 
  e.id,
  e.nom,
  e.commune,
  e.created_at
FROM etablissements e
ORDER BY e.created_at DESC
LIMIT 10;

-- 3. Vérifier les relations propriétaire pour ce gestionnaire
SELECT 
  ep.etablissement_id,
  ep.user_id,
  ep.role,
  ep.active,
  e.nom as etablissement_nom
FROM etablissement_proprietaires ep
JOIN etablissements e ON e.id = ep.etablissement_id
WHERE ep.user_id = (SELECT id FROM profiles WHERE email = 'lcg1331@gmail.com')
ORDER BY e.created_at DESC;

-- 4. Vérifier tous les établissements (vue admin)
SELECT 
  e.id,
  e.nom,
  e.commune,
  e.created_at,
  COUNT(ep.user_id) as nb_proprietaires
FROM etablissements e
LEFT JOIN etablissement_proprietaires ep ON ep.etablissement_id = e.id
WHERE e.created_at > NOW() - INTERVAL '1 hour'
GROUP BY e.id, e.nom, e.commune, e.created_at
ORDER BY e.created_at DESC;
