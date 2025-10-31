-- Insertion des données de référence pour les catégories, sous-catégories et services
-- Ce script doit être exécuté après la création des tables

-- =======================
-- 1. CATÉGORIES D'HABITAT
-- =======================

INSERT INTO public.categories (libelle) VALUES
  ('Résidence'),
  ('Habitat partagé'),
  ('Logement indépendant')
ON CONFLICT DO NOTHING;

-- =======================
-- 2. SOUS-CATÉGORIES
-- =======================

-- Récupérer les IDs des catégories pour les foreign keys
DO $$
DECLARE
  cat_residence_id UUID;
  cat_partage_id UUID;
  cat_independant_id UUID;
BEGIN
  SELECT id INTO cat_residence_id FROM public.categories WHERE libelle = 'Résidence';
  SELECT id INTO cat_partage_id FROM public.categories WHERE libelle = 'Habitat partagé';
  SELECT id INTO cat_independant_id FROM public.categories WHERE libelle = 'Logement indépendant';

  -- Sous-catégories pour RÉSIDENCE
  INSERT INTO public.sous_categories (categorie_id, libelle, alias) VALUES
    (cat_residence_id, 'Résidence autonomie', 'ra'),
    (cat_residence_id, 'Résidence services seniors', 'résidence services'),
    (cat_residence_id, 'MARPA', 'marpa')
  ON CONFLICT DO NOTHING;

  -- Sous-catégories pour HABITAT PARTAGÉ
  INSERT INTO public.sous_categories (categorie_id, libelle, alias) VALUES
    (cat_partage_id, 'Colocation avec services', 'colocation'),
    (cat_partage_id, 'Habitat intergénérationnel', 'intergénérationnel'),
    (cat_partage_id, 'Habitat inclusif', 'inclusif'),
    (cat_partage_id, 'Habitat alternatif', 'alternatif'),
    (cat_partage_id, 'Accueil familial', 'accueil'),
    (cat_partage_id, 'Maison d''accueil familial', 'maf')
  ON CONFLICT DO NOTHING;

  -- Sous-catégories pour LOGEMENT INDÉPENDANT
  INSERT INTO public.sous_categories (categorie_id, libelle, alias) VALUES
    (cat_independant_id, 'Béguinage', 'béguinage'),
    (cat_independant_id, 'Village seniors', 'village'),
    (cat_independant_id, 'Logement adapté', 'adapte'),
    (cat_independant_id, 'Habitat regroupé', 'regroupé')
  ON CONFLICT DO NOTHING;
END $$;

-- =======================
-- 3. SERVICES
-- =======================

INSERT INTO public.services (libelle) VALUES
  -- Services de santé et soins
  ('Aide à domicile'),
  ('Infirmier(e) sur place'),
  ('Médecin coordonnateur'),
  ('Kinésithérapeute'),
  ('Psychologue'),
  ('Podologue'),
  ('Coiffeur'),
  ('Pédicure'),
  
  -- Services d''assistance et accompagnement
  ('Aide aux démarches administratives'),
  ('Téléassistance / Téléalarme'),
  ('Permanence'),
  ('Gardien / Concierge'),
  ('Surveillance'),
  
  -- Services domestiques
  ('Ménage / Entretien du logement'),
  ('Blanchisserie / Pressing'),
  ('Pressing'),
  ('Linge de maison fourni'),
  
  -- Services de mobilité
  ('Transport accompagné'),
  ('Navette'),
  ('Proximité transports en commun'),
  
  -- Services numériques et communication
  ('Wifi'),
  ('Connexion internet'),
  ('Téléphone'),
  
  -- Services de loisirs et activités
  ('Animations'),
  ('Activités culturelles'),
  ('Activités sportives'),
  ('Bibliothèque'),
  ('Salon de lecture'),
  ('Salle de jeux'),
  ('Atelier'),
  
  -- Espaces et équipements communs
  ('Salle commune'),
  ('Jardin'),
  ('Terrasse'),
  ('Espace vert'),
  ('Parking'),
  ('Local vélo'),
  ('Ascenseur'),
  ('Espace fitness'),
  
  -- Services de restauration (complémentaires à la table restaurations)
  ('Cuisine équipée'),
  ('Kitchenette'),
  
  -- Services administratifs et pratiques
  ('Accueil visiteurs'),
  ('Bagagerie'),
  ('Coffre-fort'),
  
  -- Services spécifiques AVP / Habitat inclusif
  ('Coordinateur de projet'),
  ('Animation de la vie sociale'),
  ('Gouvernance partagée'),
  ('Ouverture sur le quartier')
ON CONFLICT DO NOTHING;

-- =======================
-- 4. VÉRIFICATION
-- =======================

-- Afficher un résumé des données insérées
SELECT 'CATEGORIES' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'SOUS_CATEGORIES', COUNT(*) FROM public.sous_categories
UNION ALL
SELECT 'SERVICES', COUNT(*) FROM public.services;

-- Afficher les détails
SELECT 'Liste des catégories:' as info;
SELECT * FROM public.categories;

SELECT 'Liste des sous-catégories par catégorie:' as info;
SELECT c.libelle as categorie, sc.libelle as sous_categorie, sc.alias
FROM public.sous_categories sc
JOIN public.categories c ON c.id = sc.categorie_id
ORDER BY c.libelle, sc.libelle;

SELECT 'Liste des services:' as info;
SELECT libelle FROM public.services ORDER BY libelle;
