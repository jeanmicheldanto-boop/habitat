-- Script pour autoriser l'insertion dans les tables de liaison
-- pour les opérations d'approbation qui utilisent le service_role

-- ========================================
-- ETABLISSEMENT_SOUS_CATEGORIE - Politique INSERT
-- ========================================

-- Autoriser INSERT pour service_role et authenticated admin
CREATE POLICY "admin_insert_etablissement_sous_categorie"
ON public.etablissement_sous_categorie
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ========================================
-- ETABLISSEMENT_SERVICE - Politique INSERT
-- ========================================

-- Autoriser INSERT pour service_role et authenticated admin
CREATE POLICY "admin_insert_etablissement_service"
ON public.etablissement_service
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ========================================
-- ETABLISSEMENT_EQUIPEMENT - Politique INSERT
-- ========================================

-- Autoriser INSERT pour service_role et authenticated admin
CREATE POLICY "admin_insert_etablissement_equipement"
ON public.etablissement_equipement
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('etablissement_sous_categorie', 'etablissement_service', 'etablissement_equipement')
  AND cmd = 'INSERT'
ORDER BY tablename, policyname;
