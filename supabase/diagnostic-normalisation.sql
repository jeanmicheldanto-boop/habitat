-- Script de diagnostic pour comprendre pourquoi la normalisation n'a pas fonctionné

-- 1. Vérifier les départements actuels
SELECT 
  departement,
  COUNT(*) as nombre,
  MIN(code_postal) as exemple_code_postal
FROM etablissements
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement
LIMIT 30;

-- 2. Vérifier la structure : est-ce que code_postal existe et a des valeurs ?
SELECT 
  COUNT(*) as total,
  COUNT(code_postal) as avec_code_postal,
  COUNT(CASE WHEN LENGTH(code_postal) >= 2 THEN 1 END) as code_postal_valide
FROM etablissements;

-- 3. Tester la condition WHERE du script de normalisation
SELECT 
  COUNT(*) as lignes_matchees
FROM etablissements
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) >= 2;

-- 4. Tester l'expression CASE pour quelques exemples
SELECT 
  code_postal,
  departement as departement_actuel,
  LEFT(code_postal, 2) as premier_deux_chars,
  CASE LEFT(code_postal, 2)
    WHEN '01' THEN 'Ain (01)'
    WHEN '02' THEN 'Aisne (02)'
    WHEN '54' THEN 'Meurthe-et-Moselle (54)'
    ELSE 'PAS DE MATCH'
  END as departement_calcule
FROM etablissements
WHERE departement IN ('01', '02', '54', 'Aisne (02)', 'Meurthe-et-Moselle (54)', 'Département (54)')
LIMIT 20;
