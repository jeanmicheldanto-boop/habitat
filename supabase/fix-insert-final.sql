-- ========================================
-- SOLUTION RADICALE: Supprimer TOUTES les policies INSERT et recréer proprement
-- ========================================

BEGIN;

-- 1. Supprimer TOUTES les policies INSERT existantes
DROP POLICY IF EXISTS "Permettre INSERT public pour propositions" ON public.propositions;
DROP POLICY IF EXISTS "prop insert authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert public" ON public.propositions;

-- 2. Créer UNE SEULE policy INSERT pour anon (avec validations de base)
CREATE POLICY "anon_can_insert_propositions"
ON public.propositions
FOR INSERT
TO anon
WITH CHECK (
  -- Validation: doit être une proposition publique
  source = 'public'
  AND created_by IS NULL
  AND statut = 'en_attente'
  -- Validation: types valides seulement
  AND type_cible IN ('etablissement', 'logements_types', 'restaurations', 'tarifications')
  AND action IN ('create', 'update')
  -- Validation: doit avoir un payload
  AND payload IS NOT NULL
);

-- 3. Créer UNE SEULE policy INSERT pour authenticated (simple et claire)
CREATE POLICY "authenticated_can_insert_propositions"
ON public.propositions
FOR INSERT
TO authenticated
WITH CHECK (true);

COMMIT;

-- Vérifier le résultat - il devrait y avoir exactement 2 policies INSERT
SELECT 
  'Policies INSERT' as type,
  policyname,
  roles::text,
  cmd,
  with_check::text as condition
FROM pg_policies
WHERE tablename = 'propositions' AND cmd = 'INSERT'
ORDER BY policyname;

-- Test d'insertion en tant qu'anon
SELECT 'Test anon' as test_type;
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
  '{"test": "validation SQL"}'::jsonb,
  'en_attente'
) RETURNING id, created_at, statut;
RESET ROLE;
