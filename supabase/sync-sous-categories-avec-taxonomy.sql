-- ====================================================================
-- SYNCHRONISATION DES SOUS-CATÉGORIES AVEC LE FRONTEND (habitatTaxonomy.ts)
-- ====================================================================
-- Ce script assure que la table sous_categories contient exactement
-- les clés utilisées par le frontend, avec des slugs cohérents.

-- 1. Vider la table de liaison (pour éviter les contraintes FK)
TRUNCATE TABLE etablissement_sous_categorie;

-- 2. Supprimer toutes les sous-catégories existantes
DELETE FROM sous_categories;

-- 3. Insérer les sous-catégories avec leurs clés exactes du frontend
-- RÉSIDENCE (habitat_type: 'residence')
INSERT INTO sous_categories (id, libelle, slug, description) VALUES
  (gen_random_uuid(), 'residence_autonomie', 'residence-autonomie', 'Résidence autonomie (ex foyer-logement)'),
  (gen_random_uuid(), 'residence_services_seniors', 'residence-services-seniors', 'Résidence services seniors'),
  (gen_random_uuid(), 'marpa', 'marpa', 'MARPA - Maison d''Accueil Rurale pour Personnes Âgées');

-- HABITAT PARTAGÉ (habitat_type: 'habitat_partage')
INSERT INTO sous_categories (id, libelle, slug, description) VALUES
  (gen_random_uuid(), 'colocation_avec_services', 'colocation-avec-services', 'Colocation avec services'),
  (gen_random_uuid(), 'habitat_intergenerationnel', 'habitat-intergenerationnel', 'Habitat intergénérationnel'),
  (gen_random_uuid(), 'habitat_inclusif', 'habitat-inclusif', 'Habitat inclusif'),
  (gen_random_uuid(), 'habitat_alternatif', 'habitat-alternatif', 'Habitat alternatif'),
  (gen_random_uuid(), 'accueil_familial', 'accueil-familial', 'Accueil familial'),
  (gen_random_uuid(), 'maison_accueil_familial', 'maison-accueil-familial', 'Maison d''accueil familial (MAF)');

-- LOGEMENT INDÉPENDANT (habitat_type: 'logement_independant')
INSERT INTO sous_categories (id, libelle, slug, description) VALUES
  (gen_random_uuid(), 'beguinage', 'beguinage', 'Béguinage'),
  (gen_random_uuid(), 'village_seniors', 'village-seniors', 'Village seniors'),
  (gen_random_uuid(), 'logement_adapte', 'logement-adapte', 'Logement adapté'),
  (gen_random_uuid(), 'habitat_regroupe', 'habitat-regroupe', 'Habitat regroupé');

-- 4. Vérifier le résultat
SELECT 
  libelle as cle_frontend,
  slug,
  description,
  id
FROM sous_categories
ORDER BY 
  CASE 
    WHEN libelle IN ('residence_autonomie', 'residence_services_seniors', 'marpa') THEN 1
    WHEN libelle IN ('colocation_avec_services', 'habitat_intergenerationnel', 'habitat_inclusif', 'habitat_alternatif', 'accueil_familial', 'maison_accueil_familial') THEN 2
    ELSE 3
  END,
  libelle;

-- 5. Statistiques
SELECT 
  CASE 
    WHEN libelle IN ('residence_autonomie', 'residence_services_seniors', 'marpa') THEN 'Résidence'
    WHEN libelle IN ('colocation_avec_services', 'habitat_intergenerationnel', 'habitat_inclusif', 'habitat_alternatif', 'accueil_familial', 'maison_accueil_familial') THEN 'Habitat partagé'
    ELSE 'Logement indépendant'
  END as categorie,
  COUNT(*) as nombre
FROM sous_categories
GROUP BY categorie
ORDER BY categorie;
