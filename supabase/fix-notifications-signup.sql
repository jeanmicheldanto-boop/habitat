-- Script pour améliorer le système de notifications
-- Ce script étend les notifications pour couvrir tous les cas d'usage

-- 1. Fonction pour envoyer une notification email de bienvenue
CREATE OR REPLACE FUNCTION send_welcome_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Récupérer l'email et le nom du nouvel utilisateur
  SELECT email, COALESCE(raw_user_meta_data->>'prenom', ''), COALESCE(raw_user_meta_data->>'nom', '')
  INTO user_email, user_prenom, user_nom
  FROM auth.users
  WHERE id = NEW.id;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- URL de la fonction edge (REMPLACER par votre référence projet)
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'type', 'welcome',
    'role', COALESCE(raw_user_meta_data->>'role', 'user')
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send welcome notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger pour les nouveaux utilisateurs gestionnaires
DROP TRIGGER IF EXISTS user_welcome_notification ON auth.users;

-- Note: Ce trigger nécessite l'accès au schéma auth, qui peut nécessiter des permissions spéciales
-- Si vous n'avez pas accès, utilisez l'approche côté client

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

-- 5. Fonction pour notifier lors de la modification d'établissement
CREATE OR REPLACE FUNCTION notify_etablissement_update()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Ne notifier que si l'établissement a un propriétaire
  IF OLD.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ne notifier que si des champs importants ont changé
  IF OLD.nom = NEW.nom 
     AND OLD.statut_editorial = NEW.statut_editorial
     AND OLD.adresse_l1 = NEW.adresse_l1
     AND OLD.commune = NEW.commune THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email et le nom du propriétaire
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = OLD.created_by;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', OLD.created_by;
    RETURN NEW;
  END IF;

  -- Construire l'URL de la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', NEW.nom,
    'type', 'etablissement_updated',
    'etablissement_id', NEW.id,
    'statut_editorial', NEW.statut_editorial,
    'old_statut', OLD.statut_editorial
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send etablissement update notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer le trigger pour les modifications d'établissements
DROP TRIGGER IF EXISTS etablissement_update_notification ON etablissements;

CREATE TRIGGER etablissement_update_notification
AFTER UPDATE ON etablissements
FOR EACH ROW
WHEN (OLD.nom IS DISTINCT FROM NEW.nom 
   OR OLD.statut_editorial IS DISTINCT FROM NEW.statut_editorial
   OR OLD.adresse_l1 IS DISTINCT FROM NEW.adresse_l1
   OR OLD.commune IS DISTINCT FROM NEW.commune)
EXECUTE FUNCTION notify_etablissement_update();

-- 7. Améliorer la fonction de notification de réclamation pour envoyer immédiatement
CREATE OR REPLACE FUNCTION notify_reclamation_creation()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Récupérer l'email et le nom du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.user_id;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  SELECT nom INTO etab_name
  FROM etablissements
  WHERE id = NEW.etablissement_id;

  -- Construire l'URL de la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', COALESCE(etab_name, 'l''établissement'),
    'type', 'reclamation_created',
    'reclamation_id', NEW.id,
    'etablissement_id', NEW.etablissement_id
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send reclamation creation notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer le trigger pour les nouvelles réclamations
DROP TRIGGER IF EXISTS reclamation_creation_notification ON reclamations_propriete;

CREATE TRIGGER reclamation_creation_notification
AFTER INSERT ON reclamations_propriete
FOR EACH ROW
EXECUTE FUNCTION notify_reclamation_creation();

-- 9. Améliorer la fonction pour les changements de statut de réclamation
CREATE OR REPLACE FUNCTION notify_reclamation_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  function_url TEXT;
  request_body TEXT;
BEGIN
  -- Ne rien faire si le statut n'a pas changé
  IF OLD.statut = NEW.statut THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email et le nom du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.user_id;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  SELECT nom INTO etab_name
  FROM etablissements
  WHERE id = NEW.etablissement_id;

  -- Construire l'URL de la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';

  -- Construire le corps de la requête JSON
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', COALESCE(etab_name, 'l''établissement'),
    'type', 'reclamation_status_change',
    'reclamation_id', NEW.id,
    'etablissement_id', NEW.etablissement_id,
    'statut', NEW.statut,
    'note_moderation', NEW.note_moderation
  )::text;

  -- Appeler la fonction edge de manière asynchrone
  BEGIN
    PERFORM http_post(
      function_url,
      request_body,
      'application/json'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send reclamation status notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer le trigger pour les changements de statut de réclamation
DROP TRIGGER IF EXISTS reclamation_status_notification ON reclamations_propriete;

CREATE TRIGGER reclamation_status_notification
AFTER UPDATE OF statut ON reclamations_propriete
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_reclamation_status_change();

-- 11. Ajouter un lien entre établissement et propriétaire après approbation de réclamation
CREATE OR REPLACE FUNCTION add_owner_after_reclamation_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la réclamation est approuvée, ajouter l'utilisateur comme propriétaire
  IF OLD.statut != 'verifiee' AND NEW.statut = 'verifiee' THEN
    INSERT INTO etablissement_proprietaires (etablissement_id, user_id, role, active)
    VALUES (NEW.etablissement_id, NEW.user_id, 'gestionnaire', true)
    ON CONFLICT (etablissement_id, user_id) 
    DO UPDATE SET active = true, role = 'gestionnaire';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Créer le trigger pour ajouter le propriétaire
DROP TRIGGER IF EXISTS add_owner_on_approval ON reclamations_propriete;

CREATE TRIGGER add_owner_on_approval
AFTER UPDATE OF statut ON reclamations_propriete
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut AND NEW.statut = 'verifiee')
EXECUTE FUNCTION add_owner_after_reclamation_approval();

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON FUNCTION notify_etablissement_creation() TO postgres, service_role;
GRANT ALL ON FUNCTION notify_etablissement_update() TO postgres, service_role;
GRANT ALL ON FUNCTION notify_reclamation_creation() TO postgres, service_role;
GRANT ALL ON FUNCTION notify_reclamation_status_change() TO postgres, service_role;
GRANT ALL ON FUNCTION add_owner_after_reclamation_approval() TO postgres, service_role;

-- Commentaires
COMMENT ON FUNCTION notify_etablissement_creation() IS 'Envoie un email de confirmation lors de la création d''un établissement';
COMMENT ON FUNCTION notify_etablissement_update() IS 'Envoie un email de notification lors de la modification d''un établissement';
COMMENT ON FUNCTION notify_reclamation_creation() IS 'Envoie un email de confirmation lors de la création d''une réclamation';
COMMENT ON FUNCTION notify_reclamation_status_change() IS 'Envoie un email lors du changement de statut d''une réclamation';
COMMENT ON FUNCTION add_owner_after_reclamation_approval() IS 'Ajoute l''utilisateur comme propriétaire après approbation de la réclamation';
