-- ========================================
-- SUPPRIMER LE COMPTE patrick.genevaux@gmail.com
-- ========================================

-- ID du compte: efa4214e-42e2-46df-ae94-c75c678cf97e

-- 1. Vérifier les dépendances
SELECT 'Réclamations:' as type, COUNT(*) as count
FROM reclamations_propriete
WHERE user_id = 'efa4214e-42e2-46df-ae94-c75c678cf97e'
UNION ALL
SELECT 'Relations propriétaire:', COUNT(*)
FROM etablissement_proprietaires
WHERE user_id = 'efa4214e-42e2-46df-ae94-c75c678cf97e';

-- 2. Supprimer les dépendances
DELETE FROM etablissement_proprietaires
WHERE user_id = 'efa4214e-42e2-46df-ae94-c75c678cf97e';

DELETE FROM reclamations_propriete
WHERE user_id = 'efa4214e-42e2-46df-ae94-c75c678cf97e';

-- 3. Supprimer le profil
DELETE FROM profiles
WHERE id = 'efa4214e-42e2-46df-ae94-c75c678cf97e';

-- 4. Supprimer l'utilisateur de auth.users
DELETE FROM auth.users
WHERE id = 'efa4214e-42e2-46df-ae94-c75c678cf97e';

-- 5. Vérifier que tout est supprimé
SELECT 'Compte supprimé' as status;
