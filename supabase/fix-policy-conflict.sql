-- ========================================
-- FIX: Supprimer les policies en doublon et conflictuelles
-- ========================================

BEGIN;

-- Supprimer la policy restrictive qui bloque
DROP POLICY IF EXISTS "prop insert public" ON public.propositions;

-- Supprimer aussi les anciennes policies en doublon
DROP POLICY IF EXISTS "prop insert authenticated" ON public.propositions;
DROP POLICY IF EXISTS "Permettre SELECT pour créateur et admins" ON public.propositions;

-- Les policies à GARDER (ne pas toucher):
-- - "Permettre INSERT public pour propositions" (anon + authenticated, WITH CHECK: true)
-- - "Permettre tout aux admins pour propositions" (ALL pour admins)
-- - "prop select owner or admin or public" (SELECT)
-- - "prop update admin only" (UPDATE)
-- - "prop delete admin only" (DELETE)

COMMIT;

-- Vérifier le résultat
SELECT 
  policyname,
  roles::text,
  cmd,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;
