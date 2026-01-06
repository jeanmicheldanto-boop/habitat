-- ====================================================================
-- MIGRATION COMPLÈTE : Support images (Option C - Hybride)
-- ====================================================================
-- À exécuter dans l'éditeur SQL de Supabase

BEGIN;

-- 1. Ajouter la colonne image_path dans etablissements
ALTER TABLE etablissements 
ADD COLUMN IF NOT EXISTS image_path TEXT;

COMMENT ON COLUMN etablissements.image_path IS 
'Chemin de la photo principale dans Supabase Storage (ex: etablissements/uuid/main.jpg). 
Pour les photos supplémentaires, utiliser la table medias avec etablissement_id.';

-- 2. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_etablissements_image_path 
ON etablissements(image_path) 
WHERE image_path IS NOT NULL;

-- 3. Supprimer puis recréer la vue v_liste_publication (nécessaire pour ajouter image_path)
DROP VIEW IF EXISTS v_liste_publication CASCADE;

CREATE VIEW v_liste_publication AS
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
  (SELECT t.fourchette_prix FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS fourchette_prix,
  (SELECT t.prix_min FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_min,
  (SELECT t.prix_max FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_max,
  (SELECT d.statut_disponibilite FROM disponibilites d WHERE d.etablissement_id = e.id ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS statut_disponibilite,
  (SELECT d.nb_unites_dispo FROM disponibilites d WHERE d.etablissement_id = e.id ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS nb_unites_dispo,
  -- Prioriser image_path de etablissements, fallback sur medias
  COALESCE(
    e.image_path,
    (SELECT m.storage_path FROM medias m WHERE m.etablissement_id = e.id ORDER BY m.priority, m.created_at DESC LIMIT 1)
  ) AS image_path,
  (SELECT r.kitchenette FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS kitchenette,
  (SELECT r.resto_collectif_midi FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif_midi,
  (SELECT r.resto_collectif FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif,
  (SELECT r.portage_repas FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS portage_repas
FROM etablissements e
WHERE e.statut_editorial = 'publie';

-- 4. Supprimer puis recréer la vue v_liste_publication_geoloc
DROP VIEW IF EXISTS v_liste_publication_geoloc CASCADE;

CREATE VIEW v_liste_publication_geoloc AS
SELECT 
  e.id AS etab_id,
  e.nom,
  e.presentation,
  e.commune,
  e.departement,
  e.region,
  e.code_postal,
  e.pays,
  e.gestionnaire,
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
  (SELECT t.fourchette_prix FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS fourchette_prix,
  (SELECT t.prix_min FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_min,
  (SELECT t.prix_max FROM tarifications t WHERE t.etablissement_id = e.id ORDER BY t.date_observation DESC NULLS LAST LIMIT 1) AS prix_max,
  (SELECT d.statut_disponibilite FROM disponibilites d WHERE d.etablissement_id = e.id ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS statut_disponibilite,
  (SELECT d.nb_unites_dispo FROM disponibilites d WHERE d.etablissement_id = e.id ORDER BY d.date_capture DESC NULLS LAST LIMIT 1) AS nb_unites_dispo,
  -- Prioriser image_path de etablissements, fallback sur medias
  COALESCE(
    e.image_path,
    (SELECT m.storage_path FROM medias m WHERE m.etablissement_id = e.id ORDER BY m.priority, m.created_at DESC LIMIT 1)
  ) AS image_path,
  (SELECT r.kitchenette FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS kitchenette,
  (SELECT r.resto_collectif_midi FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif_midi,
  (SELECT r.resto_collectif FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS resto_collectif,
  (SELECT r.portage_repas FROM restaurations r WHERE r.etablissement_id = e.id LIMIT 1) AS portage_repas,
  (SELECT COALESCE(json_agg(json_build_object('libelle', lt.libelle, 'surface_min', lt.surface_min, 'surface_max', lt.surface_max, 'meuble', lt.meuble, 'pmr', lt.pmr, 'domotique', lt.domotique, 'nb_unites', lt.nb_unites)) FILTER (WHERE lt.id IS NOT NULL), '[]'::json)
   FROM logements_types lt WHERE lt.etablissement_id = e.id) AS logements_types
FROM etablissements e
WHERE e.statut_editorial = 'publie'
  AND e.geom IS NOT NULL;

COMMIT;

-- 5. Vérifier le résultat
SELECT 
  'Migration terminée avec succès !' as status,
  'image_path ajouté à etablissements' as etape_1,
  'Vues mises à jour avec COALESCE(etablissements.image_path, medias.storage_path)' as etape_2,
  'Table medias prête pour images supplémentaires (Phase 2)' as etape_3;
