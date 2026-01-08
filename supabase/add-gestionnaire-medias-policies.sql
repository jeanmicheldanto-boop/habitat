-- Politique RLS pour permettre aux gestionnaires de lire les medias de leurs établissements
CREATE POLICY "gestionnaire read own medias" 
ON public.medias 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = medias.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- Politique RLS pour permettre aux gestionnaires d'insérer des medias pour leurs établissements
CREATE POLICY "gestionnaire insert own medias" 
ON public.medias 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = medias.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- Politique RLS pour permettre aux gestionnaires de supprimer des medias de leurs établissements
CREATE POLICY "gestionnaire delete own medias" 
ON public.medias 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = medias.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);
