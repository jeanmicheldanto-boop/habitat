-- Table pour stocker les propositions de modifications complètes d'établissements
-- Cette table remplace/complète la table suggestions_corrections pour des modifications structurées

-- Extension nécessaire pour les types JSON
-- (si pas déjà activée)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer la table si elle existe (pour recréer avec la nouvelle structure)
DROP TABLE IF EXISTS public.propositions CASCADE;

-- Créer la table propositions
CREATE TABLE public.propositions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
    
    -- Informations du proposeur
    nom_proposeur text NOT NULL,
    email_proposeur text NOT NULL,
    telephone_proposeur text,
    
    -- Informations sur la proposition
    description text,
    type_cible text NOT NULL CHECK (type_cible IN ('etablissement')),
    
    -- Données proposées (JSON contenant toutes les modifications)
    donnees_proposees jsonb NOT NULL,
    
    -- Statut de la proposition
    statut public.proposition_statut DEFAULT 'en_attente'::public.proposition_statut,
    
    -- Commentaires de modération
    commentaires_moderateur text,
    moderateur_id uuid, -- Référence vers un utilisateur admin si vous en avez
    
    -- Dates
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date_moderation timestamp with time zone
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_propositions_etablissement_id ON public.propositions(etablissement_id);
CREATE INDEX idx_propositions_statut ON public.propositions(statut);
CREATE INDEX idx_propositions_created_at ON public.propositions(created_at DESC);
CREATE INDEX idx_propositions_email ON public.propositions(email_proposeur);

-- RLS Policies
ALTER TABLE public.propositions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs anonymes peuvent créer des propositions
CREATE POLICY "Tous peuvent créer des propositions" ON public.propositions
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Politique : Seuls les admins peuvent lire toutes les propositions
CREATE POLICY "Seuls les admins peuvent lire les propositions" ON public.propositions
    FOR SELECT 
    TO authenticated
    USING (
        -- À adapter selon votre système d'auth
        -- auth.jwt() ->> 'role' = 'admin' 
        true -- Pour l'instant, tous les utilisateurs authentifiés
    );

-- Politique : Seuls les admins peuvent modifier le statut et commentaires
CREATE POLICY "Seuls les admins peuvent modifier les propositions" ON public.propositions
    FOR UPDATE 
    TO authenticated
    USING (
        -- À adapter selon votre système d'auth
        -- auth.jwt() ->> 'role' = 'admin'
        true -- Pour l'instant, tous les utilisateurs authentifiés
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_propositions_updated_at 
    BEFORE UPDATE ON public.propositions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vue pour faciliter la consultation des propositions avec les informations d'établissement
CREATE OR REPLACE VIEW public.v_propositions_etablissements AS
SELECT 
    p.*,
    e.nom as nom_etablissement,
    e.commune,
    e.departement,
    e.statut_editorial
FROM public.propositions p
JOIN public.etablissements e ON p.etablissement_id = e.id
ORDER BY p.created_at DESC;

-- Commentaires sur la table
COMMENT ON TABLE public.propositions IS 'Propositions de modifications complètes pour les établissements, soumises par les utilisateurs et passant par modération';
COMMENT ON COLUMN public.propositions.donnees_proposees IS 'Structure JSON complète contenant toutes les modifications proposées (contact, adresse, logements, services, tarifs, etc.)';
COMMENT ON COLUMN public.propositions.type_cible IS 'Type d''entité concernée par la modification (actuellement seulement etablissement)';
COMMENT ON COLUMN public.propositions.statut IS 'Statut de la proposition: en_attente, approuvee, partielle, rejetee, retiree';

-- Exemple de structure JSON pour donnees_proposees:
/*
{
  "telephone": "01 23 45 67 89",
  "email": "contact@exemple.fr",
  "site_web": "https://exemple.fr",
  "adresse_l1": "123 rue de la Paix",
  "adresse_l2": "",
  "code_postal": "75001",
  "commune": "Paris",
  "departement": "Paris",
  "habitat_type": "residence",
  "sous_categories": ["uuid1", "uuid2"],
  "logements_types": [
    {
      "libelle": "Studio",
      "surface_min": 20,
      "surface_max": 25,
      "meuble": true,
      "pmr": false,
      "domotique": false,
      "plain_pied": true,
      "nb_unites": 10
    }
  ],
  "restauration": {
    "kitchenette": true,
    "resto_collectif_midi": false,
    "resto_collectif": false,
    "portage_repas": true
  },
  "services": ["uuid3", "uuid4", "uuid5"],
  "tarifications": [
    {
      "periode": "mensuel",
      "fourchette_prix": "deux_euros",
      "prix_min": 800,
      "prix_max": 1200,
      "loyer_base": 900,
      "charges": 150
    }
  ]
}
*/