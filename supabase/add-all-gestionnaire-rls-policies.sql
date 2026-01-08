-- Policies RLS complètes pour l'interface gestionnaire

-- ============================================================================
-- ETABLISSEMENTS : Lecture et modification de leurs propres établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own etablissements" 
ON public.etablissements 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'gestionnaire'
      AND p.organisation = etablissements.gestionnaire
  )
);

CREATE POLICY "gestionnaire update own etablissements" 
ON public.etablissements 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'gestionnaire'
      AND p.organisation = etablissements.gestionnaire
  )
);

-- ============================================================================
-- LOGEMENTS_TYPES : CRUD complet pour leurs établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own logements_types" 
ON public.logements_types 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire insert own logements_types" 
ON public.logements_types 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire update own logements_types" 
ON public.logements_types 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire delete own logements_types" 
ON public.logements_types 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- ============================================================================
-- ETABLISSEMENT_SERVICE : CRUD pour gérer les services
-- ============================================================================

CREATE POLICY "gestionnaire read own etablissement_service" 
ON public.etablissement_service 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = etablissement_service.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire insert own etablissement_service" 
ON public.etablissement_service 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = etablissement_service.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire delete own etablissement_service" 
ON public.etablissement_service 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = etablissement_service.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- ============================================================================
-- TARIFICATIONS : CRUD pour leurs établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own tarifications" 
ON public.tarifications 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = tarifications.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire insert own tarifications" 
ON public.tarifications 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = tarifications.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire update own tarifications" 
ON public.tarifications 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = tarifications.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- ============================================================================
-- RESTAURATIONS : CRUD pour leurs établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own restaurations" 
ON public.restaurations 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = restaurations.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire insert own restaurations" 
ON public.restaurations 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = restaurations.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire update own restaurations" 
ON public.restaurations 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = restaurations.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- ============================================================================
-- AVP_INFOS : CRUD pour leurs établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own avp_infos" 
ON public.avp_infos 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = avp_infos.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire insert own avp_infos" 
ON public.avp_infos 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = avp_infos.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

CREATE POLICY "gestionnaire update own avp_infos" 
ON public.avp_infos 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = avp_infos.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);

-- ============================================================================
-- SOUS_CATEGORIES : Lecture pour tous les authentifiés
-- ============================================================================

CREATE POLICY "authenticated read sous_categories" 
ON public.sous_categories 
FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================================
-- ETABLISSEMENT_SOUS_CATEGORIE : Lecture pour leurs établissements
-- ============================================================================

CREATE POLICY "gestionnaire read own etablissement_sous_categorie" 
ON public.etablissement_sous_categorie 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.organisation = e.gestionnaire
    WHERE e.id = etablissement_sous_categorie.etablissement_id
      AND p.id = auth.uid()
      AND p.role = 'gestionnaire'
  )
);
