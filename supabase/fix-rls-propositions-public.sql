-- ========================================
-- FIX RLS POLICIES POUR PROPOSITIONS PUBLIQUES
-- ========================================
-- Problème: Les propositions créées par le public (created_by = null)
-- ne sont pas visibles dans le dashboard admin à cause des RLS policies
-- ========================================

-- 1. Supprimer l'ancienne policy SELECT (limitée aux authenticated)
DROP POLICY IF EXISTS "prop select owner or admin" ON public.propositions;

-- 2. Créer une nouvelle policy SELECT qui permet:
--    - Aux admins de voir TOUTES les propositions (y compris created_by = null)
--    - Aux utilisateurs authentifiés de voir leurs propres propositions
CREATE POLICY "prop select owner or admin or public" 
ON public.propositions 
FOR SELECT 
TO authenticated 
USING (
  public.is_admin() 
  OR created_by = auth.uid() 
  OR created_by IS NULL  -- Permet aux admins de voir les propositions publiques
);

-- 3. Supprimer l'ancienne policy INSERT (limitée aux authenticated)
DROP POLICY IF EXISTS "prop insert any authenticated" ON public.propositions;

-- 4. Créer une policy INSERT pour les utilisateurs authentifiés
CREATE POLICY "prop insert authenticated" 
ON public.propositions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. Créer une policy INSERT pour le public (anon)
-- Permet au public de créer des propositions de modification
CREATE POLICY "prop insert public" 
ON public.propositions 
FOR INSERT 
TO anon 
WITH CHECK (
  -- Seulement pour les propositions de modification d'établissements existants
  type_cible = 'etablissement' 
  AND action = 'update' 
  AND source = 'public'
  AND created_by IS NULL
);

-- 6. Vérifier les policies créées
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- 7. Tester la visibilité pour un admin
-- Cette requête devrait maintenant retourner les propositions publiques
SELECT 
  id,
  type_cible,
  action,
  statut,
  source,
  created_by,
  created_at
FROM propositions
WHERE statut = 'en_attente'
ORDER BY created_at DESC
LIMIT 5;
