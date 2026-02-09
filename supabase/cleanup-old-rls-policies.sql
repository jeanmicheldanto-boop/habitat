-- ====================================================================
-- NETTOYAGE DES ANCIENNES POLICIES CONFLICTUELLES
-- ====================================================================
-- Supprimer les anciennes policies qui restreignaient UNIQUEMENT au champ gestionnaire
-- afin de les remplacer par les nouvelles qui acceptent aussi les proprietaires

-- Désactiver temporairement les RLS pour faire les modifications
ALTER TABLE public.etablissements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logements_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.avp_infos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissement_service DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "gestionnaire read own etablissements" ON public.etablissements;
DROP POLICY IF EXISTS "gestionnaire update own etablissements" ON public.etablissements;

DROP POLICY IF EXISTS "gestionnaire read own logements_types" ON public.logements_types;
DROP POLICY IF EXISTS "gestionnaire write own logements_types" ON public.logements_types;

DROP POLICY IF EXISTS "gestionnaire read own tarifications" ON public.tarifications;
DROP POLICY IF EXISTS "gestionnaire write own tarifications" ON public.tarifications;

DROP POLICY IF EXISTS "gestionnaire read own restauration" ON public.restaurations;
DROP POLICY IF EXISTS "gestionnaire write own restauration" ON public.restaurations;

DROP POLICY IF EXISTS "gestionnaire read own avp_infos" ON public.avp_infos;
DROP POLICY IF EXISTS "gestionnaire write own avp_infos" ON public.avp_infos;

DROP POLICY IF EXISTS "gestionnaire manage own services" ON public.etablissement_service;

-- Réactiver RLS
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logements_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avp_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissement_service ENABLE ROW LEVEL SECURITY;

-- Note: Les nouvelles policies seront créées par fix-reclamation-propriete-rls.sql
