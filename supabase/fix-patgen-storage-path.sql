-- ====================================================================
-- FIX RAPIDE : Corriger le storage_path de Patgen dans la table medias
-- ====================================================================
-- Problème : storage_path = "a1a02ce0.../main.jpg" sans le préfixe "etablissements/"
-- Solution : Ajouter le préfixe pour que les vues retournent le bon chemin

UPDATE medias
SET storage_path = 'etablissements/' || storage_path
WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7'
  AND storage_path NOT LIKE 'etablissements/%';

-- Vérification
SELECT 
  etablissement_id,
  storage_path,
  priority,
  created_at
FROM medias
WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
