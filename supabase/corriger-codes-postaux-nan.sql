-- Corriger les codes postaux invalides (nan)

-- 0. Désactiver temporairement la contrainte de publication
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 1. Résidences Comme Toit - Art-sur-Meurthe (54)
-- L'adresse indique Metz 57070, donc corrigeons vers Moselle
UPDATE etablissements
SET 
  code_postal = '57070',
  commune = 'Metz',
  departement = 'Moselle (57)',
  region = 'Grand Est'
WHERE id = '790fe18f-a56c-43c4-a45b-9eaa7a9ad812';

-- 2. Colocation intergénérationnelle - Choisy-le-Roi
-- Erreur d'import, à supprimer
DELETE FROM etablissements
WHERE id = '5767fbf0-3106-498d-9e22-5854a41e0c43';

-- 3. Maisons - CetteFamille - Maisons (Aisne)
UPDATE etablissements
SET 
  code_postal = '02270',
  region = 'Hauts-de-France'
WHERE id = 'cee9458e-9766-4b28-b71b-a255684ecd25';

-- 4. Résidence inclusive - Verdun (Meuse)
UPDATE etablissements
SET 
  code_postal = '55100',
  region = 'Grand Est'
WHERE id = '63b0c0c5-0c2b-42a8-9419-ffd0001c5094';

-- 5. Maison Artesage – habitat partagé (projet) - Gers
-- Commune non précisée, on met le chef-lieu du département : Auch
UPDATE etablissements
SET 
  code_postal = '32000',
  commune = 'Auch',
  region = 'Occitanie'
WHERE id = 'ea5970c3-00f1-4064-ae5b-ab1643c32fa6';

-- 6. Réactiver la contrainte de publication
ALTER TABLE etablissements ADD CONSTRAINT etablissements_publish_check 
  CHECK ((statut_editorial <> 'publie'::public.statut_editorial) OR public.can_publish(id)) NOT VALID;

-- 7. Vérifier les corrections
SELECT 
  nom,
  code_postal,
  commune,
  departement,
  region
FROM etablissements
WHERE id IN (
  '790fe18f-a56c-43c4-a45b-9eaa7a9ad812',
  'cee9458e-9766-4b28-b71b-a255684ecd25',
  '63b0c0c5-0c2b-42a8-9419-ffd0001c5094',
  'ea5970c3-00f1-4064-ae5b-ab1643c32fa6'
);

-- 8. Vérifier qu'il n'y a plus de "nan"
SELECT COUNT(*) as reste_nan
FROM etablissements
WHERE code_postal = 'nan';
