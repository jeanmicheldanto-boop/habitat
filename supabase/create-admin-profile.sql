-- Créer un profil admin pour votre utilisateur

-- Insérer un profil admin pour l'utilisateur patrick.danto@outlook.fr
INSERT INTO public.profiles (id, email, role, nom, prenom, organisation)
VALUES (
  '3e02294b-14ee-4f68-ab67-1c38eb5fdc8e',
  'patrick.danto@outlook.fr',
  'admin',
  'Danto',
  'Patrick',
  'Danto & Frère'
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = 'patrick.danto@outlook.fr',
  nom = 'Danto',
  prenom = 'Patrick';

-- Vérifier que le profil a bien été créé
SELECT 
  'PROFIL CRÉÉ' as info,
  id,
  email,
  role,
  nom,
  prenom,
  organisation
FROM public.profiles
WHERE id = '3e02294b-14ee-4f68-ab67-1c38eb5fdc8e';

SELECT '✅ Profil admin créé avec succès' as resultat;
