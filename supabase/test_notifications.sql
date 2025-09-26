-- Script pour insérer des notifications de test
-- Remplacez 'USER_ID_HERE' par l'ID d'un utilisateur réel

INSERT INTO notifications (user_id, type, title, message, data)
VALUES 
  (
    (SELECT id FROM auth.users LIMIT 1),
    'proposition_approved',
    'Proposition approuvée',
    'Votre demande de création d''établissement "Test Hotel" a été approuvée !',
    jsonb_build_object(
      'proposition_id', '123',
      'review_note', 'Excellente proposition, toutes les informations sont complètes.'
    )
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'reclamation_rejected',
    'Réclamation rejetée',
    'Votre réclamation de propriété pour l''établissement "Restaurant ABC" a été rejetée.',
    jsonb_build_object(
      'reclamation_id', '456',
      'etablissement_id', '789',
      'review_note', 'Les justificatifs fournis ne sont pas suffisants pour prouver la propriété.'
    )
  );