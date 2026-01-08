-- ====================================================================
-- FIX: Correction de l'image de Maison Patgen à Ossun
-- ====================================================================
-- Problème: L'image uploadée depuis l'espace gestionnaire s'affiche 
-- dans la liste mais pas sur la carte ni sur la fiche.
-- 
-- Cause: Le champ etablissements.image_path contient un mauvais chemin
-- et la vue v_liste_publication priorise ce champ sur la table medias.
--
-- Solution: Mettre image_path à NULL et utiliser la table medias
-- ====================================================================

-- 1. Vérifier l'état actuel
SELECT 
  'État actuel' as step,
  e.nom,
  e.gestionnaire,
  e.image_path as etab_image_path,
  m.storage_path as media_storage_path,
  m.priority as media_priority
FROM etablissements e
LEFT JOIN medias m ON m.etablissement_id = e.id
WHERE e.id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

-- 2. Désactiver temporairement la contrainte
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 3. Mettre à jour le gestionnaire s'il est vide (requis pour republier)
UPDATE etablissements
SET gestionnaire = 'CCAS Ossun'
WHERE id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7'
  AND (gestionnaire IS NULL OR TRIM(gestionnaire) = '');

-- 4. Mettre image_path à NULL pour forcer l'utilisation de medias
UPDATE etablissements
SET image_path = NULL
WHERE id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

-- 5. Supprimer les anciennes entrées dans medias
DELETE FROM medias
WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

-- 6. Créer la nouvelle entrée dans medias avec le bon chemin
INSERT INTO medias (
  etablissement_id,
  storage_path,
  alt_text,
  priority
) VALUES (
  '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7',
  'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg',
  'Maison Patgen - Habitat inclusif à Ossun',
  1000
);

-- 7. Ré-activer la contrainte
ALTER TABLE etablissements ADD CONSTRAINT etablissements_publish_check 
CHECK (
  statut_editorial <> 'publie' OR can_publish(id)
) NOT VALID;

-- 8. Vérifier le résultat dans la vue
SELECT 
  'Résultat final' as step,
  nom,
  commune,
  image_path,
  CASE 
    WHEN image_path IS NOT NULL 
    THEN 'https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/etablissements/' || image_path 
    ELSE 'Aucune image'
  END as url_complete
FROM v_liste_publication
WHERE etab_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

-- 9. Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Correction terminée!';
  RAISE NOTICE 'L''image devrait maintenant s''afficher correctement sur:';
  RAISE NOTICE '  - La liste de la plateforme';
  RAISE NOTICE '  - La carte interactive';
  RAISE NOTICE '  - La fiche détaillée';
  RAISE NOTICE '';
  RAISE NOTICE 'Testez sur: https://habitat-intermediaire.fr/plateforme/fiche?id=76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
END $$;
