-- PARTIE 1 : Fonction pour la création d'établissement
-- Exécuter cette partie d'abord pour tester

-- 3. Fonction pour notifier lors de la création d'établissement
CREATE OR REPLACE FUNCTION notify_etablissement_creation()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Ne notifier que si c'est une création par un gestionnaire (created_by n'est pas null)
  IF NEW.created_by IS NULL THEN
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

  -- Construire l'URL de la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', NEW.nom,
    'type', 'etablissement_created',
    'etablissement_id', NEW.id,
    'statut_editorial', NEW.statut_editorial
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send etablissement creation notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger pour les nouveaux établissements
DROP TRIGGER IF EXISTS etablissement_creation_notification ON etablissements;

CREATE TRIGGER etablissement_creation_notification
AFTER INSERT ON etablissements
FOR EACH ROW
EXECUTE FUNCTION notify_etablissement_creation();

-- Permissions
GRANT ALL ON FUNCTION notify_etablissement_creation() TO postgres, service_role;

-- Commentaire
COMMENT ON FUNCTION notify_etablissement_creation() IS 'Envoie un email de confirmation lors de la création d''un établissement';

-- Test : vérifier que le trigger existe
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'etablissement_creation_notification';
