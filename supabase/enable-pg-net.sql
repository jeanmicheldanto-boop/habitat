-- ====================================================================
-- ACTIVER L'EXTENSION PG_NET
-- ====================================================================
-- Cette extension est nécessaire pour envoyer des requêtes HTTP avec headers personnalisés

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Vérifier que l'extension est bien activée
SELECT * FROM pg_extension WHERE extname = 'pg_net';
