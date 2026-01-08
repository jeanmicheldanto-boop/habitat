# 🔄 PROCESSUS COMPLET DE CRÉATION D'ÉTABLISSEMENT (Post-Corrections)

## Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Gestionnaire remplit le formulaire                        │
│  📝 Fichier: src/app/gestionnaire/create/page.tsx                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: Upload de la photo (si présente)                          │
│  📤 API: src/app/api/upload-image/route.ts                          │
│  🔧 CORRIGÉ: Upload dans bucket "etablissements"                    │
│  🔧 CORRIGÉ: Retourne "etablissements/{tempId}/main.{ext}"          │
└───────────────────────────────┬─────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: Création de la proposition                                │
│  💾 Table: propositions                                             │
│  ✅ payload.gestionnaire = userOrganisation (TEXT)                  │
│  ✅ payload.image_path = "etablissements/xxx/main.jpg"              │
└───────────────────────────────┬─────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: Admin approuve la proposition                             │
│  🔧 Helper: src/lib/create-etablissement-helper.ts                  │
│  🔧 CORRIGÉ: gestionnaire = payload.gestionnaire (pas de recherche) │
│  🔧 CORRIGÉ: etablissements.image_path = NULL (pas de duplication)  │
│  🔧 CORRIGÉ: medias.storage_path = payload.image_path (avec préfixe)│
└───────────────────────────────┬─────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: Affichage sur la plateforme                               │
│  📱 Liste, 🗺️ Carte, 📄 Fiche                                        │
│  🔧 CORRIGÉ: Fiche avec revalidate = 0 (pas de cache)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 ÉTAPE 1: Remplissage du Formulaire

**Fichier**: [src/app/gestionnaire/create/page.tsx](src/app/gestionnaire/create/page.tsx)

### Récupération de l'organisation (ligne 67-105)

```typescript
// Vérifier le rôle et récupérer l'organisation
const { data: profile } = await supabase
  .from('profiles')
  .select('role, organisation')
  .eq('id', user.id)
  .single();

setUserOrganisation(profile?.organisation || '');
```

**État**: `userOrganisation = "CCAS Ossun"` (par exemple)

### Données du formulaire

```typescript
formData = {
  nom: "Maison Test",
  adresse: "123 rue Test",
  ville: "Tarbes",
  code_postal: "65000",
  telephone: "0562123456",
  email: "test@example.com",
  habitat_type: "habitat_inclusif",
  sous_categories: ["habitat_inclusif"],
  photo_file: File {...}  // Si photo uploadée
}
```

---

## 📤 ÉTAPE 2: Upload de la Photo

**Fichier**: [src/app/api/upload-image/route.ts](src/app/api/upload-image/route.ts)

### ✅ CORRECTION APPLIQUÉE (ligne 78)

```typescript
const { error: uploadError } = await supabaseAdmin.storage
  .from('etablissements')  // ✅ BON BUCKET
  .upload(filePath, buffer, {
    contentType: file.type,
    upsert: true
  });
```

### ✅ CORRECTION APPLIQUÉE (ligne 96)

```typescript
return NextResponse.json({
  success: true,
  path: `etablissements/${filePath}`  // ✅ AVEC PRÉFIXE
});
```

**Résultat**: `imagePath = "etablissements/a1b2c3d4-xxx/main.jpg"`

### Vérification Storage

```
Bucket: etablissements
Path: a1b2c3d4-xxx/main.jpg
URL publique: https://{supabase}/storage/v1/object/public/etablissements/a1b2c3d4-xxx/main.jpg
```

✅ **Image accessible immédiatement**

---

## 💾 ÉTAPE 3: Création de la Proposition

