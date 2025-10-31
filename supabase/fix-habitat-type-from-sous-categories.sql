-- Migration pour corriger le habitat_type des établissements en fonction de leurs sous-catégories
-- 
-- Problème : Le champ habitat_type dans la table etablissements n'est pas cohérent avec les sous-catégories liées
-- Solution : Mettre à jour habitat_type basé sur la première sous-catégorie trouvée
--
-- Mapping selon habitatTaxonomy.ts:
-- - Résidence (residence): residence_autonomie, residence_services_seniors, marpa
-- - Habitat partagé (habitat_partage): colocation_avec_services, habitat_intergenerationnel, habitat_inclusif, habitat_alternatif, accueil_familial, maison_accueil_familial  
-- - Logement indépendant (logement_independant): beguinage, village_seniors, logement_adapte, habitat_regroupe

-- 1. D'abord, afficher les incohérences actuelles
SELECT 
  e.id,
  e.nom,
  e.habitat_type AS habitat_type_actuel,
  ARRAY_AGG(DISTINCT sc.libelle) AS sous_categories_liees,
  CASE
    -- Résidences
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Résidence autonomie', 'Résidence services seniors', 'MARPA')
    ) THEN 'residence'
    
    -- Habitat partagé
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Colocation avec services', 'Habitat intergénérationnel', 'Habitat inclusif', 
                         'Habitat alternatif', 'Accueil familial', 'Maison d''accueil familial')
    ) THEN 'habitat_partage'
    
    -- Logement indépendant
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Béguinage', 'Village seniors', 'Logement adapté', 'Habitat regroupé')
    ) THEN 'logement_independant'
    
    -- Par défaut, garder l'ancien type
    ELSE e.habitat_type
  END AS habitat_type_correct
FROM etablissements e
LEFT JOIN etablissement_sous_categorie esc ON e.id = esc.etablissement_id
LEFT JOIN sous_categories sc ON esc.sous_categorie_id = sc.id
WHERE e.statut_editorial = 'publie'
GROUP BY e.id, e.nom, e.habitat_type
HAVING e.habitat_type != CASE
    -- Résidences
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Résidence autonomie', 'Résidence services seniors', 'MARPA')
    ) THEN 'residence'
    
    -- Habitat partagé
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Colocation avec services', 'Habitat intergénérationnel', 'Habitat inclusif', 
                         'Habitat alternatif', 'Accueil familial', 'Maison d''accueil familial')
    ) THEN 'habitat_partage'
    
    -- Logement indépendant
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Béguinage', 'Village seniors', 'Logement adapté', 'Habitat regroupé')
    ) THEN 'logement_independant'
    
    -- Par défaut, garder l'ancien type
    ELSE e.habitat_type
  END;

-- 2. Appliquer les corrections (décommenter pour exécuter)
/*
UPDATE etablissements e
SET habitat_type = CASE
    -- Résidences
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Résidence autonomie', 'Résidence services seniors', 'MARPA')
    ) THEN 'residence'
    
    -- Habitat partagé
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Colocation avec services', 'Habitat intergénérationnel', 'Habitat inclusif', 
                         'Habitat alternatif', 'Accueil familial', 'Maison d''accueil familial')
    ) THEN 'habitat_partage'
    
    -- Logement indépendant
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Béguinage', 'Village seniors', 'Logement adapté', 'Habitat regroupé')
    ) THEN 'logement_independant'
    
    -- Par défaut, garder l'ancien type
    ELSE e.habitat_type
  END
WHERE e.habitat_type != CASE
    -- Résidences
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Résidence autonomie', 'Résidence services seniors', 'MARPA')
    ) THEN 'residence'
    
    -- Habitat partagé
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Colocation avec services', 'Habitat intergénérationnel', 'Habitat inclusif', 
                         'Habitat alternatif', 'Accueil familial', 'Maison d''accueil familial')
    ) THEN 'habitat_partage'
    
    -- Logement indépendant
    WHEN EXISTS (
      SELECT 1 FROM etablissement_sous_categorie esc2
      JOIN sous_categories sc2 ON esc2.sous_categorie_id = sc2.id
      WHERE esc2.etablissement_id = e.id 
      AND sc2.libelle IN ('Béguinage', 'Village seniors', 'Logement adapté', 'Habitat regroupé')
    ) THEN 'logement_independant'
    
    -- Par défaut, garder l'ancien type
    ELSE e.habitat_type
  END;
*/
