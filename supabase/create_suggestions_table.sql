-- Création de la table pour les suggestions de corrections

CREATE TABLE suggestions_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
  nom_suggesteur VARCHAR(255) NOT NULL,
  email_suggesteur VARCHAR(255) NOT NULL,
  telephone_suggesteur VARCHAR(20),
  type_correction TEXT NOT NULL,
  description TEXT NOT NULL,
  valeur_actuelle TEXT,
  valeur_corrigee TEXT,
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'traitee', 'rejetee')),
  note_admin TEXT,
  traite_par UUID REFERENCES profiles(id),
  traite_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_suggestions_corrections_etablissement ON suggestions_corrections(etablissement_id);
CREATE INDEX idx_suggestions_corrections_statut ON suggestions_corrections(statut);
CREATE INDEX idx_suggestions_corrections_created_at ON suggestions_corrections(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE suggestions_corrections ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (tous peuvent suggérer des corrections)
CREATE POLICY "Anyone can suggest corrections" ON suggestions_corrections
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture par les admins seulement
CREATE POLICY "Admins can view all suggestions" ON suggestions_corrections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre la mise à jour par les admins seulement
CREATE POLICY "Admins can update suggestions" ON suggestions_corrections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_suggestions_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suggestions_corrections_updated_at
    BEFORE UPDATE ON suggestions_corrections
    FOR EACH ROW
    EXECUTE FUNCTION update_suggestions_corrections_updated_at();

-- Commentaires
COMMENT ON TABLE suggestions_corrections IS 'Table pour stocker les suggestions de corrections des utilisateurs';
COMMENT ON COLUMN suggestions_corrections.etablissement_id IS 'ID de l''établissement concerné par la correction';
COMMENT ON COLUMN suggestions_corrections.statut IS 'Statut du traitement: en_attente, en_cours, traitee, rejetee';