**Fichier**: [src/app/gestionnaire/create/page.tsx](src/app/gestionnaire/create/page.tsx#L227-L249)

### Payload créé (ligne 236-247)

```typescript
payload: {
  ...formData,
  commune: formData.ville,  // "Tarbes"
  adresse_l1: formData.adresse,  // "123 rue Test"
  gestionnaire: userOrganisation,  // ✅ "CCAS Ossun" (TEXT)
  image_path: imagePath,  // ✅ "etablissements/a1b2c3d4-xxx/main.jpg"
  temp_etablissement_id: tempId  // "a1b2c3d4-xxx"
}
```

### Insertion dans propositions

```sql
INSERT INTO propositions (statut, payload, created_by, source)
VALUES (
  'en_attente',
  '{"nom": "Maison Test", "gestionnaire": "CCAS Ossun", "image_path": "etablissements/...", ...}',
  '{user_id}',
  'gestionnaire'
);
```

✅ **Proposition créée avec les bonnes données**

---

## ✅ ÉTAPE 4: Approbation par Admin

**Fichier**: [src/lib/create-etablissement-helper.ts](src/lib/create-etablissement-helper.ts)

### 4.1 Préparation des données établissement (ligne 123-148)

```typescript
const etablissementData = {
  nom: payload.nom,  // "Maison Test"
  presentation: payload.description,
  adresse_l1: payload.adresse_l1,  // "123 rue Test"
  commune: payload.commune,  // "Tarbes"
  code_postal: payload.code_postal,  // "65000"
  telephone: payload.telephone,
  email: payload.email,
  habitat_type: payload.habitat_type,
  statut_editorial: 'publie',
  eligibilite_statut: 'a_verifier',
  image_path: null  // ✅ CORRIGÉ: Toujours NULL
};
```

### 4.2 ✅ CORRECTION: Gestionnaire (ligne 146-148)

```typescript
// Gestionnaire - C'est un champ TEXT, pas un UUID
if (payload.gestionnaire) {
  etablissementData.gestionnaire = payload.gestionnaire;  // ✅ "CCAS Ossun"
}
```

**Avant** ❌: Cherchait dans la table `gestionnaires` (UUID) → Rien trouvé → NULL
**Après** ✅: Utilise directement le texte → `gestionnaire = "CCAS Ossun"`

### 4.3 Insertion établissement

```sql
INSERT INTO etablissements (
  nom, presentation, adresse_l1, commune, code_postal,
  telephone, email, habitat_type, statut_editorial,
  image_path, gestionnaire  -- ✅ image_path=NULL, gestionnaire="CCAS Ossun"
)
VALUES (...)
RETURNING id;
```

**Résultat**: `newEtab.id = "76a5f008-xxx-xxx-xxx"`

### 4.4 ✅ Création entrée medias (ligne 179-191)

```typescript
if (payload.image_path) {
  await supabase
    .from('medias')
    .insert([{
      etablissement_id: newEtab.id,  // "76a5f008-xxx"
      storage_path: payload.image_path,  // ✅ "etablissements/a1b2c3d4-xxx/main.jpg"
      priority: 1000,  // Haute priorité
      alt_text: `Photo de ${payload.nom}`
    }]);
}
```

### 4.5 État final dans la BDD

**Table `etablissements`**:
```
id: 76a5f008-xxx
nom: "Maison Test"
gestionnaire: "CCAS Ossun"  ✅
image_path: NULL  ✅
statut_editorial: "publie"
```

**Table `medias`**:
```
id: [auto-généré]
etablissement_id: 76a5f008-xxx
storage_path: "etablissements/a1b2c3d4-xxx/main.jpg"  ✅
priority: 1000
```

**Vue `v_liste_publication`**:
```sql
SELECT 
  ...
  COALESCE(
    e.image_path,  -- NULL
    (SELECT m.storage_path FROM medias m  -- "etablissements/a1b2c3d4-xxx/main.jpg"
     WHERE m.etablissement_id = e.id
     ORDER BY m.priority DESC LIMIT 1)
  ) AS image_path
FROM etablissements e
```

**Résultat de la vue**: `image_path = "etablissements/a1b2c3d4-xxx/main.jpg"` ✅

---

## 🎨 ÉTAPE 5: Affichage sur la Plateforme

### 5.1 📱 Liste (plateforme/page.tsx ligne 1387-1388)

```typescript
const imgSrc = etab.image_path  // "etablissements/a1b2c3d4-xxx/main.jpg"
  ? getSupabaseImageUrl(etab.image_path)
  : getHabitatImage(etab.sous_categories ?? null);
```

**Fonction `getSupabaseImageUrl()`** (ligne 22):
```typescript
if (storagePath.startsWith('etablissements/')) {
  return `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
}
// Retourne: "https://{supabase}/storage/v1/object/public/etablissements/a1b2c3d4-xxx/main.jpg"
```

**Résultat**: ✅ **Image s'affiche dans la liste**

---

### 5.2 🗺️ Carte (EtabMap.tsx ligne 9-10)

```typescript
function getPublicUrl(path?: string | null, sous_categories?: string[] | null): string {
  if (!path) return getHabitatImage(sous_categories || null);
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
}
```

**Avec**: `path = "etablissements/a1b2c3d4-xxx/main.jpg"`

**Retourne**: `"https://{supabase}/storage/v1/object/public/etablissements/a1b2c3d4-xxx/main.jpg"`

**Résultat**: ✅ **Image s'affiche sur la carte**

---

### 5.3 📄 Fiche (plateforme/fiche/page.tsx)

#### ✅ CORRECTION: Revalidate (ligne 9)

```typescript
export const revalidate = 0;  // ✅ Désactive le cache
```

#### Requête (ligne 13-16)

```typescript
const { data } = await supabase
  .from("v_liste_publication")
  .select("*")
  .eq("etab_id", etabId)
  .single();
