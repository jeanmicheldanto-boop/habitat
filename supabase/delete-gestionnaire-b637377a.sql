-- ========================================
-- SUPPRESSION DU COMPTE GESTIONNAIRE
-- ID: b637377a-4938-4a71-8df8-fc2e6bfeb0e9
-- Email: jeanmichel.danto@gmail.com
-- ========================================

-- 1. Vérifier les dépendances
SELECT 'Réclamations:' as type, COUNT(*) as count
FROM reclamations_propriete
WHERE user_id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9'
UNION ALL
SELECT 'Relations propriétaire:', COUNT(*)
FROM etablissement_proprietaires
WHERE user_id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9';

-- 2. Supprimer les dépendances
-- Supprimer les relations propriétaire
DELETE FROM etablissement_proprietaires
WHERE user_id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9';

-- Supprimer les réclamations
DELETE FROM reclamations_propriete
WHERE user_id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9';

-- 3. Supprimer le profil
DELETE FROM profiles
WHERE id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9';

-- 4. Supprimer l'utilisateur de auth.users
DELETE FROM auth.users
WHERE id = 'b637377a-4938-4a71-8df8-fc2e6bfeb0e9';

-- Vérification finale
SELECT 'Gestionnaire supprimé' as status;
