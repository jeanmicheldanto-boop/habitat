-- ========================================
-- MISE À JOUR DU SYSTÈME DE NOTIFICATION VERS ELASTIC EMAIL
-- ========================================

-- 1. Supprimer les anciens triggers
DROP TRIGGER IF EXISTS proposition_status_change_notification ON propositions;
DROP TRIGGER IF EXISTS proposition_status_notification ON propositions;
DROP TRIGGER IF EXISTS reclamation_status_change_notification ON reclamations_propriete;
DROP TRIGGER IF EXISTS reclamation_status_notification ON reclamations_propriete;

-- 2. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS create_notification_on_status_change();

-- 3. Activer l'extension http
CREATE EXTENSION IF NOT EXISTS http;

-- 4. Fonction pour propositions (notification in-app + email)
CREATE OR REPLACE FUNCTION notify_proposition_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  function_url TEXT;
  request_body TEXT;
  http_response http_response;
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(20);
BEGIN
  IF OLD.statut = NEW.statut OR (OLD.statut IS NULL AND NEW.statut IS NULL) THEN
    RETURN NEW;
  END IF;

  IF NEW.statut NOT IN ('approuvee', 'rejetee') THEN
    RETURN NEW;
  END IF;

  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.created_by;

  IF NEW.created_by IS NULL OR user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.created_by;
    RETURN NEW;
  END IF;

  etab_name := COALESCE(NEW.payload->>'nom', 'votre établissement');

  CASE NEW.statut
    WHEN 'approuvee' THEN
      notification_type := 'proposition_approved';
      notification_title := 'Proposition approuvée';
      notification_message := 'Votre demande de création d''établissement a été approuvée !';
    WHEN 'rejetee' THEN
      notification_type := 'proposition_rejected';
      notification_title := 'Proposition rejetée';
      notification_message := 'Votre demande de création d''établissement a été rejetée.';
  END CASE;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.created_by,
    notification_type,
    notification_title,
    notification_message,
    jsonb_build_object('proposition_id', NEW.id, 'review_note', NEW.review_note)
  );

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', etab_name,
    'statut', NEW.statut,
    'action', NEW.action,
    'review_note', NEW.review_note
  )::text;

  BEGIN
    SELECT * INTO http_response FROM http_post(
      function_url,
      request_body,
      'application/json'
    );
    RAISE NOTICE 'Email sent to % (status: %)', user_email, http_response.status;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send email to %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour réclamations
CREATE OR REPLACE FUNCTION notify_reclamation_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  function_url TEXT;
  request_body TEXT;
  http_response http_response;
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(20);
BEGIN
  IF OLD.statut = NEW.statut OR (OLD.statut IS NULL AND NEW.statut IS NULL) THEN
    RETURN NEW;
  END IF;

  IF NEW.statut NOT IN ('verifiee', 'rejetee') THEN
    RETURN NEW;
  END IF;

  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.user_id;

  IF NEW.user_id IS NULL OR user_email IS NULL THEN
    RAISE NOTICE 'No email found for user %', NEW.user_id;
    RETURN NEW;
  END IF;

  SELECT nom INTO etab_name FROM etablissements WHERE id = NEW.etablissement_id;
  etab_name := COALESCE(etab_name, 'l''établissement');

  CASE NEW.statut
    WHEN 'verifiee' THEN
      notification_type := 'reclamation_approved';
      notification_title := 'Réclamation approuvée';
      notification_message := 'Votre réclamation de propriété a été approuvée !';
    WHEN 'rejetee' THEN
      notification_type := 'reclamation_rejected';
      notification_title := 'Réclamation rejetée';
      notification_message := 'Votre réclamation de propriété a été rejetée.';
  END CASE;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.user_id,
    notification_type,
    notification_title,
    notification_message,
    jsonb_build_object('reclamation_id', NEW.id, 'etablissement_id', NEW.etablissement_id, 'review_note', NEW.review_note)
  );

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'type', 'reclamation_status_change',
    'etablissement', etab_name,
    'statut', NEW.statut,
    'note_moderation', NEW.review_note
  )::text;

  BEGIN
    SELECT * INTO http_response FROM http_post(
      function_url,
      request_body,
      'application/json'
    );
    RAISE NOTICE 'Email sent to % (status: %)', user_email, http_response.status;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send email to %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer les triggers
CREATE TRIGGER proposition_status_notification
AFTER UPDATE OF statut ON propositions
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_proposition_status_change();

CREATE TRIGGER reclamation_status_notification
AFTER UPDATE OF statut ON reclamations_propriete
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_reclamation_status_change();

-- 7. Permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON FUNCTION notify_proposition_status_change() TO postgres, service_role;
GRANT ALL ON FUNCTION notify_reclamation_status_change() TO postgres, service_role;

-- 8. Vérification
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('propositions', 'reclamations_propriete')
AND trigger_name LIKE '%notification%';

-- ========================================
-- SUCCÈS! Système configuré pour Elastic Email
-- Testez avec: node test-notification-trigger.js
-- ========================================