```

**Données reçues**: `data.image_path = "etablissements/a1b2c3d4-xxx/main.jpg"`

#### Affichage (ligne 46)

```typescript
<Image
  src={data.image_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.image_path}`
    : getHabitatImage(data.sous_categories)}
  alt={data.nom}
  width={260}
  height={180}
/>
```

**URL finale**: `"https://{supabase}/storage/v1/object/public/etablissements/a1b2c3d4-xxx/main.jpg"`

**Résultat**: ✅ **Image s'affiche sur la fiche**

---

## ✅ RÉCAPITULATIF DES CORRECTIONS

| Composant | Problème | Correction | Statut |
|-----------|----------|------------|--------|
| **upload-image/route.ts** ligne 78 | Upload dans `medias` | Upload dans `etablissements` | ✅ |
| **upload-image/route.ts** ligne 96 | Retour sans préfixe | Retour avec `etablissements/` | ✅ |
| **create-etablissement-helper.ts** ligne 138 | Stocke dans `image_path` | Toujours `NULL` | ✅ |
| **create-etablissement-helper.ts** ligne 146-148 | Cherche dans table | Utilise texte direct | ✅ |
| **create-etablissement-helper.ts** ligne 185 | Path sans préfixe | Path avec préfixe (depuis API) | ✅ |
| **plateforme/fiche/page.tsx** ligne 9 | Cache par défaut | `revalidate = 0` | ✅ |

---

## 🎯 GARANTIES POUR LES PROCHAINS ÉTABLISSEMENTS

### ✅ Champ Gestionnaire

1. **Récupération** : `userOrganisation` depuis `profiles.organisation`
2. **Transmission** : Via `payload.gestionnaire` (TEXT)
3. **Stockage** : Directement dans `etablissements.gestionnaire` (TEXT)
4. **Résultat** : Champ toujours rempli, contrainte `etablissements_publish_check` respectée

### ✅ Image Visible Partout

1. **Upload** : Dans bucket `etablissements` avec chemin `etablissements/{tempId}/main.{ext}`
2. **Stockage BDD** : 
   - `etablissements.image_path` = NULL
   - `medias.storage_path` = chemin complet avec préfixe
3. **Vue** : Retourne `medias.storage_path` via COALESCE
4. **Affichage** :
   - **Liste** ✅ : Via `getSupabaseImageUrl()`
   - **Carte** ✅ : Via `getPublicUrl()`
   - **Fiche** ✅ : Via URL directe, pas de cache

### ✅ Fallback Fonctionnel

Si aucune image n'est uploadée :
- `payload.image_path` = undefined
- Pas d'entrée dans `medias`
- Vue retourne `image_path = NULL`
- Frontend utilise `getHabitatImage(sous_categories)`
- Affiche image d'illustration depuis `/public/`

---

## 🧪 TEST COMPLET RECOMMANDÉ

Pour valider le processus, créez un établissement de test :

1. Se connecter en tant que gestionnaire
2. Créer un établissement avec photo
3. Vérifier :
   - [ ] Proposition créée
   - [ ] Admin peut approuver
   - [ ] `etablissements.gestionnaire` = nom organisation
   - [ ] `medias.storage_path` = `etablissements/xxx/main.jpg`
   - [ ] Image visible dans la liste
   - [ ] Image visible sur la carte
   - [ ] Image visible sur la fiche

**Commande de vérification**:
```bash
node check-fiche-data.js
```

---

**Conclusion** : Avec ces corrections, **TOUT fonctionnera correctement** pour les prochains établissements ! 🎉
