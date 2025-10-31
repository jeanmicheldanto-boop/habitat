-- Ajouter les clés étrangères manquantes sur la table propositions
-- pour permettre les JOINs Supabase automatiques

-- 1. Clé étrangère pour created_by -> profiles
ALTER TABLE public.propositions
ADD CONSTRAINT propositions_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- 2. Clé étrangère pour reviewed_by -> profiles  
ALTER TABLE public.propositions
ADD CONSTRAINT propositions_reviewed_by_fkey
FOREIGN KEY (reviewed_by)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Vérifier les contraintes ajoutées
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  a.attname AS column_name,
  af.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid = 'public.propositions'::regclass
  AND c.contype = 'f'
ORDER BY conname;
