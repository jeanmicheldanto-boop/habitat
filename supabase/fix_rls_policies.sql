-- Correction des politiques RLS pour permettre la lecture publique des établissements

-- 1. Vérifier la structure de la table etablissements
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'etablissements' 
ORDER BY ordinal_position;

-- 2. Vérifier l'état actuel du RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'etablissements';

-- 3. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Etablissements publics" ON etablissements;
DROP POLICY IF EXISTS "Public read access" ON etablissements;
DROP POLICY IF EXISTS "Everyone can view published establishments" ON etablissements;
DROP POLICY IF EXISTS "Public can read published establishments" ON etablissements;
DROP POLICY IF EXISTS "Public can read all establishments" ON etablissements;

-- 4. Créer une politique de lecture publique pour les établissements publiés
CREATE POLICY "Public can read published establishments" ON etablissements
    FOR SELECT USING (statut_editorial = 'publie');

-- 5. Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'etablissements';

-- 6. Test de la requête
SELECT count(*) as total_etablissements FROM etablissements;
SELECT count(*) as etablissements_publies FROM etablissements WHERE statut_editorial = 'publie';
SELECT nom, commune, statut_editorial FROM etablissements LIMIT 5;