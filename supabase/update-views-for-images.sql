-- ====================================================================
-- MISE À JOUR DES VUES : Prioriser etablissements.image_path
-- ====================================================================
-- Modifie les vues pour utiliser COALESCE(etablissements.image_path, medias.storage_path)
-- Ainsi la colonne image_path est utilisée en priorité, avec fallback sur medias

-- 1. Recréer v_liste_publication avec image_path priorisée
CREATE OR REPLACE VIEW v_liste_publication AS
SELECT 
  e.id AS etab_id,
  e.nom,
  e.presentation,
  e.commune,
  e.departement,
  e.region,
  e.code_postal,
  e.pays,
  e.geom,
  e.geocode_precision,
  e.eligibilite_statut,
  e.telephone,
  e.email,
  e.site_web,
  e.habitat_type,
  CASE
    WHEN COALESCE(e.public_cible, '') = '' THEN ARRAY[]::text[]
    ELSE (SELECT array_agg(TRIM(x)) FROM unnest(string_to_array(e.public_cible, ',')) x)
  END AS public_cible,
  (SELECT array_agg(DISTINCT sc.libelle ORDER BY sc.libelle)
   FROM etablissement_sous_categorie esc
   JOIN sous_categories sc ON sc.id = esc.sous_categorie_id
   WHERE esc.etablissement_id = e.id) AS sous_categories,
  (SELECT array_agg(DISTINCT s.libelle ORDER BY s.libelle)
   FROM etablissement_service es
   JOIN services s ON s.id = es.service_id
   WHERE es.etablissement_id = e.id) AS services,
  (SELECT t.fourchette_prix FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS fourchette_prix,
  (SELECT t.prix_min FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_min,
  (SELECT t.prix_max FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_max,
  (SELECT d.statut_disponibilite FROM disponibilites d
   WHERE d.etablissement_id = e.id
   ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS statut_disponibilite,
  (SELECT d.nb_unites_dispo FROM disponibilites d
   WHERE d.etablissement_id = e.id
   ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS nb_unites_dispo,
  -- NOUVEAU : Prioriser image_path de etablissements, fallback sur medias
  COALESCE(
    e.image_path,
    (SELECT m.storage_path FROM medias m
     WHERE m.etablissement_id = e.id
     ORDER BY m.priority, m.created_at DESC LIMIT 1)
  ) AS image_path,
  (SELECT r.kitchenette FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS kitchenette,
  (SELECT r.resto_collectif_midi FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif_midi,
  (SELECT r.resto_collectif FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif,
  (SELECT r.portage_repas FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS portage_repas
FROM etablissements e
WHERE e.statut_editorial = 'publie';

-- 2. Recréer v_liste_publication_geoloc avec image_path priorisée
CREATE OR REPLACE VIEW v_liste_publication_geoloc AS
SELECT 
  e.id AS etab_id,
  e.nom,
  e.presentation,
  e.commune,
  e.departement,
  e.region,
  e.code_postal,
  e.pays,
  ST_Y(e.geom::geometry) AS latitude,
  ST_X(e.geom::geometry) AS longitude,
  e.geocode_precision,
  e.eligibilite_statut,
  e.telephone,
  e.email,
  e.site_web,
  e.habitat_type,
  CASE
    WHEN COALESCE(e.public_cible, '') = '' THEN ARRAY[]::text[]
    ELSE (SELECT array_agg(TRIM(x)) FROM unnest(string_to_array(e.public_cible, ',')) x)
  END AS public_cible,
  (SELECT array_agg(DISTINCT sc.libelle ORDER BY sc.libelle)
   FROM etablissement_sous_categorie esc
   JOIN sous_categories sc ON sc.id = esc.sous_categorie_id
   WHERE esc.etablissement_id = e.id) AS sous_categories,
  (SELECT array_agg(DISTINCT s.libelle ORDER BY s.libelle)
   FROM etablissement_service es
   JOIN services s ON s.id = es.service_id
   WHERE es.etablissement_id = e.id) AS services,
  (SELECT t.fourchette_prix FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS fourchette_prix,
  (SELECT t.prix_min FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_min,
  (SELECT t.prix_max FROM tarifications t
   WHERE t.etablissement_id = e.id
   ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_max,
  (SELECT d.statut_disponibilite FROM disponibilites d
   WHERE d.etablissement_id = e.id
   ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS statut_disponibilite,
  (SELECT d.nb_unites_dispo FROM disponibilites d
   WHERE d.etablissement_id = e.id
   ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS nb_unites_dispo,
  -- NOUVEAU : Prioriser image_path de etablissements, fallback sur medias
  COALESCE(
    e.image_path,
    (SELECT m.storage_path FROM medias m
     WHERE m.etablissement_id = e.id
     ORDER BY m.priority, m.created_at DESC LIMIT 1)
  ) AS image_path,
  (SELECT r.kitchenette FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS kitchenette,
  (SELECT r.resto_collectif_midi FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif_midi,
  (SELECT r.resto_collectif FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif,
  (SELECT r.portage_repas FROM restaurations r
   WHERE r.etablissement_id = e.id LIMIT 1) AS portage_repas
FROM etablissements e
WHERE e.statut_editorial = 'publie'
  AND e.geom IS NOT NULL;

-- 3. Vérifier le résultat
SELECT 
  'Vues mises à jour avec support image_path hybride' as message,
  'etablissements.image_path en priorité, medias.storage_path en fallback' as strategie;
