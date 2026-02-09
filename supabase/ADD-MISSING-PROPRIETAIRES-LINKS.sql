-- Script: Ajouter les liens proprietaires pour les réclamations approuvées
-- Problème: Les réclamations approuvées AVANT le fix ne ont pas le lien dans etablissement_proprietaires
-- Solution: Créer les liens manquants

-- 1. Vérifier la structure de etablissement_proprietaires
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'etablissement_proprietaires';

-- 2. Trouver toutes les réclamations approuvées SANS lien proprietaire
SELECT 
  rp.id,
  rp.user_id,
  rp.etablissement_id,
  rp.statut
FROM reclamations_propriete rp
WHERE rp.statut = 'verifiee'
  AND NOT EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = rp.etablissement_id 
    AND ep.user_id = rp.user_id
  );

-- 3. Si vous voyez des résultats ci-dessus, exécutez ce bloc pour créer les liens:
INSERT INTO etablissement_proprietaires (etablissement_id, user_id, active)
SELECT DISTINCT 
  rp.etablissement_id,
  rp.user_id,
  true
FROM reclamations_propriete rp
WHERE rp.statut = 'verifiee'
  AND NOT EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = rp.etablissement_id 
    AND ep.user_id = rp.user_id
  );

-- 4. Vérification: Afficher les liens créés
SELECT 
  ep.etablissement_id,
  ep.user_id,
  ep.role,
  ep.active,
  e.nom as etablissement_nom
FROM etablissement_proprietaires ep
JOIN etablissements e ON ep.etablissement_id = e.id
WHERE ep.user_id IN (
  SELECT DISTINCT user_id FROM reclamations_propriete WHERE statut = 'verifiee'
)
ORDER BY ep.etablissement_id;

-- 5. Vérifier l'état ACTUEL de TOUTES les réclamations
SELECT 
  rp.id,
  rp.user_id,
  rp.etablissement_id,
  rp.statut,
  e.nom as etablissement_nom,
  CASE WHEN ep.user_id IS NULL THEN 'MANQUANT' ELSE 'PRESENT' END as proprietaire_lien
FROM reclamations_propriete rp
JOIN etablissements e ON rp.etablissement_id = e.id
LEFT JOIN etablissement_proprietaires ep 
  ON rp.etablissement_id = ep.etablissement_id 
  AND rp.user_id = ep.user_id
ORDER BY rp.created_at DESC;
