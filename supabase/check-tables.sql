    -- Vérifier quelles tables de propositions existent

-- 1. Lister toutes les tables liées aux propositions
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%proposition%'
ORDER BY table_name;

-- 2. Si propositions existe, voir sa structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'propositions'
ORDER BY ordinal_position;

-- 3. Si propositions_corrections existe, voir sa structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'propositions_corrections'
ORDER BY ordinal_position;
