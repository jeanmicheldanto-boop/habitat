-- Vérifier s'il existe déjà un établissement CetteFamille à Brissy-Hamégicourt

SELECT 
  id,
  nom,
  code_postal,
  commune,
  departement,
  statut_editorial
FROM etablissements
WHERE commune ILIKE '%Brissy%'
   OR nom ILIKE '%CetteFamille%'
   OR (code_postal = '02240' AND departement = 'Aisne (02)');
