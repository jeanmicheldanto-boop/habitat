-- Corriger la politique RLS pour permettre aux admins de voir toutes les propositions
-- Y compris celles sans created_by (propositions publiques)

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "prop select owner or admin" ON public.propositions;

-- Créer une nouvelle politique qui permet :
-- 1. Aux propriétaires de voir leurs propres propositions
-- 2. Aux admins de voir TOUTES les propositions (même celles sans created_by)
CREATE POLICY "prop select owner or admin"
ON public.propositions
FOR SELECT
TO authenticated
USING (
  (created_by = auth.uid()) OR 
  public.is_admin()
);

-- Note: La fonction is_admin() retourne true pour les admins,
-- donc ils verront toutes les propositions, y compris celles avec created_by IS NULL

-- Vérification
SELECT 
  'POLITIQUE RLS MISE À JOUR' as info,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'propositions' AND policyname = 'prop select owner or admin';

SELECT '✅ Les admins peuvent maintenant voir toutes les propositions' as resultat;
