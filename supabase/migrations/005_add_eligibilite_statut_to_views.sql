-- Migration: Ajout de eligibilite_statut aux vues de publication
-- Date: 2025-09-27
-- Description: Ajoute la colonne eligibilite_statut aux vues v_liste_publication et v_liste_publication_geoloc
-- pour permettre l'affichage et le filtrage des établissements éligibles AVP

-- Recréer la vue v_liste_publication avec eligibilite_statut
DROP VIEW IF EXISTS public.v_liste_publication;
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
    ( SELECT array_agg(DISTINCT sc.libelle ORDER BY sc.libelle) AS array_agg
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

-- Recréer la vue v_liste_publication_geoloc avec eligibilite_statut
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
    ( SELECT array_agg(DISTINCT sc.libelle ORDER BY sc.libelle) AS array_agg
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