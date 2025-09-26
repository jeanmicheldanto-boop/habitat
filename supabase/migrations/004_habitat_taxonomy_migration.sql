-- Migration pour la nouvelle taxonomie des types d'habitat
-- Ce script met à jour les données existantes pour correspondre à la nouvelle structure hiérarchique

-- 1. Mise à jour des habitat_type (catégories principales)
UPDATE etablissements 
SET habitat_type = 'habitat_individuel' 
WHERE habitat_type = 'logement_independant';

UPDATE etablissements 
SET habitat_type = 'logement_individuel_en_residence' 
WHERE habitat_type = 'residence';

-- habitat_partage reste inchangé

-- 2. Mise à jour des sous_categories vers les nouvelles clés
-- Note: Cette partie nécessite une approche plus fine car sous_categories est un array JSON

-- Migration des sous-catégories communes
UPDATE etablissements 
SET sous_categories = jsonb_build_array('residence_autonomie')
WHERE sous_categories::text LIKE '%résidence autonomie%' 
   OR sous_categories::text LIKE '%foyer logement%'
   OR sous_categories::text LIKE '%ra%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('residence_services_seniors')
WHERE sous_categories::text LIKE '%résidence services%' 
   OR sous_categories::text LIKE '%résidence service séniors%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('colocation_avec_services')
WHERE sous_categories::text LIKE '%colocation%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('beguinage')
WHERE sous_categories::text LIKE '%béguinage%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('habitat_inclusif')
WHERE sous_categories::text LIKE '%habitat inclusif%'
   OR sous_categories::text LIKE '%logement accompagné%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('accueil_familial')
WHERE sous_categories::text LIKE '%accueil familial%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('habitat_intergenerationnel')
WHERE sous_categories::text LIKE '%intergénérationnel%';

UPDATE etablissements 
SET sous_categories = jsonb_build_array('habitat_alternatif')
WHERE sous_categories::text LIKE '%maison partagée%'
   OR sous_categories::text LIKE '%autre%'
   OR sous_categories = '[]'::jsonb
   OR sous_categories IS NULL;

-- 3. Mise à jour des propositions (même logique)
UPDATE propositions 
SET habitat_type = 'habitat_individuel' 
WHERE habitat_type = 'logement_independant';

UPDATE propositions 
SET habitat_type = 'logement_individuel_en_residence' 
WHERE habitat_type = 'residence';

-- 4. Ajout d'un index pour les nouvelles valeurs si nécessaire
CREATE INDEX IF NOT EXISTS idx_etablissements_habitat_type_new ON etablissements(habitat_type);
CREATE INDEX IF NOT EXISTS idx_etablissements_sous_categories_new ON etablissements USING GIN(sous_categories);

-- 5. Vérification des données après migration
SELECT 
    habitat_type,
    COUNT(*) as count,
    array_agg(DISTINCT sous_categories) as sous_categories_found
FROM etablissements 
GROUP BY habitat_type;

-- Note: Ce script doit être exécuté avec précaution sur les données de production
-- Il est recommandé de faire une sauvegarde avant la migration