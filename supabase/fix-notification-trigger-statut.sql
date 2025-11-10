-- Fix notification trigger to use correct enum values
-- The trigger was checking for 'approuve' and 'rejete' instead of 'approuvee' and 'rejetee'

-- Drop and recreate the function with correct enum values
CREATE OR REPLACE FUNCTION public.create_notification_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(20);
BEGIN
  -- Pour les propositions
  IF TG_TABLE_NAME = 'propositions' THEN
    IF OLD.statut != NEW.statut AND NEW.statut IN ('approuvee', 'rejetee') THEN
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

      -- Only create notification if created_by is not null
      IF NEW.created_by IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.created_by,
          notification_type,
          notification_title,
          notification_message,
          jsonb_build_object(
            'proposition_id', NEW.id,
            'review_note', NEW.review_note
          )
        );
      END IF;
    END IF;
  END IF;

  -- Pour les réclamations
  IF TG_TABLE_NAME = 'reclamations_propriete' THEN
    IF OLD.statut != NEW.statut AND NEW.statut IN ('verifiee', 'rejetee') THEN
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

      -- Only create notification if user_id is not null
      IF NEW.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.user_id,
          notification_type,
          notification_title,
          notification_message,
          jsonb_build_object(
            'reclamation_id', NEW.id,
            'etablissement_id', NEW.etablissement_id,
            'review_note', NEW.review_note
          )
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment to document the fix
COMMENT ON FUNCTION public.create_notification_on_status_change() IS 
'Trigger function that creates notifications when proposition or reclamation status changes. Fixed to use correct enum values: approuvee/rejetee instead of approuve/rejete';
