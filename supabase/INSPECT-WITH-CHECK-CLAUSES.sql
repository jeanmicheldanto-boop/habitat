-- 1. RÉACTIVER LES RLS
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;

-- 2. Voir le contenu EXACT des WITH CHECK pour chaque policy INSERT
SELECT 
  n.nspname as schema,
  c.relname as table_name,
  pol.polname as policy_name,
  pol.polpermissive as is_permissive,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command,
  CASE 
    WHEN pol.polroles = '{0}' THEN 'PUBLIC'
    ELSE pg_catalog.array_to_string(
      ARRAY(
        SELECT rolname 
        FROM pg_catalog.pg_roles 
        WHERE oid = ANY(pol.polroles)
      ), ', '
    )
  END as roles,
  pg_catalog.pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_catalog.pg_policy pol
JOIN pg_catalog.pg_class c ON c.oid = pol.polrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'medias'
AND pol.polcmd = 'a' -- INSERT only
ORDER BY pol.polname;
