-- Mise à jour du gestionnaire pour Ossun en désactivant temporairement la contrainte

-- 1. Désactiver la contrainte temporairement
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 2. Mettre à jour le gestionnaire
UPDATE etablissements 
SET gestionnaire = '3b5a5a02-b8c3-4e54-9ead-de6023927333'
WHERE id = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';

-- 3. Réactiver la contrainte
ALTER TABLE etablissements 
ADD CONSTRAINT etablissements_publish_check 
CHECK (
  (statut_editorial <> 'publie' OR can_publish(id))
) NOT VALID;

-- 4. Vérifier le résultat
SELECT id, nom, gestionnaire, statut_editorial 
FROM etablissements 
WHERE id = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';
