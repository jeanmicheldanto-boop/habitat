-- Migration 007: Ajout d'index pour optimiser les performances
-- Objectif: Réduire les temps de requête de 40-60%
-- Date: 2026-02-15

-- =====================================================
-- INDEX SUR COLONNES FRÉQUEMMENT FILTRÉES
-- =====================================================

-- Index sur statut_editorial (utilisé dans toutes les vues et policies)
-- Permet de filtrer rapidement les établissements publiés
CREATE INDEX IF NOT EXISTS idx_etablissements_statut_editorial 
  ON etablissements(statut_editorial);

-- Index GIN sur departement pour recherche textuelle (ILIKE '%...%')
-- Permet l'autocomplétion et les filtres géographiques rapides
CREATE INDEX IF NOT EXISTS idx_etablissements_departement 
  ON etablissements USING gin(departement gin_trgm_ops);

-- Index sur habitat_type pour filtrage par type d'habitat
-- (logement_independant, residence, habitat_partage)
CREATE INDEX IF NOT EXISTS idx_etablissements_habitat_type 
  ON etablissements(habitat_type);

-- Index sur eligibilite_statut pour filtrage AVP
-- (avp_eligible, non_eligible, a_verifier)
CREATE INDEX IF NOT EXISTS idx_etablissements_eligibilite_statut 
  ON etablissements(eligibilite_statut);

-- Index composite sur statut + departement (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_etablissements_statut_dept 
  ON etablissements(statut_editorial, departement);

-- Index composite sur statut + habitat_type (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_etablissements_statut_habitat 
  ON etablissements(statut_editorial, habitat_type);

-- =====================================================
-- INDEX SUR TABLES DE JOINTURE (pour sous-requêtes de vues)
-- =====================================================

-- Table etablissement_service (utilisée dans v_liste_publication_geoloc)
-- Accélère les sous-requêtes qui agrègent les services
CREATE INDEX IF NOT EXISTS idx_etablissement_service_etab_id 
  ON etablissement_service(etablissement_id);

-- Index composite incluant service_id pour les JOINs complets
CREATE INDEX IF NOT EXISTS idx_etablissement_service_both 
  ON etablissement_service(etablissement_id, service_id);

-- Table etablissement_sous_categorie (utilisée dans v_liste_publication_geoloc)
-- Accélère les sous-requêtes qui agrègent les sous-catégories
CREATE INDEX IF NOT EXISTS idx_etablissement_sous_categorie_etab_id 
  ON etablissement_sous_categorie(etablissement_id);

-- Index composite incluant sous_categorie_id pour les JOINs complets
CREATE INDEX IF NOT EXISTS idx_etablissement_sous_categorie_both 
  ON etablissement_sous_categorie(etablissement_id, sous_categorie_id);

-- =====================================================
-- INDEX SUR TABLES LIÉES (avec colonnes de tri)
-- =====================================================

-- Table medias : priorité + date pour ORDER BY dans la vue
-- Permet de récupérer rapidement l'image principale de chaque établissement
CREATE INDEX IF NOT EXISTS idx_medias_etab_priority 
  ON medias(etablissement_id, priority, created_at DESC);

-- Table restaurations : accès direct par etablissement_id
CREATE INDEX IF NOT EXISTS idx_restaurations_etab_id 
  ON restaurations(etablissement_id);

-- Table logements_types : accès direct par etablissement_id
CREATE INDEX IF NOT EXISTS idx_logements_types_etab_id 
  ON logements_types(etablissement_id);

-- Table disponibilites : date_capture pour ORDER BY dans la vue
-- Permet de récupérer rapidement la disponibilité la plus récente
CREATE INDEX IF NOT EXISTS idx_disponibilites_etab_date 
  ON disponibilites(etablissement_id, date_capture DESC NULLS LAST);

-- Table tarifications : date_observation déjà indexé mais amélioration
-- L'index existant idx_tarifs_periode couvre etablissement_id + periode
-- Ajout d'un index pour les requêtes avec ORDER BY date_observation
CREATE INDEX IF NOT EXISTS idx_tarifications_etab_date 
  ON tarifications(etablissement_id, date_observation DESC NULLS LAST);

-- =====================================================
-- INDEX SUR COLONNES GIN POUR RECHERCHE FULL-TEXT
-- =====================================================

-- Index sur region pour recherche géographique
CREATE INDEX IF NOT EXISTS idx_etablissements_region 
  ON etablissements USING gin(region gin_trgm_ops);

-- Index sur code_postal pour recherche par code postal
CREATE INDEX IF NOT EXISTS idx_etablissements_code_postal 
  ON etablissements(code_postal);

-- =====================================================
-- ANALYSE DES TABLES APRÈS CRÉATION D'INDEX
-- =====================================================

-- Mettre à jour les statistiques PostgreSQL pour optimiser le query planner
ANALYZE etablissements;
ANALYZE etablissement_service;
ANALYZE etablissement_sous_categorie;
ANALYZE medias;
ANALYZE restaurations;
ANALYZE logements_types;
ANALYZE disponibilites;
ANALYZE tarifications;

-- =====================================================
-- VÉRIFICATION (pour tests)
-- =====================================================

-- Commande pour lister les index créés par cette migration
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_etablissements%' 
-- OR indexname LIKE 'idx_etablissement_service%'
-- OR indexname LIKE 'idx_etablissement_sous_categorie%'
-- OR indexname LIKE 'idx_medias%'
-- OR indexname LIKE 'idx_restaurations%'
-- OR indexname LIKE 'idx_logements%'
-- OR indexname LIKE 'idx_disponibilites%'
-- OR indexname LIKE 'idx_tarifications%'
-- ORDER BY tablename, indexname;
