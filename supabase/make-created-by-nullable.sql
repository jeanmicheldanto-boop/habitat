-- Script pour rendre created_by nullable dans la table propositions
-- Nécessaire pour permettre les propositions des utilisateurs non-authentifiés

-- 1. Vérifier l'état actuel
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'propositions'
AND column_name = 'created_by';

-- 2. Rendre created_by nullable
ALTER TABLE propositions 
ALTER COLUMN created_by DROP NOT NULL;

-- 3. Vérifier le changement
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'propositions'
AND column_name = 'created_by';
