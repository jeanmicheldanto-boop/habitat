-- ====================================================================
-- CORRECTION ET ACTIVATION DU SYSTÈME D'EMAILS POUR PROPOSITIONS
-- ====================================================================

-- 1. Vérifier que l'extension http est activée
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS proposition_status_notification ON propositions;
DROP TRIGGER IF EXISTS proposition_status_change_notification ON propositions;

-- 3. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS notify_proposition_status_change();
DROP FUNCTION IF EXISTS create_notification_on_status_change();

-- 4. Créer la fonction pour les notifications de propositions
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
  -- Ne rien faire si le statut n'a pas changé
  IF OLD.statut = NEW.statut OR (OLD.statut IS NULL AND NEW.statut IS NULL) THEN
    RETURN NEW;
  END IF;

  -- Seulement pour les statuts approuvée et rejetée
  IF NEW.statut NOT IN ('approuvee', 'rejetee') THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email et le nom de l'utilisateur
  -- Cas 1 : Utilisateur authentifié (created_by existe)
  IF NEW.created_by IS NOT NULL THEN
    SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
    INTO user_email, user_prenom, user_nom
    FROM profiles
    WHERE id = NEW.created_by;
  END IF;

  -- Cas 2 : Proposition anonyme (email dans le payload)
  IF user_email IS NULL THEN
    user_email := NEW.payload->'proposeur'->>'email';
    user_nom := COALESCE(NEW.payload->'proposeur'->>'nom', '');
    user_prenom := COALESCE(NEW.payload->'proposeur'->>'prenom', '');
  END IF;

  -- Si toujours pas d'email, on arrête
  IF user_email IS NULL OR user_email = '' THEN
    RAISE NOTICE 'Pas d''email trouvé pour la proposition %', NEW.id;
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  -- Pour les updates, le nom est dans payload.modifications.nom
  -- Pour les creates, il est dans payload.nom
  IF NEW.action = 'update' THEN
    etab_name := COALESCE(NEW.payload->'modifications'->>'nom', NEW.payload->>'nom', 'votre établissement');
  ELSE
    etab_name := COALESCE(NEW.payload->>'nom', 'votre établissement');
  END IF;

  -- Définir le type et le message selon le statut
  CASE NEW.statut
    WHEN 'approuvee' THEN
      notification_type := 'proposition_approved';
      notification_title := 'Proposition approuvée';
      IF NEW.action = 'create' THEN
        notification_message := 'Votre demande de création d''établissement a été approuvée !';
      ELSE
        notification_message := 'Votre demande de modification d''établissement a été approuvée !';
      END IF;
    WHEN 'rejetee' THEN
      notification_type := 'proposition_rejected';
      notification_title := 'Proposition rejetée';
      IF NEW.action = 'create' THEN
        notification_message := 'Votre demande de création d''établissement a été rejetée.';
      ELSE
        notification_message := 'Votre demande de modification d''établissement a été rejetée.';
      END IF;
  END CASE;

  -- 1. Créer la notification in-app (seulement pour utilisateurs authentifiés)
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.created_by,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object('proposition_id', NEW.id, 'review_note', NEW.review_note)
    );
    RAISE NOTICE '✅ Notification in-app créée pour %', user_email;
  ELSE
    RAISE NOTICE 'ℹ️ Pas de notification in-app (proposition anonyme) pour %', user_email;
  END IF;

  -- 2. Envoyer l'email via la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  request_body := json_build_object(
    'email', user_email,
    'name', TRIM(user_prenom || ' ' || user_nom),
    'etablissement', etab_name,
    'statut', NEW.statut,
    'action', NEW.action,
    'review_note', NEW.review_note,
    'hasAccount', NEW.created_by IS NOT NULL,
    'etablissement_id', NEW.etablissement_id
  )::text;

  BEGIN
    PERFORM net.http_post(
      url := function_url,
      body := request_body::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
      )
    );
    RAISE NOTICE 'Email sent to %', user_email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '⚠️ Échec envoi email à %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION notify_proposition_status_change() IS 
  'Fonction trigger qui envoie un email et crée une notification quand le statut d''une proposition change vers approuvee ou rejetee';

-- 5. Créer le trigger
CREATE TRIGGER proposition_status_notification
AFTER UPDATE OF statut ON propositions
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE FUNCTION notify_proposition_status_change();

COMMENT ON TRIGGER proposition_status_notification ON propositions IS 
  'Déclenche l''envoi d''email et la création de notification lors du changement de statut d''une proposition';

-- 6. Accorder les permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON FUNCTION notify_proposition_status_change() TO postgres, service_role;

-- 7. Vérification
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'propositions'
  AND trigger_name = 'proposition_status_notification';

-- 8. Test : Voir les propositions récentes qui auraient dû déclencher un email
SELECT 
  p.id,
  p.statut,
  p.action,
  p.created_at,
  prof.email,
  COALESCE(p.payload->'modifications'->>'nom', p.payload->>'nom') as etablissement
FROM propositions p
LEFT JOIN profiles prof ON prof.id = p.created_by
WHERE p.statut IN ('approuvee', 'rejetee')
ORDER BY p.created_at DESC
LIMIT 5;

-- ====================================================================
-- SYSTÈME ACTIVÉ !
-- Les prochaines approbations/rejets enverront automatiquement un email
-- Pour la proposition de Maison Mochez déjà approuvée, utilisez :
-- send-approval-email-maison-mochez.sql
-- ====================================================================
