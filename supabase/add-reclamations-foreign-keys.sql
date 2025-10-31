-- Ajouter les clés étrangères manquantes sur la table reclamations_propriete
-- pour permettre les JOINs Supabase automatiques

-- Clé étrangère pour user_id -> profiles (créateur de la réclamation)
ALTER TABLE public.reclamations_propriete
ADD CONSTRAINT reclamations_propriete_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Note: created_by n'existe pas dans reclamations_propriete, 
-- c'est user_id qui remplit ce rôle

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
WHERE c.conrelid = 'public.reclamations_propriete'::regclass
  AND c.contype = 'f'
ORDER BY conname;
