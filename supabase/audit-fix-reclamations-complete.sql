-- Audit & Fix: Correction complète du processus de mise à jour des réclamations de propriété
-- Problèmes identifiés:
-- 1. Fonction create_notification_on_status_change() utilise les mauvais noms de colonnes
-- 2. Statuts enum incorrects (approuve/rejete au lieu de verifiee/rejetee pour reclamations)
-- 3. Références à NEW.created_by au lieu de NEW.user_id
-- 4. Références à NEW.review_note au lieu de NEW.note_moderation

-- Corriger la fonction de notification
CREATE OR REPLACE FUNCTION public.create_notification_on_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(20);
  user_id_value UUID;
  note_value TEXT;
BEGIN
  -- Pour les propositions (statut: approuvee, rejetee)
  IF TG_TABLE_NAME = 'propositions' THEN
    IF OLD.statut IS DISTINCT FROM NEW.statut AND NEW.statut IN ('approuvee', 'rejetee') THEN
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
        jsonb_build_object(
          'proposition_id', NEW.id,
          'review_note', COALESCE(NEW.review_note, '')
        )
      );
    END IF;
  END IF;

  -- Pour les réclamations (statut: verifiee, rejetee, en_attente)
  IF TG_TABLE_NAME = 'reclamations_propriete' THEN
    IF OLD.statut IS DISTINCT FROM NEW.statut AND NEW.statut IN ('verifiee', 'rejetee') THEN
      user_id_value := NEW.user_id;
      note_value := COALESCE(NEW.note_moderation, '');
      
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

      -- Insérer la notification seulement si user_id existe
      IF user_id_value IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          user_id_value,
          notification_type,
          notification_title,
          notification_message,
          jsonb_build_object(
            'reclamation_id', NEW.id,
            'etablissement_id', NEW.etablissement_id,
            'note_moderation', note_value
          )
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Vérifier que la fonction est correcte
SELECT 'Fonction create_notification_on_status_change() corrigée' as statut;

-- Afficher les colonnes de reclamations_propriete pour confirmation
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reclamations_propriete' AND table_schema = 'public'
ORDER BY column_name;
