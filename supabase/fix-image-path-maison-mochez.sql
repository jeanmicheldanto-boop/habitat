-- ====================================================================
-- CORRECTION DU CHEMIN D'IMAGE POUR MAISON MOCHEZ
-- ====================================================================
-- Ajoute le préfixe 'etablissements/' aux chemins d'images qui ne l'ont pas
-- Car le bucket Supabase Storage s'appelle 'etablissements'

-- 1. Vérifier l'état actuel
SELECT 
  id, 
  nom, 
  image_path,
  CASE 
    WHEN image_path IS NULL THEN 'Pas d''image'
    WHEN image_path LIKE 'etablissements/%' THEN 'Chemin correct'
    ELSE 'Chemin à corriger'
  END as statut
FROM etablissements 
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';

-- 2. Corriger le chemin (ajouter le préfixe 'etablissements/')
UPDATE etablissements 
SET image_path = 'etablissements/' || image_path
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba'
  AND image_path IS NOT NULL
  AND image_path NOT LIKE 'etablissements/%'
RETURNING id, nom, image_path;

-- 3. Vérifier après correction
SELECT 
  id, 
  nom, 
  image_path,
  'https://dcezggqkjptsmbnhzhjt.supabase.co/storage/v1/object/public/' || image_path as url_complete
FROM etablissements 
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';

-- 4. (OPTIONNEL) Corriger TOUS les établissements avec ce problème
-- Décommenter si nécessaire :
/*
UPDATE etablissements 
SET image_path = 'etablissements/' || image_path
WHERE image_path IS NOT NULL
  AND image_path NOT LIKE 'etablissements/%'
  AND image_path NOT LIKE 'http%'
RETURNING id, nom, image_path;
*/
