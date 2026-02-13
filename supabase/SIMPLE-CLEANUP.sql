-- Supprimer simplement la policy DEBUG
DROP POLICY IF EXISTS "DEBUG allow all medias insert" ON medias;

SELECT 'Policy DEBUG supprimée' as resultat;
