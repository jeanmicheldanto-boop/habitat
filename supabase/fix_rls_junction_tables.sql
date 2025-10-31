-- Script pour autoriser la lecture publique des tables de jonction
-- Nécessaire pour le formulaire de suggestion-correction qui doit afficher
-- les données actuelles même pour les établissements non publiés

-- ========================================
-- 1. ETABLISSEMENT_SERVICE - Lecture publique
-- ========================================

-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "public read etab_service via parent publie" ON public.etablissement_service;

-- Créer une nouvelle politique permettant la lecture de TOUS les services liés
CREATE POLICY "public_read_etablissement_service"
ON public.etablissement_service
FOR SELECT
TO public
USING (true);

-- ========================================
-- 2. ETABLISSEMENT_SOUS_CATEGORIE - Lecture publique
-- ========================================

-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "public read etab_sous_cat via parent publie" ON public.etablissement_sous_categorie;

-- Créer une nouvelle politique permettant la lecture de TOUTES les sous-catégories liées
CREATE POLICY "public_read_etablissement_sous_categorie"
ON public.etablissement_sous_categorie
FOR SELECT
TO public
USING (true);

-- ========================================
-- 3. VÉRIFICATION
-- ========================================

-- Afficher les politiques créées
SELECT 
  'POLITIQUES RLS CRÉÉES SUR TABLES DE JONCTION' as info,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('etablissement_service', 'etablissement_sous_categorie')
ORDER BY tablename, policyname;

-- Tester l'accès avec le role anon pour l'établissement test
SET ROLE anon;

SELECT 
  'TEST ANON - Services liés à Oh Activ' as test, 
  COUNT(*) as count 
FROM public.etablissement_service
WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

SELECT 
  'TEST ANON - Sous-catégories liées à Oh Activ' as test, 
  COUNT(*) as count 
FROM public.etablissement_sous_categorie
WHERE etablissement_id = 'ccd9a9cd-cc04-4c51-a635-3c8565084e09';

RESET ROLE;

SELECT '✅ Les tables de jonction sont maintenant accessibles publiquement en lecture' as resultat;
