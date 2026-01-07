-- ========================================
-- APRÈS L'IMPORT STREAMLIT
-- ========================================
-- Exécuter ce script pour réactiver les triggers de notification

-- Réactiver le trigger de création
ALTER TABLE etablissements ENABLE TRIGGER etablissement_creation_notification;

-- Réactiver le trigger de modification
ALTER TABLE etablissements ENABLE TRIGGER etablissement_update_notification;

-- Vérifier que les triggers sont bien réactivés
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

-- Les notifications par email sont maintenant réactivées
