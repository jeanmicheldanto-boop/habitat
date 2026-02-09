-- Fix: Ajouter une politique RLS pour permettre aux admins de voir TOUTES les réclamations
-- Le problème: la fonction is_admin() regarde dans la table 'admins' mais les admins sont 
-- enregistrés dans 'profiles' avec role = 'admin'

-- Créer une nouvelle politique qui regarde profiles.role au lieu de la table admins
DROP POLICY IF EXISTS "reclam select owner or admin" ON public.reclamations_propriete;

CREATE POLICY "reclam select owner or admin" ON public.reclamations_propriete 
FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Vérifier les politiques
SELECT 
  'Politiques RLS pour reclamations_propriete' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reclamations_propriete'
ORDER BY policyname;

SELECT '✅ Politique RLS corrigée pour reclamations_propriete' as resultat;
