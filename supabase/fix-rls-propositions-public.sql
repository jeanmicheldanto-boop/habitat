-- ========================================
-- FIX RLS POLICIES POUR PROPOSITIONS PUBLIQUES - ÉTAPE 1/2
-- ========================================
-- EXÉCUTEZ D'ABORD CETTE PARTIE POUR SUPPRIMER LES ANCIENNES POLICIES
-- ========================================

BEGIN;

-- Supprimer TOUTES les anciennes policies sur propositions
DROP POLICY IF EXISTS "prop select owner or admin" ON public.propositions;
DROP POLICY IF EXISTS "prop select owner or admin or public" ON public.propositions;
DROP POLICY IF EXISTS "prop insert any authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert authenticated" ON public.propositions;
DROP POLICY IF EXISTS "prop insert public" ON public.propositions;

COMMIT;

-- ========================================
-- ÉTAPE 2/2 - CRÉER LES NOUVELLES POLICIES
-- ========================================
-- EXÉCUTEZ CETTE PARTIE APRÈS L'ÉTAPE 1
-- ========================================

BEGIN;

-- Policy SELECT: admins voient tout, users voient leurs propositions + propositions publiques
CREATE POLICY "prop select owner or admin or public" 
ON public.propositions 
FOR SELECT 
TO authenticated 
USING (
  public.is_admin() 
  OR created_by = auth.uid() 
  OR created_by IS NULL
);

-- Policy INSERT pour les utilisateurs authentifiés
CREATE POLICY "prop insert authenticated" 
ON public.propositions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy INSERT pour le public (anon)
CREATE POLICY "prop insert public" 
ON public.propositions 
FOR INSERT 
TO anon 
WITH CHECK (
  type_cible = 'etablissement' 
  AND action = 'update' 
  AND source = 'public'
  AND created_by IS NULL
);

COMMIT;

-- Vérifier les policies créées
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'propositions'
ORDER BY cmd, policyname;

-- Tester la visibilité des propositions publiques
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
