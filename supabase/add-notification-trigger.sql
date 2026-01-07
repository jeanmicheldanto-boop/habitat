-- Script SQL pour créer le trigger de notification automatique
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Activer l'extension http si pas déjà fait
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Fonction qui envoie une notification quand le statut d'une proposition change
CREATE OR REPLACE FUNCTION notify_proposition_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Ne rien faire si le statut n'a pas changé ou est resté à null
  IF OLD.statut = NEW.statut OR (OLD.statut IS NULL AND NEW.statut IS NULL) THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email et le nom du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.created_by;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.created_by;
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  SELECT nom INTO etab_name
  FROM etablissements
  WHERE id = NEW.etablissement_id;

  -- Construire l'URL de la fonction edge
  -- REMPLACER 'votre-projet-ref' par votre référence de projet Supabase
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', COALESCE(etab_name, 'votre établissement'),
    'statut', NEW.statut,
    'action', NEW.action,
    'review_note', NEW.review_note
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  -- Note: Cette approche utilise pg_net si disponible, sinon http
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, on log mais on ne bloque pas la transaction
    RAISE NOTICE 'Failed to send notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger sur la table propositions
DROP TRIGGER IF EXISTS proposition_status_notification ON propositions;

CREATE TRIGGER proposition_status_notification
AFTER UPDATE OF statut ON propositions
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_proposition_status_change();

-- 4. Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON FUNCTION notify_proposition_status_change() TO postgres, service_role;

-- Test du trigger (optionnel - décommenter pour tester)
-- UPDATE propositions SET statut = 'approuvee' WHERE id = 'UN_ID_DE_TEST';

COMMENT ON FUNCTION notify_proposition_status_change() IS 'Envoie automatiquement un email quand le statut d''une proposition change';
COMMENT ON TRIGGER proposition_status_notification ON propositions IS 'Déclenche l''envoi d''email lors du changement de statut';
