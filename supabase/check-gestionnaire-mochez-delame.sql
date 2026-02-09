-- ====================================================================
-- VÉRIFIER L'ÉTAT DU GESTIONNAIRE POUR MAISON MOCHEZ ET DELAME
-- ====================================================================

-- Maison Mochez
SELECT 
  id,
  nom,
  gestionnaire,
  presentation
FROM etablissements 
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba'
LIMIT 1;

-- Maison Delame
SELECT 
  id,
  nom,
  gestionnaire,
  presentation
FROM etablissements 
WHERE id = 'e55d42b0-d0fd-4975-8ff5-674beaf34785'
LIMIT 1;
