-- ====================================================================
-- MIGRATION : Ajout du support des images (Option C - Hybride)
-- ====================================================================
-- Phase 1 : Image principale via colonne image_path
-- Phase 2 : Images supplémentaires via table medias (déjà prête)

-- 1. Ajouter la colonne image_path dans etablissements
ALTER TABLE etablissements 
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 2. Ajouter un commentaire explicatif
COMMENT ON COLUMN etablissements.image_path IS 
'Chemin de la photo principale dans Supabase Storage (ex: etablissements/uuid/main.jpg). 
Pour les photos supplémentaires, utiliser la table medias avec etablissement_id.';

-- 3. Créer un index pour optimiser les requêtes avec images
CREATE INDEX IF NOT EXISTS idx_etablissements_image_path 
ON etablissements(image_path) 
WHERE image_path IS NOT NULL;

-- 4. Vérifier que la table medias est prête (déjà créée)
-- Structure de medias :
-- - id: uuid
-- - etablissement_id: uuid (FK vers etablissements)
-- - storage_path: text (chemin dans Storage)
-- - alt_text: text (description pour accessibilité)
-- - priority: integer (0 = plus haute priorité pour tri)
-- - licence: text (type de licence de l'image)
-- - credit: text (crédit/auteur)
-- - source_url: text (URL source originale)
-- - created_at: timestamp

-- 5. Afficher le résultat
SELECT 
  'etablissements' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'etablissements' 
  AND column_name = 'image_path';

-- 6. Compter les établissements qui auront besoin d'une image
SELECT 
  COUNT(*) as total_etablissements,
  COUNT(image_path) as avec_image,
  COUNT(*) - COUNT(image_path) as sans_image
FROM etablissements
WHERE statut_editorial = 'publie';

-- ====================================================================
-- NOTE : Les vues v_liste_publication et v_liste_publication_geoloc
-- utilisent déjà image_path via un LEFT JOIN sur medias.
-- On va maintenant utiliser COALESCE pour privilégier etablissements.image_path
-- ====================================================================
