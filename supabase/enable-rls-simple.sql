-- ========================================
-- RÉACTIVER RLS avec policies fonctionnelles
-- ========================================

BEGIN;

-- 1. Réactiver RLS sur la table
ALTER TABLE public.propositions ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes policies
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
DROP POLICY IF EXISTS "propositions_select" ON public.propositions;
DROP POLICY IF EXISTS "propositions_insert_anon" ON public.propositions;
DROP POLICY IF EXISTS "propositions_insert_auth" ON public.propositions;
DROP POLICY IF EXISTS "propositions_update" ON public.propositions;
DROP POLICY IF EXISTS "propositions_delete" ON public.propositions;

-- 3. Créer des policies SIMPLES qui fonctionnent

-- SELECT: Authenticated voit tout (simplifié pour debugging)
CREATE POLICY "select_propositions"
ON public.propositions
FOR SELECT
TO authenticated
USING (true);

-- INSERT: anon peut tout insérer (les propositions sont validées par admin de toute façon)
CREATE POLICY "insert_propositions_anon"
ON public.propositions
FOR INSERT
TO anon
WITH CHECK (true);

-- INSERT: authenticated peut tout insérer
CREATE POLICY "insert_propositions_auth"
ON public.propositions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: seulement authenticated (pour l'approbation par admin)
CREATE POLICY "update_propositions"
ON public.propositions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: seulement authenticated
CREATE POLICY "delete_propositions"
ON public.propositions
FOR DELETE
TO authenticated
USING (true);

COMMIT;

-- 4. Vérifier les policies créées
SELECT 
  policyname,
  roles::text,
  cmd
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- 5. Compter les propositions existantes
SELECT 
  COUNT(*) as total_propositions,
  COUNT(*) FILTER (WHERE created_by IS NULL) as propositions_publiques,
  COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente
FROM propositions;
