-- ========================================
-- CORRECTION DES FONCTIONS DE NOTIFICATION
-- Ajouter les headers d'autorisation pour appeler l'Edge Function
-- ========================================

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
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Récupérer l'email et le nom du créateur
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.created_by;

  -- Si pas d'email ou pas de created_by, on ne peut pas envoyer de notification
  IF user_email IS NULL OR NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  -- URL de la fonction edge
  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDExMjQ2MiwiZXhwIjoyMDQ1Njg4NDYyfQ.hE_w8kN52g1HKgV3TzBrZr0Y56wv5J_AoGrAiNrXCNo';

  -- Appeler la fonction edge de manière asynchrone avec les headers
  BEGIN
    PERFORM net.http_post(
      url := function_url,
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(NEW.nom, 'Nouvel établissement'),
        'type', 'etablissement_created',
        'etablissement_id', NEW.id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      )
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
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Ne rien faire si c'est juste une mise à jour de updated_at
  IF OLD.nom = NEW.nom 
     AND OLD.adresse_l1 = NEW.adresse_l1 
     AND OLD.code_postal = NEW.code_postal
     AND OLD.commune = NEW.commune THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'email du propriétaire
  SELECT email, COALESCE(prenom, ''), COALESCE(nom, '')
  INTO user_email, user_prenom, user_nom
  FROM profiles
  WHERE id = NEW.created_by;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  service_role_key := current_setting('app.settings.service_role_key', true);

  BEGIN
    PERFORM net.http_post(
      url := function_url,
      body := jsonb_build_object(
        'email', user_email,
        'name', TRIM(user_prenom || ' ' || user_nom),
        'etablissement', COALESCE(NEW.nom, 'Établissement'),
        'type', 'etablissement_updated',
        'etablissement_id', NEW.id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      )
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
  function_url TEXT;
  service_role_key TEXT;
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

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDExMjQ2MiwiZXhwIjoyMDQ1Njg4NDYyfQ.hE_w8kN52g1HKgV3TzBrZr0Y56wv5J_AoGrAiNrXCNo';

  BEGIN
    PERFORM net.http_post(
      url := function_url,
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
        'Authorization', 'Bearer ' || service_role_key
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
  function_url TEXT;
  service_role_key TEXT;
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

  function_url := 'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/send-notification';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDExMjQ2MiwiZXhwIjoyMDQ1Njg4NDYyfQ.hE_w8kN52g1HKgV3TzBrZr0Y56wv5J_AoGrAiNrXCNo';

  BEGIN
    PERFORM net.http_post(
      url := function_url,
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
        'Authorization', 'Bearer ' || service_role_key
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to send reclamation status notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 5. Vérifier que l'extension pg_net est activée
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Note: Les fonctions utilisent directement le service_role_key
-- C'est sécurisé car les fonctions sont SECURITY DEFINER
