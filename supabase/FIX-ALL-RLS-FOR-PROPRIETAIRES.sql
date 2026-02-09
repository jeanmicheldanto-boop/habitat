-- AUDIT COMPLET: RLS Policies pour Propriétaires d'Établissements
-- Objectif: Les utilisateurs avec reclamations approuvées doivent pouvoir TOUT éditer

-- Tables concernées par l'édition:
-- 1. etablissements (UPDATE)
-- 2. etablissement_service (INSERT/DELETE)
-- 3. tarifications (INSERT/UPDATE)
-- 4. restaurations (INSERT/UPDATE)
-- 5. avp_infos (INSERT/UPDATE)
-- 6. logements_types (INSERT/UPDATE/DELETE)
-- 7. medias (INSERT/UPDATE/DELETE)

-- ======================
-- DIAGNOSTIC COMPLET
-- ======================

-- Voir TOUTES les policies actuelles
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING clause present'
    ELSE 'No USING clause'
  END as using_check,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK present'
    ELSE 'No WITH CHECK'
  END as with_check_status
FROM pg_policies
WHERE tablename IN (
  'etablissements',
  'etablissement_service',
  'tarifications',
  'restaurations',
  'avp_infos',
  'logements_types',
  'medias'
)
ORDER BY tablename, cmd;

-- ======================
-- FIXES REQUIS
-- ======================

-- 1. ETABLISSEMENTS - Permettre UPDATE aux proprietaires
CREATE POLICY IF NOT EXISTS "Proprietaires can update etablissements"
ON etablissements
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissements.id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 2. ETABLISSEMENT_SERVICE - Permettre INSERT/DELETE aux proprietaires
CREATE POLICY IF NOT EXISTS "Proprietaires can insert services"
ON etablissement_service
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissement_service.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can delete services"
ON etablissement_service
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = etablissement_service.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 3. TARIFICATIONS - Permettre INSERT/UPDATE
CREATE POLICY IF NOT EXISTS "Proprietaires can insert tarifications"
ON tarifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = tarifications.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can update tarifications"
ON tarifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = tarifications.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 4. RESTAURATIONS - Permettre INSERT/UPDATE
CREATE POLICY IF NOT EXISTS "Proprietaires can insert restaurations"
ON restaurations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = restaurations.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can update restaurations"
ON restaurations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = restaurations.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 5. AVP_INFOS - Permettre INSERT/UPDATE
CREATE POLICY IF NOT EXISTS "Proprietaires can insert avp_infos"
ON avp_infos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = avp_infos.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can update avp_infos"
ON avp_infos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = avp_infos.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 6. LOGEMENTS_TYPES - Permettre INSERT/UPDATE/DELETE
CREATE POLICY IF NOT EXISTS "Proprietaires can insert logements"
ON logements_types
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = logements_types.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can update logements"
ON logements_types
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = logements_types.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can delete logements"
ON logements_types
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = logements_types.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- 7. MEDIAS - Permettre INSERT/UPDATE/DELETE
CREATE POLICY IF NOT EXISTS "Proprietaires can insert medias"
ON medias
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can update medias"
ON medias
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

CREATE POLICY IF NOT EXISTS "Proprietaires can delete medias"
ON medias
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM etablissement_proprietaires ep
    WHERE ep.etablissement_id = medias.etablissement_id
    AND ep.user_id = auth.uid()
    AND ep.active = true
  )
);

-- ======================
-- VÉRIFICATION FINALE
-- ======================

SELECT 
  tablename,
  COUNT(*) as nombre_policies,
  string_agg(DISTINCT cmd::text, ', ') as operations_autorisees
FROM pg_policies
WHERE tablename IN (
  'etablissements',
  'etablissement_service',
  'tarifications',
  'restaurations',
  'avp_infos',
  'logements_types',
  'medias'
)
AND policyname LIKE '%roprietaire%'
GROUP BY tablename
ORDER BY tablename;

SELECT 'Toutes les RLS policies pour propriétaires créées avec succès!' as resultat;
