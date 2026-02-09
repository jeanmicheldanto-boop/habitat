-- ========================================
-- SOLUTION TEMPORAIRE: Désactiver RLS sur propositions
-- ========================================
-- On va tester si le problème vient des policies ou d'autre chose

BEGIN;

-- Désactiver RLS temporairement sur la table propositions
ALTER TABLE public.propositions DISABLE ROW LEVEL SECURITY;

COMMIT;

-- Vérifier
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'propositions';

-- IMPORTANT: Une fois que l'insertion fonctionne depuis le frontend,
-- nous réactiverons RLS avec:
-- ALTER TABLE public.propositions ENABLE ROW LEVEL SECURITY;
