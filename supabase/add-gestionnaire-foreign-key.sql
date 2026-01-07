-- ========================================
-- AJOUTER UNE FOREIGN KEY SUR etablissements.gestionnaire
-- Pour permettre la jointure avec profiles
-- ========================================

-- 1. Vérifier le type actuel du champ gestionnaire
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'etablissements'
  AND column_name = 'gestionnaire';

-- 2. Vérifier combien d'établissements ont un gestionnaire
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT gestionnaire) as gestionnaires_uniques,
  COUNT(*) FILTER (WHERE gestionnaire IS NOT NULL) as avec_gestionnaire
FROM etablissements;

-- 3. Vérifier que tous les gestionnaires existants sont des UUIDs valides
SELECT 
  gestionnaire,
  gestionnaire::uuid as uuid_valide,
  COUNT(*) as nb_etablissements
FROM etablissements
WHERE gestionnaire IS NOT NULL
GROUP BY gestionnaire;

-- 4. OPTION A : Convertir le champ en UUID (recommandé)
-- ⚠️ Attention : ceci va échouer si des données non-UUID existent

-- Étape 1 : Créer une nouvelle colonne temporaire de type UUID
ALTER TABLE etablissements 
ADD COLUMN gestionnaire_uuid UUID;

-- Étape 2 : Copier les données en convertissant
UPDATE etablissements 
SET gestionnaire_uuid = gestionnaire::uuid 
WHERE gestionnaire IS NOT NULL;

-- Étape 3 : Supprimer l'ancienne colonne
ALTER TABLE etablissements 
DROP COLUMN gestionnaire;

-- Étape 4 : Renommer la nouvelle colonne
ALTER TABLE etablissements 
RENAME COLUMN gestionnaire_uuid TO gestionnaire;

-- Étape 5 : Ajouter la foreign key
ALTER TABLE etablissements
ADD CONSTRAINT etablissements_gestionnaire_fkey
FOREIGN KEY (gestionnaire)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Étape 6 : Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_etablissements_gestionnaire 
ON etablissements(gestionnaire);

-- 5. OPTION B : Garder TEXT mais créer une fonction pour la jointure
-- (moins recommandé, mais si la conversion UUID n'est pas possible)

CREATE OR REPLACE VIEW etablissements_avec_gestionnaire AS
SELECT 
  e.*,
  p.organisation as gestionnaire_organisation,
  p.nom as gestionnaire_nom,
  p.prenom as gestionnaire_prenom,
  p.email as gestionnaire_email
FROM etablissements e
LEFT JOIN profiles p ON e.gestionnaire::uuid = p.id;

-- 6. Vérifier que la foreign key fonctionne
SELECT 
  e.id,
  e.nom,
  e.gestionnaire,
  p.organisation,
  p.nom as gestionnaire_nom,
  p.prenom as gestionnaire_prenom
FROM etablissements e
LEFT JOIN profiles p ON e.gestionnaire = p.id
WHERE e.gestionnaire IS NOT NULL
LIMIT 5;
