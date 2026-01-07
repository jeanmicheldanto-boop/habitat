-- ========================================
-- PRÉVENTION : Fonction pour normaliser les codes postaux
-- ========================================
-- Cette fonction s'assure que les codes postaux ont toujours 5 chiffres

CREATE OR REPLACE FUNCTION normalize_code_postal()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le code postal existe et n'est pas vide
  IF NEW.code_postal IS NOT NULL AND TRIM(NEW.code_postal) != '' THEN
    -- Retirer tous les espaces
    NEW.code_postal := TRIM(NEW.code_postal);
    
    -- Si le code postal a 4 chiffres, ajouter un 0 devant
    IF LENGTH(NEW.code_postal) = 4 AND NEW.code_postal ~ '^\d{4}$' THEN
      NEW.code_postal := '0' || NEW.code_postal;
    END IF;
    
    -- Déduire le département du code postal si pas déjà défini
    IF (NEW.departement IS NULL OR TRIM(NEW.departement) = '') AND LENGTH(NEW.code_postal) = 5 THEN
      NEW.departement := LEFT(NEW.code_postal, 2);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour normaliser les codes postaux AVANT insertion/mise à jour
DROP TRIGGER IF EXISTS normalize_code_postal_trigger ON etablissements;

CREATE TRIGGER normalize_code_postal_trigger
BEFORE INSERT OR UPDATE ON etablissements
FOR EACH ROW
EXECUTE FUNCTION normalize_code_postal();

-- Permissions
GRANT ALL ON FUNCTION normalize_code_postal() TO postgres, service_role;

COMMENT ON FUNCTION normalize_code_postal() IS 'Normalise automatiquement les codes postaux à 5 chiffres et déduit le département';

-- Vérifier que le trigger est créé
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  tgrelid::regclass AS table_name
FROM pg_trigger 
WHERE tgname = 'normalize_code_postal_trigger';
