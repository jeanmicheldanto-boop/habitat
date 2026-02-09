-- ====================================================================
-- METTRE À JOUR LA DESCRIPTION DE LA MAISON MOCHEZ
-- ====================================================================

UPDATE etablissements
SET presentation = 'La Maison Mochez, située à Onnaing, propose un habitat inclusif intimiste pour 6 personnes âgées en perte d''autonomie modérée (GIR 4). Né d''un partenariat avec le Conseil Départemental du Nord, Valenciennes Métropole et la ville d''Onnaing, ce projet à vocation sociale s''adresse particulièrement aux personnes disposant de revenus modestes qui se sentent isolées à domicile malgré les aides quotidiennes, mais qui appréhendent l''entrée en EHPAD.
Le lieu offre un cadre de vie partagé où chaque résident conserve sa liberté de choix : participer ou non aux activités, organiser son rythme de vie selon ses capacités. L''accompagnement se veut familial et attentif, avec une présence continue du personnel 24h/24. Les petits-déjeuners sont servis en chambre selon les préférences de chacun, les repas sont cuisinés sur place en tenant compte des goûts et des habitudes alimentaires. Une animatrice diplômée propose des activités variées l''après-midi : jeux, sorties culturelles, promenades, moments de partage qui respectent les envies et le rythme de chacun.
La surveillance nocturne est assurée grâce à un système d''appel et la présence constante du personnel. Au-delà des aspects pratiques (linge, ménage, entretien), l''équipe coordonne avec les familles le suivi médical et paramédical, tout en veillant à préserver les capacités de chaque personne par une stimulation adaptée à son histoire de vie et ses repères personnels.
Cette formule, reconnue par la loi ELAN comme solution intermédiaire entre domicile et institution, permet de rompre l''isolement dans un environnement sécurisant à taille humaine. Les services sont partiellement déductibles fiscalement et éligibles à l''APA. L''objectif fondamental reste de redonner du sens à l''accompagnement des personnes fragilisées, en préservant leur dignité et leur individualité au sein d''un collectif bienveillant qui devient comme une seconde famille.'
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';

-- Vérifier la mise à jour
SELECT id, nom, presentation 
FROM etablissements 
WHERE id = '6e5fbddb-b373-4d8e-8707-f1a7661ce6ba';
