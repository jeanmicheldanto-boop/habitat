# 🔍 DIAGNOSTIC COMPLET - Pipeline Images Habitat

## 📋 Résumé Exécutif

**Problème**: Les images uploadées depuis l'espace gestionnaire ne s'affichent pas correctement sur la carte et les fiches d'établissements, bien qu'elles apparaissent dans la liste.

**Cause Racine Identifiée** : Incohérence dans la gestion des chemins et buckets entre les différentes parties du système.

---

## 🎯 Analyse Détaillée

### 1. Architecture Actuelle des Images

Le système utilise **DEUX systèmes d'images en parallèle** :

#### A. Colonne `etablissements.image_path` (Ancien système)
- Type: `TEXT`
- Contient un chemin d'image *avec préfixe de bucket*
- Exemple attendu: `etablissements/xxx-xxx/main.jpg` OU `medias/xxx-xxx/main.jpg`

#### B. Table `medias` (Nouveau système multi-images)
- Colonnes: `storage_path`, `priority`, `alt_text`
- Supporte plusieurs images par établissement
- Priorité: plus le chiffre est élevé, plus l'image est prioritaire

#### C. Vues (v_liste_publication, v_liste_publication_geoloc)
```sql
COALESCE(
  e.image_path,  -- PRIORITÉ 1
  (SELECT m.storage_path FROM medias m ...) -- PRIORITÉ 2 (fallback)
) AS image_path
```

**📌 Point Critique**: Les vues priorisent `etablissements.image_path`, donc si cette colonne contient une valeur, la table `medias` est ignorée.

---

### 2. Flux Actuel - Création via Espace Gestionnaire

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Formulaire (gestionnaire/create/page.tsx)                   │
│     → Upload photo via uploadPhotoIfExists()                    │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. API /api/upload-image/route.ts                              │
│     → Upload vers bucket "medias"                               │
│     → Chemin: {tempId}/main.{ext}                               │
│     ❌ PROBLÈME: Retourne le chemin SANS préfixe "medias/"      │
│     → Retour: "a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg"   │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Création Proposition                                        │
│     → payload.image_path = "xxx-xxx/main.jpg" (sans préfixe)   │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Approbation (create-etablissement-helper.ts)                │
│     ❌ PROBLÈME 1 (ligne 138):                                  │
│        image_path: payload.image_path || null                   │
│        → Stocke le chemin sans préfixe dans etablissements      │
│                                                                 │
│     ❌ PROBLÈME 2 (lignes 146-154):                             │
│        Recherche dans la TABLE gestionnaires au lieu d'utiliser │
│        directement payload.gestionnaire (qui est un TEXT)       │
│                                                                 │
│     ✅ CORRECT (ligne 185):                                     │
│        Insère dans medias mais avec storage_path sans préfixe   │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Affichage Frontend                                          │
│                                                                 │
│  📱 Liste (plateforme/page.tsx):                                │
│     → Utilise getSupabaseImageUrl(etab.image_path)             │
│     → Fonction ajoute le préfixe manquant ? NON                │
│     ❓ Pourquoi ça marche alors ?                               │
│                                                                 │
│  🗺️  Carte (EtabMap.tsx):                                       │
│     → Utilise getPublicUrl(etab.image_path)                    │
│     → Construit: /{path}                                        │
│     ❌ Manque le bucket → URL invalide                          │
│                                                                 │
│  📄 Fiche (plateforme/fiche/page.tsx):                          │
│     → Même problème que la carte                               │
│     ❌ URL invalide                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. État des Buckets Supabase

#### Bucket `etablissements` (public)
```
✅ a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg  ← Image RÉELLE de Patgen
   etablissements/[autres sous-dossiers]
```

#### Bucket `medias` (public)
```
❌ f6211dcb-ba95-4219-aad4-246edee15346/main.jpg  ← Mauvais chemin
   [14 autres dossiers de tempId]
```

**📌 Constat**: Les images sont uploadées dans **DEUX** buckets différents selon le contexte !

---

### 4. Cas Spécifique : Maison Patgen à Ossun

