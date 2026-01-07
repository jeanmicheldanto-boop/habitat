-- ========================================
-- NORMALISATION DES DÉPARTEMENTS
-- ========================================
-- Ce script normalise tous les départements au format "Nom (code)"

-- 0. Désactiver temporairement la contrainte de publication
ALTER TABLE etablissements DROP CONSTRAINT IF EXISTS etablissements_publish_check;

-- 1. Normaliser tous les départements au format "Nom (code)"
UPDATE etablissements
SET departement = CASE LEFT(code_postal, 2)
  WHEN '01' THEN 'Ain (01)'
  WHEN '02' THEN 'Aisne (02)'
  WHEN '03' THEN 'Allier (03)'
  WHEN '04' THEN 'Alpes-de-Haute-Provence (04)'
  WHEN '05' THEN 'Hautes-Alpes (05)'
  WHEN '06' THEN 'Alpes-Maritimes (06)'
  WHEN '07' THEN 'Ardèche (07)'
  WHEN '08' THEN 'Ardennes (08)'
  WHEN '09' THEN 'Ariège (09)'
  WHEN '10' THEN 'Aube (10)'
  WHEN '11' THEN 'Aude (11)'
  WHEN '12' THEN 'Aveyron (12)'
  WHEN '13' THEN 'Bouches-du-Rhône (13)'
  WHEN '14' THEN 'Calvados (14)'
  WHEN '15' THEN 'Cantal (15)'
  WHEN '16' THEN 'Charente (16)'
  WHEN '17' THEN 'Charente-Maritime (17)'
  WHEN '18' THEN 'Cher (18)'
  WHEN '19' THEN 'Corrèze (19)'
  WHEN '21' THEN 'Côte-d''Or (21)'
  WHEN '22' THEN 'Côtes-d''Armor (22)'
  WHEN '23' THEN 'Creuse (23)'
  WHEN '24' THEN 'Dordogne (24)'
  WHEN '25' THEN 'Doubs (25)'
  WHEN '26' THEN 'Drôme (26)'
  WHEN '27' THEN 'Eure (27)'
  WHEN '28' THEN 'Eure-et-Loir (28)'
  WHEN '29' THEN 'Finistère (29)'
  WHEN '30' THEN 'Gard (30)'
  WHEN '31' THEN 'Haute-Garonne (31)'
  WHEN '32' THEN 'Gers (32)'
  WHEN '33' THEN 'Gironde (33)'
  WHEN '34' THEN 'Hérault (34)'
  WHEN '35' THEN 'Ille-et-Vilaine (35)'
  WHEN '36' THEN 'Indre (36)'
  WHEN '37' THEN 'Indre-et-Loire (37)'
  WHEN '38' THEN 'Isère (38)'
  WHEN '39' THEN 'Jura (39)'
  WHEN '40' THEN 'Landes (40)'
  WHEN '41' THEN 'Loir-et-Cher (41)'
  WHEN '42' THEN 'Loire (42)'
  WHEN '43' THEN 'Haute-Loire (43)'
  WHEN '44' THEN 'Loire-Atlantique (44)'
  WHEN '45' THEN 'Loiret (45)'
  WHEN '46' THEN 'Lot (46)'
  WHEN '47' THEN 'Lot-et-Garonne (47)'
  WHEN '48' THEN 'Lozère (48)'
  WHEN '49' THEN 'Maine-et-Loire (49)'
  WHEN '50' THEN 'Manche (50)'
  WHEN '51' THEN 'Marne (51)'
  WHEN '52' THEN 'Haute-Marne (52)'
  WHEN '53' THEN 'Mayenne (53)'
  WHEN '54' THEN 'Meurthe-et-Moselle (54)'
  WHEN '55' THEN 'Meuse (55)'
  WHEN '56' THEN 'Morbihan (56)'
  WHEN '57' THEN 'Moselle (57)'
  WHEN '58' THEN 'Nièvre (58)'
  WHEN '59' THEN 'Nord (59)'
  WHEN '60' THEN 'Oise (60)'
  WHEN '61' THEN 'Orne (61)'
  WHEN '62' THEN 'Pas-de-Calais (62)'
  WHEN '63' THEN 'Puy-de-Dôme (63)'
  WHEN '64' THEN 'Pyrénées-Atlantiques (64)'
  WHEN '65' THEN 'Hautes-Pyrénées (65)'
  WHEN '66' THEN 'Pyrénées-Orientales (66)'
  WHEN '67' THEN 'Bas-Rhin (67)'
  WHEN '68' THEN 'Haut-Rhin (68)'
  WHEN '69' THEN 'Rhône (69)'
  WHEN '70' THEN 'Haute-Saône (70)'
  WHEN '71' THEN 'Saône-et-Loire (71)'
  WHEN '72' THEN 'Sarthe (72)'
  WHEN '73' THEN 'Savoie (73)'
  WHEN '74' THEN 'Haute-Savoie (74)'
  WHEN '75' THEN 'Paris (75)'
  WHEN '76' THEN 'Seine-Maritime (76)'
  WHEN '77' THEN 'Seine-et-Marne (77)'
  WHEN '78' THEN 'Yvelines (78)'
  WHEN '79' THEN 'Deux-Sèvres (79)'
  WHEN '80' THEN 'Somme (80)'
  WHEN '81' THEN 'Tarn (81)'
  WHEN '82' THEN 'Tarn-et-Garonne (82)'
  WHEN '83' THEN 'Var (83)'
  WHEN '84' THEN 'Vaucluse (84)'
  WHEN '85' THEN 'Vendée (85)'
  WHEN '86' THEN 'Vienne (86)'
  WHEN '87' THEN 'Haute-Vienne (87)'
  WHEN '88' THEN 'Vosges (88)'
  WHEN '89' THEN 'Yonne (89)'
  WHEN '90' THEN 'Territoire de Belfort (90)'
  WHEN '91' THEN 'Essonne (91)'
  WHEN '92' THEN 'Hauts-de-Seine (92)'
  WHEN '93' THEN 'Seine-Saint-Denis (93)'
  WHEN '94' THEN 'Val-de-Marne (94)'
  WHEN '95' THEN 'Val-d''Oise (95)'
END
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) >= 2
  AND LEFT(code_postal, 2) IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95');

-- 1b. Traiter les DOM-TOM séparément
UPDATE etablissements
SET departement = CASE LEFT(code_postal, 3)
  WHEN '971' THEN 'Guadeloupe (971)'
  WHEN '972' THEN 'Martinique (972)'
  WHEN '973' THEN 'Guyane (973)'
  WHEN '974' THEN 'La Réunion (974)'
  WHEN '976' THEN 'Mayotte (976)'
END
WHERE code_postal IS NOT NULL 
  AND LEFT(code_postal, 2) = '97'
  AND LEFT(code_postal, 3) IN ('971','972','973','974','976');

-- 2. Réactiver la contrainte de publication
ALTER TABLE etablissements ADD CONSTRAINT etablissements_publish_check 
  CHECK ((statut_editorial <> 'publie'::public.statut_editorial) OR public.can_publish(id)) NOT VALID;

-- 3. Vérification finale - compter par département
SELECT 
  departement,
  COUNT(*) as nombre
FROM etablissements
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement;

-- 4. Vérifier qu'il n'y a plus de codes seuls ou de "Département (XX)"
SELECT 
  'Départements mal formatés' as info,
  COUNT(*) as nombre
FROM etablissements
WHERE departement ~ '^\d+$' 
   OR departement LIKE 'Département (%';
