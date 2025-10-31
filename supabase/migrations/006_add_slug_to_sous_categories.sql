-- Migration: Ajout du champ slug aux sous-catégories et mise à jour de la vue
-- Date: 2025-10-31
-- Problème: La vue v_liste_publication_geoloc retourne les libellés des sous-catégories,
--           mais le code frontend cherche par keys (slugs). Résultat: aucune correspondance trouvée.
-- Solution: Ajouter un champ slug et modifier la vue pour l'utiliser

-- 1. Ajouter le champ slug à la table sous_categories
ALTER TABLE public.sous_categories
ADD COLUMN IF NOT EXISTS slug text;

-- 2. Remplir les slugs basés sur les keys de habitatTaxonomy.ts
UPDATE public.sous_categories
SET slug = CASE libelle
  -- Résidence
  WHEN 'Résidence autonomie' THEN 'residence_autonomie'
  WHEN 'résidence autonomie' THEN 'residence_autonomie'
  WHEN 'Résidence services seniors' THEN 'residence_services_seniors'
  WHEN 'résidence services seniors' THEN 'residence_services_seniors'
  WHEN 'MARPA' THEN 'marpa'
  
  -- Habitat partagé
  WHEN 'Colocation avec services' THEN 'colocation_avec_services'
  WHEN 'colocation avec services' THEN 'colocation_avec_services'
  WHEN 'Habitat intergénérationnel' THEN 'habitat_intergenerationnel'
  WHEN 'Habitat inclusif' THEN 'habitat_inclusif'
  WHEN 'habitat inclusif' THEN 'habitat_inclusif'
  WHEN 'Habitat alternatif' THEN 'habitat_alternatif'
  WHEN 'Accueil familial' THEN 'accueil_familial'
  WHEN 'accueil familial' THEN 'accueil_familial'
  WHEN 'Maison d''accueil familial' THEN 'maison_accueil_familial'
  
  -- Logement indépendant
  WHEN 'Béguinage' THEN 'beguinage'
  WHEN 'béguinage' THEN 'beguinage'
  WHEN 'Village seniors' THEN 'village_seniors'
  WHEN 'village seniors' THEN 'village_seniors'
  WHEN 'Logement adapté' THEN 'logement_adapte'
  WHEN 'Habitat regroupé' THEN 'habitat_regroupe'
  WHEN 'habitat regroupe' THEN 'habitat_regroupe'
  
  ELSE lower(replace(replace(replace(libelle, ' ', '_'), 'é', 'e'), '''', ''))
END;

-- 3. Vérifier les doublons avant d'ajouter la contrainte
SELECT 'Vérification des doublons:' as info;
SELECT slug, COUNT(*) as count
FROM public.sous_categories
GROUP BY slug
HAVING COUNT(*) > 1;

-- 4. Supprimer les doublons en gardant uniquement les versions avec majuscules correctes
-- Liste des libellés corrects à garder
WITH correct_labels AS (
  SELECT unnest(ARRAY[
    'Résidence autonomie',
    'Résidence services seniors',
    'MARPA',
    'Colocation avec services',
    'Habitat intergénérationnel',
    'Habitat inclusif',
    'Habitat alternatif',
    'Accueil familial',
    'Maison d''accueil familial',
    'Béguinage',
    'Village seniors',
    'Logement adapté',
    'Habitat regroupé'
  ]) as libelle_correct
),
ids_to_keep AS (
  SELECT DISTINCT ON (sc.slug) sc.id
  FROM public.sous_categories sc
  INNER JOIN correct_labels cl ON sc.libelle = cl.libelle_correct
  ORDER BY sc.slug, sc.id
)
DELETE FROM public.sous_categories
WHERE id NOT IN (SELECT id FROM ids_to_keep);

-- Vérifier qu'il ne reste qu'une seule occurrence par slug
SELECT 'Vérification après nettoyage:' as info;
SELECT libelle, slug, COUNT(*) as count
FROM public.sous_categories
GROUP BY libelle, slug
ORDER BY slug;

-- 5. Ajouter une contrainte unique sur slug
ALTER TABLE public.sous_categories
ADD CONSTRAINT sous_categories_slug_unique UNIQUE (slug);

-- 6. Recréer la vue v_liste_publication pour utiliser slug au lieu de libelle
DROP VIEW IF EXISTS public.v_liste_publication CASCADE;
CREATE VIEW public.v_liste_publication AS
 SELECT id AS etab_id,
    nom,
    presentation,
    commune,
    departement,
    region,
    code_postal,
    pays,
    geom,
    geocode_precision,
    eligibilite_statut,
    telephone,
    email,
    site_web,
        CASE
            WHEN (COALESCE(public_cible, ''::text) = ''::text) THEN ARRAY[]::text[]
            ELSE ( SELECT array_agg(TRIM(BOTH FROM x.x)) AS array_agg
               FROM unnest(string_to_array(e.public_cible, ','::text)) x(x))
        END AS public_cible,
    ( SELECT array_agg(DISTINCT sc.slug ORDER BY sc.slug) AS array_agg
           FROM (public.etablissement_sous_categorie esc
             JOIN public.sous_categories sc ON ((sc.id = esc.sous_categorie_id)))
          WHERE (esc.etablissement_id = e.id)) AS sous_categories,
    ( SELECT array_agg(DISTINCT s.libelle ORDER BY s.libelle) AS array_agg
           FROM (public.etablissement_service es
             JOIN public.services s ON ((s.id = es.service_id)))
          WHERE (es.etablissement_id = e.id)) AS services,
    ( SELECT t.fourchette_prix
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS fourchette_prix,
    ( SELECT t.prix_min
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS prix_min,
    ( SELECT t.prix_max
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS prix_max,
    ( SELECT d.statut_disponibilite
           FROM public.disponibilites d
          WHERE (d.etablissement_id = e.id)
          ORDER BY d.date_capture DESC NULLS LAST
         LIMIT 1) AS statut_disponibilite,
    ( SELECT d.nb_unites_dispo
           FROM public.disponibilites d
          WHERE (d.etablissement_id = e.id)
          ORDER BY d.date_capture DESC NULLS LAST
         LIMIT 1) AS nb_unites_dispo,
    ( SELECT m.storage_path
           FROM public.medias m
          WHERE (m.etablissement_id = e.id)
          ORDER BY m.priority, m.created_at DESC
         LIMIT 1) AS image_path,
    ( SELECT r.kitchenette
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS kitchenette,
    ( SELECT r.resto_collectif_midi
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS resto_collectif_midi,
    ( SELECT r.resto_collectif
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS resto_collectif,
    ( SELECT r.portage_repas
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS portage_repas,
    ( SELECT COALESCE(json_agg(json_build_object('libelle', lt.libelle, 'surface_min', lt.surface_min, 'surface_max', lt.surface_max, 'meuble', lt.meuble, 'pmr', lt.pmr, 'domotique', lt.domotique, 'nb_unites', lt.nb_unites)) FILTER (WHERE (lt.id IS NOT NULL)), '[]'::json) AS "coalesce"
           FROM public.logements_types lt
          WHERE (lt.etablissement_id = e.id)) AS logements_types
   FROM public.etablissements e
  WHERE (statut_editorial = 'publie'::public.statut_editorial);

-- 7. Recréer la vue v_liste_publication_geoloc avec slug
DROP VIEW IF EXISTS public.v_liste_publication_geoloc;
CREATE VIEW public.v_liste_publication_geoloc AS
 SELECT id AS etab_id,
    nom,
    presentation,
    commune,
    departement,
    region,
    code_postal,
    pays,
    gestionnaire,
    geom,
    public.st_y(geom) AS latitude,
    public.st_x(geom) AS longitude,
    geocode_precision,
    eligibilite_statut,
    telephone,
    email,
    site_web,
    habitat_type,
        CASE
            WHEN (COALESCE(public_cible, ''::text) = ''::text) THEN ARRAY[]::text[]
            ELSE ( SELECT array_agg(TRIM(BOTH FROM x.x)) AS array_agg
               FROM unnest(string_to_array(e.public_cible, ','::text)) x(x))
        END AS public_cible,
    ( SELECT array_agg(DISTINCT sc.slug ORDER BY sc.slug) AS array_agg
           FROM (public.etablissement_sous_categorie esc
             JOIN public.sous_categories sc ON ((sc.id = esc.sous_categorie_id)))
          WHERE (esc.etablissement_id = e.id)) AS sous_categories,
    ( SELECT array_agg(DISTINCT s.libelle ORDER BY s.libelle) AS array_agg
           FROM (public.etablissement_service es
             JOIN public.services s ON ((s.id = es.service_id)))
          WHERE (es.etablissement_id = e.id)) AS services,
    ( SELECT t.fourchette_prix
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS fourchette_prix,
    ( SELECT t.prix_min
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS prix_min,
    ( SELECT t.prix_max
           FROM public.tarifications t
          WHERE (t.etablissement_id = e.id)
          ORDER BY t.date_observation DESC NULLS LAST
         LIMIT 1) AS prix_max,
    ( SELECT d.statut_disponibilite
           FROM public.disponibilites d
          WHERE (d.etablissement_id = e.id)
          ORDER BY d.date_capture DESC NULLS LAST
         LIMIT 1) AS statut_disponibilite,
    ( SELECT d.nb_unites_dispo
           FROM public.disponibilites d
          WHERE (d.etablissement_id = e.id)
          ORDER BY d.date_capture DESC NULLS LAST
         LIMIT 1) AS nb_unites_dispo,
    ( SELECT m.storage_path
           FROM public.medias m
          WHERE (m.etablissement_id = e.id)
          ORDER BY m.priority, m.created_at DESC
         LIMIT 1) AS image_path,
    ( SELECT r.kitchenette
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS kitchenette,
    ( SELECT r.resto_collectif_midi
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS resto_collectif_midi,
    ( SELECT r.resto_collectif
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS resto_collectif,
    ( SELECT r.portage_repas
           FROM public.restaurations r
          WHERE (r.etablissement_id = e.id)
         LIMIT 1) AS portage_repas,
    ( SELECT COALESCE(json_agg(json_build_object('libelle', lt.libelle, 'surface_min', lt.surface_min, 'surface_max', lt.surface_max, 'meuble', lt.meuble, 'pmr', lt.pmr, 'domotique', lt.domotique, 'nb_unites', lt.nb_unites)) FILTER (WHERE (lt.id IS NOT NULL)), '[]'::json) AS "coalesce"
           FROM public.logements_types lt
          WHERE (lt.etablissement_id = e.id)) AS logements_types
   FROM public.etablissements e
  WHERE (statut_editorial = 'publie'::public.statut_editorial);

-- 8. Vérification
SELECT 'Migration terminée. Vérification des slugs:' as info;
SELECT id, libelle, slug FROM public.sous_categories ORDER BY libelle;