#### État Actuel (BDD)
```sql
-- Table etablissements
id: 76a5f008-7f5c-44e6-a405-2c54f9cb2fa7
nom: "maison patgen"
image_path: NULL  ← Bon (ne bloque pas la vue)
gestionnaire: "CCAS Ossun"  ← Bon maintenant (corrigé manuellement)

-- Table medias
etablissement_id: 76a5f008-7f5c-44e6-a405-2c54f9cb2fa7
storage_path: "a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg"  ← SANS préfixe !
priority: 1000

-- Vue v_liste_publication
image_path: NULL  ← La vue ne trouve rien car medias.storage_path est invalide
```

#### État du Storage
```
✅ Fichier existe: etablissements/a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg
❌ Chemin en BDD: a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg (manque "etablissements/")
```

---

## 🐛 Bugs Identifiés

### Bug #1: API Upload retourne un chemin incomplet
**Fichier**: `src/app/api/upload-image/route.ts`  
**Ligne**: 96-97

```typescript
// ❌ ACTUEL
return NextResponse.json({
  success: true,
  path: filePath  // "xxx-xxx/main.jpg" SANS préfixe
});

// ✅ ATTENDU
return NextResponse.json({
  success: true,
  path: `medias/${filePath}`  // "medias/xxx-xxx/main.jpg"
});
```

**Impact**: Tous les chemins stockés manquent le préfixe du bucket.

---

### Bug #2: Helper stocke le chemin incomplet dans etablissements.image_path
**Fichier**: `src/lib/create-etablissement-helper.ts`  
**Ligne**: 138

```typescript
// ❌ ACTUEL
image_path: payload.image_path || null  // Sans préfixe

// ✅ SOLUTION 1: Ajouter le préfixe
image_path: payload.image_path ? `medias/${payload.image_path}` : null

// ✅ SOLUTION 2 (RECOMMANDÉE): Toujours NULL, utiliser medias table
image_path: null  // Force l'utilisation de la table medias
```

**Impact**: Les vues retournent un chemin invalide.

---

### Bug #3: Helper stocke le chemin incomplet dans medias.storage_path
**Fichier**: `src/lib/create-etablissement-helper.ts`  
**Ligne**: 185

```typescript
// ❌ ACTUEL
storage_path: payload.image_path,  // Sans préfixe

// ✅ CORRECTION
storage_path: `medias/${payload.image_path}`,  // Avec préfixe
```

**Impact**: La table medias contient des chemins invalides.

---

### Bug #4: Gestionnaire recherche dans la mauvaise table
**Fichier**: `src/lib/create-etablissement-helper.ts`  
**Lignes**: 146-154

```typescript
// ❌ ACTUEL
if (payload.gestionnaire) {
  const { data: gestionnaires } = await supabase
    .from('gestionnaires')  // ← Cherche dans la TABLE
    .select('id, nom')
    .ilike('nom', payload.gestionnaire)
    .limit(1);
  
  if (gestionnaires && gestionnaires.length > 0) {
    etablissementData.gestionnaire = gestionnaires[0].id;  // ← UUID
  }
}

// ✅ CORRECTION
if (payload.gestionnaire) {
  etablissementData.gestionnaire = payload.gestionnaire;  // ← Texte direct
}
```

