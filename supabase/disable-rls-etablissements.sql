-- ========================================
-- DÉSACTIVER TEMPORAIREMENT RLS SUR ETABLISSEMENTS
-- ========================================

-- Désactiver RLS (TEMPORAIRE pour déboguer)
ALTER TABLE etablissements DISABLE ROW LEVEL SECURITY;

-- Vérifier
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'etablissements';
