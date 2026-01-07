-- ========================================
-- CORRECTION DES CODES POSTAUX À 4 CHIFFRES
-- ========================================
-- Ce script corrige les codes postaux qui ont perdu leur 0 initial

-- 0. Désactiver temporairement la contrainte de publication
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 1. Vérifier le type de la colonne code_postal
SELECT 
  table_name,
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'etablissements' 
  AND column_name = 'code_postal';

-- 2. Trouver tous les établissements avec un code postal à 4 chiffres
SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE LENGTH(code_postal) = 4
ORDER BY code_postal
LIMIT 20;

-- 2b. Vérifier les codes postaux avec un point à la fin (comme l'Aisne)
SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE code_postal LIKE '%.%'
LIMIT 20;

-- 2c. Nettoyer les points à la fin des codes postaux
UPDATE etablissements
SET code_postal = RTRIM(code_postal, '.')
WHERE code_postal LIKE '%.%';

-- 2d. Compter combien d'établissements seront corrigés
SELECT 
  'Établissements à corriger (code postal à 4 chiffres)' as info,
  COUNT(*) as nombre
FROM etablissements
WHERE LENGTH(code_postal) = 4;

-- 3. Corriger les codes postaux, départements ET régions en une seule opération
UPDATE etablissements
SET 
  code_postal = '0' || code_postal,
  departement = CASE LEFT(code_postal, 1)
    WHEN '1' THEN 'Ain (01)'
    WHEN '2' THEN 'Aisne (02)'
    WHEN '3' THEN 'Allier (03)'
    WHEN '4' THEN 'Alpes-de-Haute-Provence (04)'
    WHEN '5' THEN 'Hautes-Alpes (05)'
    WHEN '6' THEN 'Alpes-Maritimes (06)'
    WHEN '7' THEN 'Ardèche (07)'
    WHEN '8' THEN 'Ardennes (08)'
    WHEN '9' THEN 'Ariège (09)'
  END,
  region = CASE 
    WHEN LEFT(code_postal, 1) = '1' THEN 'Auvergne-Rhône-Alpes'  -- 01
    WHEN LEFT(code_postal, 1) = '2' THEN 'Hauts-de-France'        -- 02
    WHEN LEFT(code_postal, 1) = '3' THEN 'Auvergne-Rhône-Alpes'  -- 03
    WHEN LEFT(code_postal, 1) = '4' THEN 'Provence-Alpes-Côte d''Azur'  -- 04
    WHEN LEFT(code_postal, 1) = '5' THEN 'Provence-Alpes-Côte d''Azur'  -- 05
    WHEN LEFT(code_postal, 1) = '6' THEN 'Provence-Alpes-Côte d''Azur'  -- 06
    WHEN LEFT(code_postal, 1) = '7' THEN 'Auvergne-Rhône-Alpes'  -- 07
    WHEN LEFT(code_postal, 1) = '8' THEN 'Hauts-de-France'        -- 08
    WHEN LEFT(code_postal, 1) = '9' THEN 'Occitanie'              -- 09
    ELSE region
  END
WHERE LENGTH(code_postal) = 4;

-- 4. Corriger les départements pour tous les autres établissements si nécessaire
UPDATE etablissements
SET departement = LEFT(code_postal, 2)
WHERE LENGTH(code_postal) = 5
  AND (departement IS NULL OR LENGTH(departement) != 2);

-- 5. Réactiver la contrainte de publication
ALTER TABLE etablissements ADD CONSTRAINT etablissements_publish_check 
  CHECK ((statut_editorial <> 'publie'::public.statut_editorial) OR public.can_publish(id)) NOT VALID;

-- 6. Vérification finale
SELECT 
  departement,
  region,
  COUNT(*) as nb_etablissements,
  MIN(code_postal) as code_postal_min,
  MAX(code_postal) as code_postal_max
FROM etablissements
WHERE departement IN ('01', '02', '03', '04', '05', '06', '07', '08', '09')
GROUP BY departement, region
ORDER BY departement;

-- 7. Compter les corrections effectuées
SELECT 
  'Codes postaux corrigés' as action,
  COUNT(*) as nombre
FROM etablissements
WHERE LEFT(code_postal, 1) = '0';

COMMENT ON COLUMN etablissements.code_postal IS 'Code postal (TEXT) - toujours stocker avec le 0 initial si nécessaire';