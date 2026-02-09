-- ========================================
-- SOLUTION: POLICIES RLS SIMPLIFIÉES POUR PROPOSITIONS
-- ========================================

BEGIN;

-- Supprimer TOUTES les policies existantes
DROP POLICY IF EXISTS "prop select owner or admin" ON public.propositions;
DROP POLICY IF EXISTS "prop select owner or admin or public" ON public.propositions;
DROP POLICY IF EXISTS "prop insert any authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert public" ON public.propositions;
DROP POLICY IF EXISTS "prop update owner or admin" ON public.propositions;
DROP POLICY IF EXISTS "prop delete admin" ON public.propositions;

-- Policy SELECT: tout le monde peut voir ses propres propositions + les admins voient tout + propositions publiques
CREATE POLICY "propositions_select_policy" 
ON public.propositions 
FOR SELECT 
USING (
  -- Anon peut tout voir (pour debugging - à restreindre plus tard si besoin)
  auth.role() = 'anon'
  OR
  -- Authenticated: voit ses propositions, les publiques, ou tout si admin
  (
    auth.role() = 'authenticated'
    AND (
      public.is_admin()
      OR created_by = auth.uid()
      OR created_by IS NULL
    )
  )
);

-- Policy INSERT pour authenticated: peut tout insérer
CREATE POLICY "propositions_insert_authenticated" 
ON public.propositions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy INSERT pour anon: plus de restrictions, accepte tout
CREATE POLICY "propositions_insert_anon" 
ON public.propositions 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy UPDATE: seulement les admins
CREATE POLICY "propositions_update_admin" 
ON public.propositions 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy DELETE: seulement les admins  
CREATE POLICY "propositions_delete_admin" 
ON public.propositions 
FOR DELETE 
TO authenticated
USING (public.is_admin());

COMMIT;

-- Vérifier que les policies sont créées
SELECT 
  policyname,
  roles::text,
  cmd,
  (qual IS NOT NULL) as has_using,
  (with_check IS NOT NULL) as has_with_check
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;
