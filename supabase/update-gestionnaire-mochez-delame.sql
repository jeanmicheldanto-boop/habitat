-- ====================================================================
-- METTRE À JOUR GESTIONNAIRE ET DESCRIPTION POUR MAISON MOCHEZ ET DELAME
-- ====================================================================

-- 1. Maison Mochez : Mettre à jour le gestionnaire si vide
UPDATE etablissements
SET gestionnaire = 'Watt''Home'
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba'
AND (gestionnaire IS NULL OR TRIM(gestionnaire) = '');

-- 2. Maison Delame : Mettre à jour le gestionnaire et la description
UPDATE etablissements
SET 
  gestionnaire = 'Watt''Home',
  presentation = 'La Maison Delame, ouverte en octobre 2017 à Onnaing, est le premier habitat inclusif développé par Watt''Home. Cette maison accueille 5 personnes âgées en perte d''autonomie modérée dans un cadre familial et sécurisant. Avec un accompagnement 24h/24, des repas préparés sur place et des activités quotidiennes adaptées, elle offre une alternative bienveillante entre le domicile et l''EHPAD. Les résidents y conservent leur liberté de choix tout en bénéficiant d''un environnement chaleureux où se tissent des liens d''entraide.'
WHERE id = 'e55d42b0-d0fd-4975-8ff5-674beaf34785';

-- ====================================================================
-- VÉRIFIER LES MISES À JOUR
-- ====================================================================

-- Maison Mochez après maj
SELECT 
  id,
  nom,
  gestionnaire,
  'Mise à jour gestionnaire' as action
FROM etablissements 
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';

-- Maison Delame après maj
SELECT 
  id,
  nom,
  gestionnaire,
  LEFT(presentation, 80) || '...' as presentation_preview,
  'Mise à jour gestionnaire + description' as action
FROM etablissements 
WHERE id = 'e55d42b0-d0fd-4975-8ff5-674beaf34785';
