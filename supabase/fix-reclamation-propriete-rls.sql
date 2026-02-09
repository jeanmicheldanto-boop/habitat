-- ====================================================================
-- RLS POLICY POUR PERMETTRE LES ÉDITIONS VIA PROPRIETAIRES
-- ====================================================================
-- Permet aux utilisateurs ayant revendiqué un établissement via 
-- reclamations_propriete de le modifier après approbation admin

-- 1. Vérifier que la RLS est bien activée sur etablissements
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;

-- 2. Ajouter une policy UPDATE qui accepte aussi les proprietaires
-- (en plus du champ gestionnaire = organisation)
CREATE POLICY "gestionnaire update own or claimed etablissements" 
ON public.etablissements 
FOR UPDATE 
TO authenticated 
USING (
  -- Access si gestionnaire par organisation OU proprietaire revendiqué
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'gestionnaire'
      AND p.organisation = etablissements.gestionnaire
  )
  OR
  -- Access si user_id dans etablissement_proprietaires (propriété revendiquée et approuvée)
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissements.id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
)
WITH CHECK (
  -- Same check for the new values
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'gestionnaire'
      AND p.organisation = etablissements.gestionnaire
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissements.id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 3. Ajouter une policy SELECT pour que les proprietaires puissent voir les établissements
CREATE POLICY "gestionnaire read own or claimed etablissements" 
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
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissements.id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 4. Ajouter une SELECT policy pour les tables enfants (logements, services, etc.)
-- afin que les proprietaires puissent aussi les consulter/modifier

CREATE POLICY "gestionnaire read logements from proprietaires"
ON public.logements_types
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = logements_types.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

CREATE POLICY "gestionnaire write logements from proprietaires"
ON public.logements_types
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = logements_types.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = logements_types.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 5. Idem pour tarifications
CREATE POLICY "gestionnaire read tarifications from proprietaires"
ON public.tarifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = tarifications.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = tarifications.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

CREATE POLICY "gestionnaire write tarifications from proprietaires"
ON public.tarifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = tarifications.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = tarifications.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 6. Services: etablissement_service junction table
CREATE POLICY "gestionnaire manage services from proprietaires"
ON public.etablissement_service
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = etablissement_service.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissement_service.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 7. Restauration table
CREATE POLICY "gestionnaire read restauration from proprietaires"
ON public.restaurations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = restaurations.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = restaurations.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

CREATE POLICY "gestionnaire write restauration from proprietaires"
ON public.restaurations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = restaurations.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = restaurations.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

-- 8. AVP infos
CREATE POLICY "gestionnaire read avp from proprietaires"
ON public.avp_infos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = avp_infos.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = avp_infos.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);

CREATE POLICY "gestionnaire write avp from proprietaires"
ON public.avp_infos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.etablissements e
    JOIN public.profiles p ON p.role = 'gestionnaire' AND p.organisation = e.gestionnaire
    WHERE e.id = avp_infos.etablissement_id
      AND p.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.etablissement_proprietaires ep
    WHERE ep.etablissement_id = avp_infos.etablissement_id
      AND ep.user_id = auth.uid()
      AND ep.active = true
  )
);
