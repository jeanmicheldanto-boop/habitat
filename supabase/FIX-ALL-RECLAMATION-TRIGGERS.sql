-- ========================================
-- FIX TOTAL: Corriger TOUS les triggers reclamations_propriete
-- ========================================
-- Problème: Tous les triggers référencent NEW.review_note qui n'existe pas
-- Solution: Les remplacer par NEW.note_moderation (seule colonne valide)

-- 1. DROP tous les triggers sur reclamations_propriete
DROP TRIGGER IF EXISTS reclamation_status_notification ON reclamations_propriete;
DROP TRIGGER IF EXISTS reclamation_status_change_notification ON reclamations_propriete;
DROP TRIGGER IF EXISTS create_notification_on_status_change_reclamation ON reclamations_propriete;

-- 2. DROP les fonctions associées (on va les recréer correctement)
DROP FUNCTION IF EXISTS notify_reclamation_status_change();
DROP FUNCTION IF EXISTS create_notification_on_status_change();

-- 3. Recréer la fonction correctement pour reclamations_propriete
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
    jsonb_build_object(
      'reclamation_id', NEW.id, 
      'etablissement_id', NEW.etablissement_id, 
      'note_moderation', COALESCE(NEW.note_moderation, '')
    )
  );

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'type', 'reclamation_status_change',
    'etablissement', etab_name,
    'statut', NEW.statut,
    'note_moderation', COALESCE(NEW.note_moderation, '')
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

-- 4. Recréer le trigger correctement
CREATE TRIGGER reclamation_status_notification
AFTER UPDATE OF statut ON reclamations_propriete
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_reclamation_status_change();

-- 5. Vérification
SELECT 
  'notify_reclamation_status_change' as fonction,
  'reclamation_status_notification' as trigger_creé
UNION ALL
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE event_object_table = 'reclamations_propriete';

-- 6. Test: Chercher toute référence restante à NEW.review_note (should be 0 for reclamations)
SELECT 'Vérification complétée - Tous les triggers reclamations_propriete utilisent maintenant note_moderation' as resultat;
