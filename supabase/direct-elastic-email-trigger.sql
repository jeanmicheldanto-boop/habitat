-- Alternative : Appeler Elastic Email DIRECTEMENT depuis le trigger
-- Sans passer par l'Edge Function

CREATE OR REPLACE FUNCTION notify_proposition_status_change_direct()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
  email_body TEXT;
  http_response http_response;
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

  -- Créer la notification in-app
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.created_by,
    CASE WHEN NEW.statut = 'approuvee' THEN 'proposition_approved' ELSE 'proposition_rejected' END,
    CASE WHEN NEW.statut = 'approuvee' THEN 'Proposition approuvée' ELSE 'Proposition rejetée' END,
    CASE WHEN NEW.statut = 'approuvee' 
      THEN 'Votre demande de création d''établissement a été approuvée !'
      ELSE 'Votre demande de création d''établissement a été rejetée.'
    END,
    jsonb_build_object('proposition_id', NEW.id, 'review_note', NEW.review_note)
  );

  -- Corps de l'email en HTML
  email_body := '<h2>Proposition ' || NEW.statut || '</h2><p>Bonjour ' || user_prenom || ',</p><p>Votre proposition pour <strong>' || etab_name || '</strong> a été ' || NEW.statut || '.</p>';

  -- Appeler DIRECTEMENT l'API Elastic Email v2 (sans Edge Function)
  BEGIN
    SELECT * INTO http_response FROM http_post(
      'https://api.elasticemail.com/v2/email/send',
      'apikey=VOTRE_CLE_ELASTIC_EMAIL_ICI&from=patrick.danto@habitat-intermediaire.fr&fromName=Habitat Intermédiaire&to=' || user_email || '&subject=Proposition ' || NEW.statut || '&bodyHtml=' || email_body,
      'application/x-www-form-urlencoded'
    );
    
    RAISE NOTICE 'Email sent to % via Elastic Email (status: %)', user_email, http_response.status;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send email to %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test de la fonction
-- Remplacez VOTRE_CLE_ELASTIC_EMAIL_ICI par votre vraie clé avant d'exécuter !
