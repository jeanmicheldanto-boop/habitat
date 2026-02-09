-- ========================================
-- TEST: Désactiver temporairement RLS pour diagnostiquer
-- ========================================

-- 1. Vérifier l'état actuel de RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'propositions';

-- 2. DÉSACTIVER RLS temporairement (ATTENTION: à réactiver après!)
ALTER TABLE public.propositions DISABLE ROW LEVEL SECURITY;

-- 3. Tester l'insertion sans RLS
INSERT INTO propositions (
  etablissement_id,
  type_cible,
  action,
  source,
  created_by,
  payload,
  statut
) VALUES (
  'dc2e1556-64d0-451f-9759-9d9f1849fe10',
  'etablissement',
  'update',
  'public',
  NULL,
  '{"test": "sans RLS"}'::jsonb,
  'en_attente'
) RETURNING id, created_at, statut;

-- 4. RÉACTIVER RLS immédiatement
ALTER TABLE public.propositions ENABLE ROW LEVEL SECURITY;

-- 5. Si l'insertion ci-dessus a fonctionné, le problème est bien dans les policies
-- Maintenant nettoyons TOUTES les policies et recréons proprement

BEGIN;

-- Supprimer ABSOLUMENT TOUTES les policies
DROP POLICY IF EXISTS "Permettre tout aux admins pour propositions" ON public.propositions;
DROP POLICY IF EXISTS "Permettre INSERT public pour propositions" ON public.propositions;
DROP POLICY IF EXISTS "Permettre SELECT pour créateur et admins" ON public.propositions;
DROP POLICY IF EXISTS "prop insert authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert public" ON public.propositions;
DROP POLICY IF EXISTS "prop select owner or admin or public" ON public.propositions;
DROP POLICY IF EXISTS "prop update admin only" ON public.propositions;
DROP POLICY IF EXISTS "prop delete admin only" ON public.propositions;
DROP POLICY IF EXISTS "anon_can_insert_propositions" ON public.propositions;
DROP POLICY IF EXISTS "authenticated_can_insert_propositions" ON public.propositions;

-- Recréer les policies de manière simple et claire

-- SELECT: Authenticated peut voir ses propositions + publiques, admins voient tout
CREATE POLICY "propositions_select"
ON public.propositions
FOR SELECT
TO authenticated
USING (
  is_admin()
  OR created_by = auth.uid()
  OR created_by IS NULL
);

-- INSERT: anon peut insérer des propositions publiques
CREATE POLICY "propositions_insert_anon"
ON public.propositions
FOR INSERT
TO anon
WITH CHECK (
  source = 'public'
  AND created_by IS NULL
  AND statut = 'en_attente'
  AND type_cible IN ('etablissement', 'logements_types', 'restaurations', 'tarifications')
  AND action IN ('create', 'update')
  AND payload IS NOT NULL
);

-- INSERT: authenticated peut tout insérer
CREATE POLICY "propositions_insert_auth"
ON public.propositions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: seulement admins
CREATE POLICY "propositions_update"
ON public.propositions
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- DELETE: seulement admins
CREATE POLICY "propositions_delete"
ON public.propositions
FOR DELETE
TO authenticated
USING (is_admin());

COMMIT;

-- Vérifier les policies créées
SELECT 
  policyname,
  roles::text,
  cmd,
  permissive,
  with_check::text as condition
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- Test final en tant qu'anon
SET ROLE anon;
INSERT INTO propositions (
  etablissement_id,
  type_cible,
  action,
  source,
  created_by,
  payload,
  statut
) VALUES (
  'dc2e1556-64d0-451f-9759-9d9f1849fe10',
  'etablissement',
  'update',
  'public',
  NULL,
  '{"test": "test final"}'::jsonb,
  'en_attente'
) RETURNING id, created_at, statut;
RESET ROLE;
