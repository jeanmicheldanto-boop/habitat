-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('proposition_approved', 'proposition_rejected', 'reclamation_approved', 'reclamation_rejected')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS pour les notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour créer des notifications automatiquement
CREATE OR REPLACE FUNCTION create_notification_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(20);
BEGIN
  -- Pour les propositions
  IF TG_TABLE_NAME = 'propositions' THEN
    IF OLD.statut != NEW.statut AND NEW.statut IN ('approuve', 'rejete') THEN
      CASE NEW.statut
        WHEN 'approuve' THEN
          notification_type := 'proposition_approved';
          notification_title := 'Proposition approuvée';
          notification_message := 'Votre demande de création d''établissement a été approuvée !';
        WHEN 'rejete' THEN
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
          'review_note', NEW.review_note
        )
      );
    END IF;
  END IF;

  -- Pour les réclamations
  IF TG_TABLE_NAME = 'reclamations_propriete' THEN
    IF OLD.statut != NEW.statut AND NEW.statut IN ('approuve', 'rejete') THEN
      CASE NEW.statut
        WHEN 'approuve' THEN
          notification_type := 'reclamation_approved';
          notification_title := 'Réclamation approuvée';
          notification_message := 'Votre réclamation de propriété a été approuvée !';
        WHEN 'rejete' THEN
          notification_type := 'reclamation_rejected';
          notification_title := 'Réclamation rejetée';
          notification_message := 'Votre réclamation de propriété a été rejetée.';
      END CASE;

      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        NEW.created_by,
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers pour les notifications automatiques
DROP TRIGGER IF EXISTS proposition_status_change_notification ON propositions;
CREATE TRIGGER proposition_status_change_notification
  AFTER UPDATE ON propositions
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_status_change();

DROP TRIGGER IF EXISTS reclamation_status_change_notification ON reclamations_propriete;
CREATE TRIGGER reclamation_status_change_notification
  AFTER UPDATE ON reclamations_propriete
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_status_change();