-- Corriger l'établissement "Maisons - CetteFamille"
-- La commune "Maisons" est une erreur
-- Il existe déjà "Maison seniors de Brissy-Hamégicourt" à 02240
-- Donc c'est un doublon à supprimer

-- 0. Désactiver temporairement la contrainte de publication
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 1. Supprimer le doublon
DELETE FROM etablissements
WHERE id = 'cee9458e-9766-4b28-b71b-a255684ecd25';

-- 2. Réactiver la contrainte de publication
ALTER TABLE etablissements ADD CONSTRAINT etablissements_publish_check 
  CHECK ((statut_editorial <> 'publie'::public.statut_editorial) OR public.can_publish(id)) NOT VALID;

-- 3. Vérifier qu'il a bien été supprimé
SELECT COUNT(*) as compte
FROM etablissements
WHERE id = 'cee9458e-9766-4b28-b71b-a255684ecd25';

-- Devrait retourner 0
