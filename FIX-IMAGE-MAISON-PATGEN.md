# Correction de l'affichage de l'image - Maison Patgen à Ossun

## 🔍 Diagnostic du problème

L'image uploadée depuis l'espace gestionnaire s'affiche dans la liste de la plateforme, mais c'est le fallback qui s'affiche sur la carte et l'image ne s'affiche pas sur la fiche de l'établissement.

### Cause identifiée

1. **Image uploadée correctement** : Le fichier image existe bien dans Supabase Storage au chemin :  
   `a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg`

2. **Chemin incorrect dans la base** : Le champ `etablissements.image_path` contient un mauvais chemin :  
   `f6211dcb-ba95-4219-aad4-246edee15346/main.jpg` (ce fichier n'existe pas)

3. **Priorité de la vue** : La vue `v_liste_publication` utilise :  
   ```sql
   COALESCE(etablissements.image_path, medias.storage_path)
   ```
   Elle priorise donc `etablissements.image_path` sur la table `medias`, même si le chemin est incorrect.

4. **Contrainte de publication** : La contrainte `etablissements_publish_check` empêche toute modification car l'établissement n'a pas de gestionnaire défini.

## ✅ Solutions

### OPTION 1 - Via SQL (RECOMMANDÉ) ⭐

Le script SQL `fix-maison-patgen-image.sql` a été créé dans le dossier `supabase/`.

**Étapes :**
1. Connectez-vous à l'interface Supabase
2. Ouvrez l'éditeur SQL  
3. Copiez-collez le contenu du fichier `supabase/fix-maison-patgen-image.sql`
4. Exécutez le script

**Ce que fait le script :**
- Désactive temporairement la contrainte
- Ajoute le gestionnaire manquant ("CCAS Ossun")
- Met `etablissements.image_path` à NULL
- Crée l'entrée correcte dans la table `medias`
- Réactive la contrainte

### OPTION 2 - Via l'interface admin

1. Accédez à : https://habitat-intermediaire.fr/admin/etablissements/76a5f008-7f5c-44e6-a405-2c54f9cb2fa7/edit
2. Uploadez à nouveau la photo depuis l'interface
3. Le composant `UploadPhotoEtablissement` créera automatiquement le bon chemin

### OPTION 3 - Commandes SQL manuelles

Exécutez ces commandes SQL dans l'ordre :

```sql
-- 1. Ajouter le gestionnaire
UPDATE etablissements
SET gestionnaire = 'CCAS Ossun'
WHERE id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7'
  AND (gestionnaire IS NULL OR TRIM(gestionnaire) = '');

-- 2. Mettre image_path à NULL
UPDATE etablissements
SET image_path = NULL
WHERE id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

-- 3. Créer l'entrée dans medias
DELETE FROM medias WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
INSERT INTO medias (etablissement_id, storage_path, alt_text, priority)
VALUES ('76a5f008-7f5c-44e6-a405-2c54f9cb2fa7', 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg', 'Maison Patgen', 1000);
```

## 📊 État actuel

- **Établissement** : maison patgen
- **Gestionnaire** : VIDE (problème)
- **Image path (table etablissements)** : f6211dcb-ba95-4219-aad4-246edee15346/main.jpg (incorrect)
- **Image path (table medias)** : a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg (correct)
- **Image path (vue)** : f6211dcb-ba95-4219-aad4-246edee15346/main.jpg (incorrect - utilise etablissements.image_path)

## ✅ Résultat attendu

Après correction, l'image s'affichera correctement sur :
- ✓ La liste de la plateforme  
- ✓ La carte interactive  
- ✓ La fiche détaillée de l'établissement  

**URL pour tester** :  
https://habitat-intermediaire.fr/plateforme/fiche?id=76a5f008-7f5c-44e6-a405-2c54f9cb2fa7

## 📝 Scripts créés

1. **`fix-maison-patgen-image.sql`** : Script SQL complet pour corriger le problème
2. **`final-solution-patgen.js`** : Script diagnostic qui affiche l'état actuel et les solutions

## 🔧 Explication technique

### Architecture des images

Le système utilise deux sources pour les images :

1. **`etablissements.image_path`** (legacy) : Colonne dans la table etablissements
2. **`medias.storage_path`** (nouveau) : Table dédiée pour gérer plusieurs photos

### Fonctionnement de la vue

```sql
-- La vue utilise COALESCE pour prioriser etablissements.image_path
COALESCE(
  e.image_path,  -- Priorité 1 : colonne legacy
  (SELECT m.storage_path FROM medias m  -- Priorité 2 : table medias
   WHERE m.etablissement_id = e.id
   ORDER BY m.priority DESC, m.created_at DESC
   LIMIT 1)
) AS image_path
```

### Contrainte de publication

La contrainte `etablissements_publish_check` vérifie via la fonction `can_publish()` que :
- Le nom est rempli
- L'adresse est complète
- La géolocalisation existe
- **Le gestionnaire est défini** ⚠️
- Le type d'habitat est défini
- L'email est valide (si présent)

C'est cette dernière condition qui empêche la mise à jour directe.
