-- CLEANUP FINAL: Supprimer la policy DEBUG temporaire

-- 1. Supprimer la policy DEBUG
DROP POLICY IF EXISTS "DEBUG allow all medias insert" ON medias;

-- 2. Vérifier les policies finales sur medias
SELECT 
  cmd as operation,
  COUNT(*) as count,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'medias'
GROUP BY cmd
ORDER BY cmd;

SELECT 
  cmd as operation,
  policyname
FROM pg_policies
WHERE tablename = 'medias'
AND policyname LIKE '%roprietaire%'
ORDER BY cmd, policyname;

SELECT 'Cleanup terminé - Policy DEBUG supprimée' as resultat;
-- ==============================================
-- OSSUN : Prévisualiser et préparer suppression
-- ==============================================

-- 1) Prévisualiser les établissements à Ossun
SELECT id, nom, adresse_l1, code_postal, commune, gestionnaire, created_at
FROM etablissements
WHERE commune ILIKE '%Ossun%';

-- 2) Lister les tables qui ont une colonne `etablissement_id`
SELECT table_schema, table_name
FROM information_schema.columns
WHERE column_name = 'etablissement_id'
  AND table_schema NOT IN ('pg_catalog','information_schema')
ORDER BY table_schema, table_name;

-- 3) Générer des DELETE statements (prévisualisation)
SELECT format(
  'DELETE FROM %I.%I WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE %L);',
  table_schema, table_name, '%Ossun%'
) AS stmt
FROM information_schema.columns
WHERE column_name = 'etablissement_id'
  AND table_schema NOT IN ('pg_catalog','information_schema')
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name;

-- 4) Exemples explicites (Vérifiez les tables listées ci‑dessus avant exécution)
-- DELETE FROM etablissement_proprietaires WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE '%Ossun%');
-- DELETE FROM propositions WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE '%Ossun%');
-- DELETE FROM reclamations WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE '%Ossun%');
-- DELETE FROM medias WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE '%Ossun%');
-- DELETE FROM logements WHERE etablissement_id IN (SELECT id FROM etablissements WHERE commune ILIKE '%Ossun%');

-- 5) Suppression finale des établissements (décommentez pour exécution)
-- BEGIN;
-- DELETE FROM etablissements WHERE commune ILIKE '%Ossun%';
-- COMMIT;

-- Safety notes:
--  - Faites un dump complet de la base avant d'exécuter les DELETEs.
--  - Exécutez d'abord les requêtes de prévisualisation ci‑dessus.
--  - Préférez un run sur un staging si disponible.
