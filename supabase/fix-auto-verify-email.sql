-- ====================================================================
-- CONTOURNER LE PROBLÈME D'EMAIL NON VÉRIFIÉ
-- ====================================================================
-- Solution : Auto-vérifier l'email lors de la création du profil
-- puisque l'email a déjà reçu le mail de bienvenue

-- 1. Créer une fonction qui marque l'email comme vérifié
CREATE OR REPLACE FUNCTION auto_verify_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier l'email de l'utilisateur qui vient d'être créé
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id
    AND email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ajouter un trigger sur la table profiles
-- Cela fait en sorte que quand un profil gestionnaire est créé,
-- le email est automatiquement marqué comme vérifié dans auth.users
DROP TRIGGER IF EXISTS auto_verify_gestionnaire_email ON public.profiles;

CREATE TRIGGER auto_verify_gestionnaire_email
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'gestionnaire')
EXECUTE FUNCTION auto_verify_email();

-- ====================================================================
-- NOTES
-- ====================================================================
-- Cette solution s'applique uniquement aux profils de type 'gestionnaire'
-- car c'est le seul type d'utilisateur AUTO-CRÉÉ dans notre système
--
-- Les utilisateurs admin/autre doivent vérifier leur email manuellement
-- via le lien que Supabase aurait du envoyer
