-- ========================================
-- AVANT L'IMPORT STREAMLIT
-- ========================================
-- Exécuter ce script pour désactiver les triggers de notification

-- Désactiver le trigger de création
ALTER TABLE etablissements DISABLE TRIGGER etablissement_creation_notification;

-- Désactiver le trigger de modification
ALTER TABLE etablissements DISABLE TRIGGER etablissement_update_notification;

-- Vérifier que les triggers sont bien désactivés
SELECT 
  tgname AS trigger_name,
  tgenabled AS status,
  CASE 
    WHEN tgenabled = 'D' THEN '❌ DÉSACTIVÉ'
    WHEN tgenabled = 'O' THEN '✅ ACTIVÉ'
    ELSE 'Autre'
  END AS etat
FROM pg_trigger 
WHERE tgrelid = 'etablissements'::regclass
  AND tgname LIKE '%notification%';

-- Vous pouvez maintenant faire votre import Streamlit
