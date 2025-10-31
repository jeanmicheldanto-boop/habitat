-- Vérifier les données liées à l'établissement Oh Activ – Pau
-- ID: ccd9a9cd-cc04-4c51-a635-3c8565084e09

-- 1. Statut de l'établissement
SELECT 
  'STATUT ETABLISSEMENT' as info,
  nom,
  statut_editorial,
  id
FROM public.etablissements
WHERE id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

-- 2. Services liés (via table de jonction)
SELECT 
  'SERVICES LIES' as info,
  es.etablissement_id,
  es.service_id,
  s.libelle as service_libelle
FROM public.etablissement_service es
JOIN public.services s ON s.id = es.service_id
WHERE es.etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

-- 3. Sous-catégories liées (via table de jonction)
SELECT 
  'SOUS-CATEGORIES LIEES' as info,
  esc.etablissement_id,
  esc.sous_categorie_id,
  sc.libelle as sous_categorie_libelle
FROM public.etablissement_sous_categorie esc
JOIN public.sous_categories sc ON sc.id = esc.sous_categorie_id
WHERE esc.etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

-- 4. Count total
SELECT 
  (SELECT COUNT(*) FROM public.etablissement_service WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09') as nb_services,
  (SELECT COUNT(*) FROM public.etablissement_sous_categorie WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09') as nb_sous_categories;