**Explication**: 
- `etablissements.gestionnaire` est un champ **TEXT** (nom de l'organisation)
- `gestionnaires` est une table séparée avec des UUID
- Le payload contient déjà le texte du nom, pas besoin de recherche

**Impact**: Le champ gestionnaire reste vide/NULL → impossible de publier (contrainte).

---

## 🎯 Décision Architecture : Un Seul Système

### Recommandation : Utiliser **UNIQUEMENT** la table `medias`

**Avantages**:
- ✅ Support natif multi-images
- ✅ Système de priorité intégré
- ✅ Plus cohérent et maintenable
- ✅ Évite la duplication

**Migration**:
1. Mettre `etablissements.image_path` à NULL pour tous
2. S'assurer que la table `medias` a tous les chemins avec préfixe
3. Modifier les vues pour utiliser UNIQUEMENT `medias.storage_path`

---

## 🔧 Plan de Correction

### Phase 1: Corrections Urgentes (Immédiat)

#### 1.1 Corriger create-etablissement-helper.ts
```typescript
// Ligne 138 : NE PLUS stocker dans image_path
image_path: null,  // Toujours NULL

// Lignes 146-154 : Utiliser directement le texte
if (payload.gestionnaire) {
  etablissementData.gestionnaire = payload.gestionnaire;
}

// Ligne 185 : Ajouter le préfixe du bucket
storage_path: `etablissements/${payload.image_path}`,
```

#### 1.2 Corriger upload-image/route.ts
```typescript
// Ligne 68 : Uploader dans le bucket "etablissements" au lieu de "medias"
await supabaseAdmin.storage
  .from('etablissements')  // ← Changer ici
  .upload(filePath, buffer, {
    contentType: file.type,
    upsert: true
  });

// Lignes 96-97 : Retourner avec le préfixe
return NextResponse.json({
  success: true,
  path: `etablissements/${filePath}`
});
```

#### 1.3 Réparer Patgen (SQL immédiat)
```sql
-- Mettre à jour le storage_path dans medias
UPDATE medias
SET storage_path = 'etablissements/a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg'
WHERE etablissement_id = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
```

---

### Phase 2: Nettoyage Global (Court terme)

#### 2.1 Migrer tous les chemins existants
```sql
-- Trouver tous les chemins sans préfixe dans medias
UPDATE medias
SET storage_path = 'etablissements/' || storage_path
WHERE storage_path NOT LIKE 'etablissements/%'
  AND storage_path NOT LIKE 'medias/%';
```

#### 2.2 Nettoyer etablissements.image_path
```sql
-- Mettre tous les image_path à NULL (utiliser medias uniquement)
UPDATE etablissements
SET image_path = NULL
WHERE image_path IS NOT NULL;
```

---

### Phase 3: Simplification Architecture (Moyen terme)

#### 3.1 Modifier les vues
```sql
-- Utiliser UNIQUEMENT medias.storage_path
CREATE OR REPLACE VIEW v_liste_publication AS
SELECT 
  -- ...
  (SELECT m.storage_path FROM medias m
   WHERE m.etablissement_id = e.id
   ORDER BY m.priority DESC, m.created_at DESC LIMIT 1) AS image_path,
  -- ...
```

#### 3.2 Supprimer la colonne image_path (optionnel)
```sql
ALTER TABLE etablissements
DROP COLUMN image_path;
```

---

## ✅ Vérifications Post-Correction

### Test 1: Upload depuis Gestionnaire
1. Créer un établissement avec photo
2. Vérifier que `medias.storage_path` contient `etablissements/xxx-xxx/main.jpg`
3. Vérifier que `etablissements.image_path` est NULL
4. Vérifier que la vue retourne le bon chemin

### Test 2: Affichage
1. Liste: image visible ✓
2. Carte: image visible ✓
3. Fiche: image visible ✓

### Test 3: Champ Gestionnaire
1. Créer établissement depuis espace gestionnaire
2. Vérifier que `etablissements.gestionnaire` contient le nom (TEXT)
3. Vérifier qu'on peut publier (contrainte respectée)

---

## 📊 Récapitulatif des Fichiers à Modifier

| Fichier | Lignes | Action |
|---------|--------|--------|
| `src/app/api/upload-image/route.ts` | 68, 96-97 | Changer bucket et retourner avec préfixe |
| `src/lib/create-etablissement-helper.ts` | 138 | Toujours mettre NULL |
| `src/lib/create-etablissement-helper.ts` | 146-154 | Utiliser payload.gestionnaire directement |
| `src/lib/create-etablissement-helper.ts` | 185 | Ajouter préfixe "etablissements/" |
| `supabase/update-views-for-images.sql` | - | Simplifier pour n'utiliser que medias |

---

## 🎓 Leçons Apprises

1. **Éviter les systèmes parallèles**: Deux sources de vérité créent des incohérences
2. **Préfixer les chemins**: Toujours inclure le bucket dans les chemins de storage
3. **Vérifier les types**: gestionnaires (UUID) ≠ gestionnaire (TEXT)
4. **Tester le pipeline complet**: De l'upload jusqu'à l'affichage

---

**Document généré le**: 2026-01-08  
**Problème**: Image Patgen + Pipeline création gestionnaire  
**Statut**: 🔴 En attente de correction
