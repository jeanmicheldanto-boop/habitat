-- ========================================
-- CORRECTION DES FONCTIONS DE NOTIFICATION
-- Ajouter les headers d'autorisation pour appeler l'Edge Function
-- ========================================

-- Activer l'extension pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 0. Fonction de notification de bienvenue pour les nouveaux gestionnaires
CREATE OR REPLACE FUNCTION notify_welcome_gestionnaire()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Envoyer uniquement pour les gestionnaires
  IF NEW.role = 'gestionnaire' THEN
    BEGIN
      -- Utiliser une approche asynchrone pour ne pas bloquer l'insertion
      PERFORM net.http_post(
        url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
        body := jsonb_build_object(
          'email', NEW.email,
          'name', TRIM(COALESCE(NEW.prenom, '') || ' ' || COALESCE(NEW.nom, '')),
          'type', 'welcome'
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
        ),
        timeout_milliseconds := 5000
      );
    EXCEPTION WHEN OTHERS THEN
      -- Ignorer l'erreur pour ne pas bloquer l'insertion
      RAISE WARNING 'Failed to send welcome notification: %', SQLERRM;
    END;
  END IF;
  
  -- TOUJOURS retourner NEW pour permettre l'insertion
  RETURN NEW;
END;
$$;

-- Créer le trigger pour l'email de bienvenue
DROP TRIGGER IF EXISTS welcome_gestionnaire_notification ON profiles;
CREATE TRIGGER welcome_gestionnaire_notification
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome_gestionnaire();

-- 1. Fonction de notification de création d'établissement
CREATE OR REPLACE FUNCTION notify_etablissement_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  gestionnaire_uuid UUID;
BEGIN
  -- Essayer de convertir gestionnaire (text) en UUID
  BEGIN
    gestionnaire_uuid := NEW.gestionnaire::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Si ce n'est pas un UUID valide, on ne peut pas envoyer de notification
    RETURN NEW;
  END;

  -- Récupérer l'email et le nom du gestionnaire
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = gestionnaire_uuid;

  -- Si pas d'email, on ne peut pas envoyer de notification
  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Appeler la fonction edge de manière asynchrone avec les headers
  BEGIN
    PERFORM net.http_post(
      url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(NEW.nom, 'Nouvel établissement'),
        'type', 'etablissement_created',
        'etablissement_id', NEW.id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
      ),
      timeout_milliseconds := 5000
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send etablissement creation notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 2. Fonction de notification de mise à jour d'établissement
CREATE OR REPLACE FUNCTION notify_etablissement_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  gestionnaire_uuid UUID;
BEGIN
  -- Ne rien faire si c'est juste une mise à jour de updated_at
  IF OLD.nom = NEW.nom 
     AND OLD.adresse_l1 = NEW.adresse_l1 
     AND OLD.code_postal = NEW.code_postal
     AND OLD.commune = NEW.commune THEN
    RETURN NEW;
  END IF;

  -- Essayer de convertir gestionnaire (text) en UUID
  BEGIN
    gestionnaire_uuid := NEW.gestionnaire::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Si ce n'est pas un UUID valide, on ne peut pas envoyer de notification
    RETURN NEW;
  END;

  -- Récupérer l'email du gestionnaire
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = gestionnaire_uuid;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM net.http_post(
      url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(NEW.nom, 'Établissement'),
        'type', 'etablissement_updated',
        'etablissement_id', NEW.id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
      ),
      timeout_milliseconds := 5000
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send etablissement update notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Fonction de notification de création de réclamation
CREATE OR REPLACE FUNCTION notify_reclamation_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
BEGIN
  -- Récupérer l'email du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.user_id;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  SELECT nom INTO etab_name
  FROM etablissements
  WHERE id = NEW.etablissement_id;

  BEGIN
    PERFORM net.http_post(
      url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(etab_name, 'l''établissement'),
        'type', 'reclamation_created',
        'reclamation_id', NEW.id,
        'etablissement_id', NEW.etablissement_id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send reclamation creation notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 4. Fonction de notification de changement de statut de réclamation
CREATE OR REPLACE FUNCTION notify_reclamation_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_prenom TEXT;
  user_nom TEXT;
  etab_name TEXT;
BEGIN
  -- Ne rien faire si le statut n'a pas changé
  IF OLD.statut = NEW.statut THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.user_id;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'établissement
  SELECT nom INTO etab_name
  FROM etablissements
  WHERE id = NEW.etablissement_id;

  BEGIN
    PERFORM net.http_post(
      url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification',
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(etab_name, 'l''établissement'),
        'type', 'reclamation_status_change',
        'reclamation_id', NEW.id,
        'etablissement_id', NEW.etablissement_id,
        'statut', NEW.statut,
        'note_moderation', NEW.note_moderation
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send reclamation status notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;
