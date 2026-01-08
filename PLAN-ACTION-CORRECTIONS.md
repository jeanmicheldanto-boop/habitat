# 🚀 PLAN D'ACTION - Correction Images & Gestionnaires

## ✅ Ce qui a été fait automatiquement

### 1. Corrections du code (déjà appliquées)

#### ✅ `src/app/api/upload-image/route.ts`
- **Ligne ~78**: Changé `from('medias')` → `from('etablissements')`
- **Ligne ~96**: Changé `path: filePath` → `path: 'etablissements/${filePath}'`
- **Impact**: Les futures images seront uploadées dans le bon bucket avec le bon préfixe

#### ✅ `src/lib/create-etablissement-helper.ts`
- **Ligne ~138**: Changé `image_path: payload.image_path || null` → `image_path: null`
- **Lignes ~146-154**: Supprimé la recherche dans la table gestionnaires, utilise directement `payload.gestionnaire`
- **Ligne ~185**: Commentaire ajouté (le préfixe vient maintenant de l'API)
- **Impact**: 
  - Le champ `gestionnaire` sera correctement rempli
  - `etablissements.image_path` restera NULL (utilise medias uniquement)
  - Les contraintes de publication seront respectées

---

## 🔴 Actions manuelles requises (VOUS)

### 1. Corriger l'image de Patgen (URGENT)

**Exécuter dans Supabase SQL Editor**:
```sql
-- Fichier: supabase/fix-patgen-storage-path.sql

UPDATE medias
SET storage_path = 'etablissements/' || storage_path
WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7'
  AND storage_path NOT LIKE 'etablissements/%';
```

**Vérification**:
```bash
node test-patgen-fixed.js
```

**Résultat attendu**:
- ✅ `storage_path` = `etablissements/a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg`
- ✅ L'image s'affiche sur la carte et la fiche

---

### 2. Corriger TOUS les chemins existants (RECOMMANDÉ)

**Exécuter dans Supabase SQL Editor**:
```sql
-- Fichier: supabase/fix-all-storage-paths.sql

-- Voir combien de chemins sont incorrects
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN storage_path LIKE 'etablissements/%' OR storage_path LIKE 'medias/%' THEN 1 END) as avec_prefixe,
  COUNT(CASE WHEN storage_path NOT LIKE 'etablissements/%' AND storage_path NOT LIKE 'medias/%' THEN 1 END) as sans_prefixe
FROM medias;

-- Corriger tous les chemins
UPDATE medias
SET storage_path = 'etablissements/' || storage_path
WHERE storage_path NOT LIKE 'etablissements/%'
  AND storage_path NOT LIKE 'medias/%';
```

**Impact**: Tous les établissements avec images auront des chemins corrects.

---

### 3. Tester la création d'un nouvel établissement

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Créer un établissement avec une photo
3. Vérifier que:
   - L'image s'uploade correctement
   - Le champ `gestionnaire` est rempli
   - L'image s'affiche sur liste, carte ET fiche

**Script de vérification**:
```bash
# Après création, noter l'ID et tester
node check-specific-proposition.js <ETAB_ID>
```

---

## 📊 Vérifications post-corrections

### Test automatique complet
```bash
# 1. Vérifier Patgen
node test-patgen-fixed.js

# 2. Vérifier l'état global
node analyze-image-buckets.js

# 3. Créer un test et vérifier
# (via interface gestionnaire)
```

### Checklist manuelle

- [ ] Image Patgen s'affiche sur la **liste**
- [ ] Image Patgen s'affiche sur la **carte**
- [ ] Image Patgen s'affiche sur la **fiche**
- [ ] Nouvel établissement : champ `gestionnaire` rempli
- [ ] Nouvel établissement : image s'affiche partout
- [ ] Pas d'erreur dans la console navigateur
- [ ] Pas d'erreur dans les logs Supabase

---

## 🎯 Résumé des bugs corrigés

| Bug | Fichier | Ligne(s) | Correction | Statut |
|-----|---------|----------|------------|--------|
| Upload dans mauvais bucket | `upload-image/route.ts` | 78 | `medias` → `etablissements` | ✅ Corrigé |
| Chemin sans préfixe | `upload-image/route.ts` | 96 | Ajouté préfixe `etablissements/` | ✅ Corrigé |
| `image_path` dupliqué | `create-etablissement-helper.ts` | 138 | Toujours `null` | ✅ Corrigé |
| Gestionnaire vide | `create-etablissement-helper.ts` | 146-154 | Utilise texte direct | ✅ Corrigé |
| Chemins existants incorrects | Table `medias` | - | SQL à exécuter | 🔴 À faire |

---

## 📚 Documentation

- **Diagnostic complet**: Voir `DIAGNOSTIC-IMAGE-PIPELINE.md`
- **Architecture**: Système unifié sur table `medias`
- **Vues**: Utilisent `COALESCE(etablissements.image_path, medias.storage_path)`
  - Comme `etablissements.image_path` est maintenant toujours NULL, les vues utilisent `medias.storage_path`

---

## 💡 Pour l'avenir

### ✅ Système actuel (après corrections)
1. Upload dans bucket `etablissements`
2. Chemin retourné avec préfixe: `etablissements/xxx/main.jpg`
3. Stocké dans `medias.storage_path` (avec préfixe)
4. `etablissements.image_path` = NULL
5. Vues retournent `medias.storage_path`
6. Frontend construit URL correcte

### 🚨 Points de vigilance
- Ne jamais stocker de chemin dans `etablissements.image_path`
- Toujours utiliser la table `medias` pour les images
- Toujours vérifier que les chemins ont le préfixe du bucket

---

## 🆘 En cas de problème

### L'image ne s'affiche toujours pas
1. Vérifier le `storage_path` dans la table `medias`:
   ```sql
   SELECT storage_path FROM medias WHERE etablissement_id = '<ID>';
   ```
2. Le chemin doit commencer par `etablissements/` ou `medias/`
3. Si non, exécuter le script `fix-all-storage-paths.sql`

### Le gestionnaire est toujours NULL
1. Vérifier le profil utilisateur:
   ```sql
   SELECT organisation FROM gestionnaires_profils WHERE id = '<USER_ID>';
   ```
2. Si vide, mettre à jour:
   ```sql
   UPDATE gestionnaires_profils SET organisation = 'Nom Org' WHERE id = '<USER_ID>';
   ```

### Erreur de contrainte `etablissements_publish_check`
1. Vérifier que `gestionnaire` n'est pas vide
2. Si le code est correct, le problème vient du profil utilisateur

---

**Date de correction**: 2026-01-08  
**Version**: 1.0  
**Statut**: 🟡 Corrections code ✅ | Corrections BDD 🔴
