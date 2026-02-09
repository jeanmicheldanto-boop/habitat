# 🔍 AUDIT: Édition Établissement - Problèmes & Solutions

## Problèmes Identifiés

### 1. **Upload d'Image - CRITIQUE** ❌
**Fichier**: [src/app/gestionnaire/edit/[id]/page.tsx](../src/app/gestionnaire/edit/[id]/page.tsx) ligne 480-520

**Problème**:
```typescript
const { data: existingMedia } = await supabase
  .from('medias')
  .select('id')
  .eq('etablissement_id', etablissement.id)
  .single();  // ❌ ÉCHOUE si aucun média ou si plusieurs médias
```

**Erreur**: Si pas de média existant → PGRST116 erreur, si plusieurs médias → retourne null

**Solution**:
```typescript
// Option 1: Utiliser maybeSingle() au lieu de single()
const { data: existingMedia } = await supabase
  .from('medias')
  .select('id')
  .eq('etablissement_id', etablissement.id)
  .order('priority', { ascending: true })
  .limit(1)
  .maybeSingle();  // ✅ Retourne null si pas de résultat, pas d'erreur

// Option 2: Gérer l'erreur PGRST116
const { data: existingMedia, error } = await supabase...
if (error && error.code !== 'PGRST116') throw error;
```

---

### 2. **Sauvegarde Tarification** ❌
**Ligne**: 316-330

**Problème**:
```typescript
const { data: existingTarif } = await supabase
  .from('tarifications')
  .select('id')
  .eq('etablissement_id', etablissement.id)
  .single();  // ❌ ÉCHOUE si aucune tarification

if (existingTarif) {
  await supabase.from('tarifications').update(tarification)...
} else {
  await supabase.from('tarifications').insert({...})...
}
```

**Solution**: Utiliser `.maybeSingle()` ou gérer PGRST116

---

### 3. **Sauvegarde Restauration** ❌
**Ligne**: 334-348
**Problème identique**: `.single()` échoue si pas de données

---

### 4. **Sauvegarde AVP** ❌
**Ligne**: 351-385
**Problème identique**: `.single()` échoue si pas de données

---

### 5. **Chargement Page** ⚠️
**Ligne**: 241-251

**Problème potentiel**:
```typescript
const { data: medias } = await supabase
  .from('medias')
  .select('storage_path')
  .eq('etablissement_id', etabId)
  .order('priority', { ascending: true })
  .limit(1)
  .single();  // ❌ Échoue si pas de média

if (medias) {
  setMainImage(medias.storage_path);
}
```

**Impact**: Si établissement sans photo → erreur au chargement

---

## Comparaison avec Create (Fonctionne Bien)

### ✅ create/page.tsx utilise:
1. **Pas de .single()** sur les lookups optionnels
2. **Gestion d'erreur explicite** partout
3. **Validation avant insertion**
4. **Utilise des composants dédiés** (ImageUpload)

### ❌ edit/[id]/page.tsx utilise:
1. **.single() partout** → source de bugs
2. **Pas de gestion PGRST116**
3. **Pas de validation**
4. **Upload manuel** au lieu de composant

---

## Plan de Correction

### Priorité 1: Remplacer tous les .single()
```typescript
// Avant
const { data } = await supabase.from('table').select().eq('id', x).single();

// Après (Option A - maybeSingle)
const { data } = await supabase.from('table').select().eq('id', x).maybeSingle();

// Après (Option B - gestion erreur)
const { data, error } = await supabase.from('table').select().eq('id', x).single();
if (error && error.code !== 'PGRST116') throw error;
```

### Priorité 2: Pattern Upsert Standard
```typescript
// Au lieu de check + insert/update
const { error } = await supabase
  .from('table')
  .upsert({
    id: existingId || undefined,  // undefined = insert, id = update
    etablissement_id: etabId,
    ...data
  }, {
    onConflict: 'etablissement_id'  // ou la clé unique
  });
```

### Priorité 3: Upload d'Image Robuste
```typescript
// 1. Chercher médias existants (peut être vide)
const { data: existingMedias } = await supabase
  .from('medias')
  .select('id')
  .eq('etablissement_id', etablissement.id);

// 2. Supprimer TOUS les médias existants
if (existingMedias && existingMedias.length > 0) {
  await supabase
    .from('medias')
    .delete()
    .in('id', existingMedias.map(m => m.id));
}

// 3. Insérer nouveau média
const { error } = await supabase.from('medias').insert({...});
```

---

## Fichiers à Modifier

| Fichier | Lignes | Action |
|---------|--------|--------|
| edit/[id]/page.tsx | 241-251 | Chargement image: maybeSingle() |
| edit/[id]/page.tsx | 480-520 | Upload image: liste médias au lieu de single |
| edit/[id]/page.tsx | 316-330 | Tarification: maybeSingle() |
| edit/[id]/page.tsx | 334-348 | Restauration: maybeSingle() |
| edit/[id]/page.tsx | 351-385 | AVP: maybeSingle() |

---

## Tests Requis Post-Fix

1. ✅ Upload image sur établissement SANS photo
2. ✅ Upload image sur établissement AVEC photo existante
3. ✅ Save établissement SANS tarification existante
4. ✅ Save établissement AVEC tarification existante
5. ✅ Save établissement SANS restauration
6. ✅ Save établissement SANS AVP
7. ✅ Édition propriétaire (réclamation approuvée)
8. ✅ Édition gestionnaire (créateur original)

---

## Statistiques

- **Bugs critiques**: 5
- **Bugs potentiels**: 3
- **Lignes à modifier**: ~100
- **Pattern à corriger**: `.single()` → `.maybeSingle()` (8 occurrences)
