-- Vérifier le code des fonctions de notification

-- 1. Fonction de notification de création d'établissement
SELECT pg_get_functiondef('notify_etablissement_creation()'::regprocedure);

-- 2. Fonction de notification de mise à jour d'établissement  
SELECT pg_get_functiondef('notify_etablissement_update()'::regprocedure);

-- 3. Fonction de notification de création de réclamation
SELECT pg_get_functiondef('notify_reclamation_creation()'::regprocedure);

-- 4. Fonction de notification de changement de statut de réclamation
SELECT pg_get_functiondef('notify_reclamation_status_change()'::regprocedure);
