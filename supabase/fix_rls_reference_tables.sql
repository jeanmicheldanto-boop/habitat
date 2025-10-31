-- Script pour corriger les politiques RLS sur les tables de référence
-- Ces tables doivent être accessibles en lecture publique car ce sont des données de référence

-- ========================================
-- 1. CATÉGORIES - Lecture publique
-- ========================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;

-- Créer la politique de lecture publique
CREATE POLICY "public_read_categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- ========================================
-- 2. SOUS-CATÉGORIES - Lecture publique
-- ========================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "public_read_sous_categories" ON public.sous_categories;

-- Créer la politique de lecture publique
CREATE POLICY "public_read_sous_categories"
ON public.sous_categories
FOR SELECT
TO public
USING (true);

-- ========================================
-- 3. SERVICES - Lecture publique
-- ========================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "public_read_services" ON public.services;

-- Créer la politique de lecture publique
CREATE POLICY "public_read_services"
ON public.services
FOR SELECT
TO public
USING (true);

-- ========================================
-- 4. VÉRIFICATION
-- ========================================

-- Afficher les politiques créées
SELECT 
  'POLITIQUES RLS CRÉÉES' as info,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('categories', 'sous_categories', 'services')
ORDER BY tablename, policyname;

-- Tester l'accès avec le role anon
SET ROLE anon;
SELECT 'TEST ANON - Categories' as test, COUNT(*) as count FROM public.categories;
SELECT 'TEST ANON - Sous-categories' as test, COUNT(*) as count FROM public.sous_categories;
SELECT 'TEST ANON - Services' as test, COUNT(*) as count FROM public.services;
RESET ROLE;

SELECT '✅ Les tables de référence sont maintenant accessibles publiquement en lecture' as resultat;
