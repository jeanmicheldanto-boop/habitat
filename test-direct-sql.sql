-- Script de vérification directe des données pour l'établissement Oh Activ – Pau
-- ID: ccd9a9cd-cc04-4c51-a635-3c8565084e09

-- ========================================
-- 1. VÉRIFIER L'ÉTABLISSEMENT
-- ========================================
SELECT 
  'ETABLISSEMENT' as type,
  id,
  nom,
  adresse_l1,
  commune,
  statut_editorial
FROM public.etablissements
WHERE id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

-- ========================================
-- 2. COMPTER LES TABLES DE RÉFÉRENCE
-- ========================================
SELECT 'CATEGORIES' as table_name, COUNT(*) as total FROM public.categories
UNION ALL
SELECT 'SOUS_CATEGORIES', COUNT(*) FROM public.sous_categories
UNION ALL
SELECT 'SERVICES', COUNT(*) FROM public.services;

-- ========================================
-- 3. LISTER TOUS LES SERVICES
-- ========================================
SELECT 
  'TOUS LES SERVICES' as info,
  COUNT(*) as total
FROM public.services;

SELECT 
  id,
  libelle
FROM public.services
ORDER BY libelle
LIMIT 10;

-- ========================================
-- 4. LISTER TOUTES LES SOUS-CATÉGORIES
-- ========================================
SELECT 
  'TOUTES LES SOUS-CATEGORIES' as info,
  COUNT(*) as total
FROM public.sous_categories;

SELECT 
  sc.id,
  sc.libelle,
  sc.alias,
  c.libelle as categorie
FROM public.sous_categories sc
LEFT JOIN public.categories c ON c.id = sc.categorie_id
ORDER BY c.libelle, sc.libelle
LIMIT 10;

-- ========================================
-- 5. SERVICES LIÉS À L'ÉTABLISSEMENT (via table de jonction)
-- ========================================
SELECT 
  'SERVICES DE CET ETABLISSEMENT (via etablissement_service)' as info,
  COUNT(*) as total
FROM public.etablissement_service
WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

SELECT 
  s.id,
  s.libelle
FROM public.etablissement_service es
JOIN public.services s ON s.id = es.service_id
WHERE es.etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09'
ORDER BY s.libelle;

-- ========================================
-- 6. SOUS-CATÉGORIES DE L'ÉTABLISSEMENT (via table de jonction)
-- ========================================
SELECT 
  'SOUS-CATEGORIES DE CET ETABLISSEMENT (via etablissement_sous_categorie)' as info,
  COUNT(*) as total
FROM public.etablissement_sous_categorie
WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

SELECT 
  sc.id,
  sc.libelle,
  sc.alias,
  c.libelle as categorie
FROM public.etablissement_sous_categorie esc
JOIN public.sous_categories sc ON sc.id = esc.sous_categorie_id
LEFT JOIN public.categories c ON c.id = sc.categorie_id
WHERE esc.etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09'
ORDER BY c.libelle, sc.libelle;

-- ========================================
-- 7. TESTER LA VUE v_liste_publication
-- ========================================
SELECT 
  'DONNEES VIA VUE v_liste_publication' as info,
  nom,
  commune,
  services,
  sous_categories
FROM public.v_liste_publication
WHERE etab_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

-- ========================================
-- 8. VÉRIFIER LES POLITIQUES RLS
-- ========================================
SELECT 
  'POLITIQUES RLS SUR services' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'services';

SELECT 
  'POLITIQUES RLS SUR sous_categories' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'sous_categories';

-- ========================================
-- 9. VÉRIFIER SI RLS EST ACTIVÉ
-- ========================================
SELECT 
  'RLS STATUS' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('services', 'sous_categories', 'categories')
ORDER BY tablename;

-- ========================================
-- 10. TEST DIRECT SANS RLS (en tant que superuser)
-- ========================================
-- Note: Ces requêtes bypasse RLS pour voir les vraies données
SET ROLE postgres; -- Nécessite droits admin

SELECT 'SERVICES (sans RLS)' as info, COUNT(*) FROM public.services;
SELECT 'SOUS_CATEGORIES (sans RLS)' as info, COUNT(*) FROM public.sous_categories;

RESET ROLE;
