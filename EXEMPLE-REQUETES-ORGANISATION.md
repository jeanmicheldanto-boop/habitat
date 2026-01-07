# 📋 Comment récupérer et afficher l'organisation du gestionnaire

## ✅ Le mapping est correct dans le code actuel

Le champ `gestionnaire` dans `etablissements` stocke bien l'UUID du profil.
Pour afficher l'organisation, il faut faire une jointure SQL.

---

## 🔍 Exemples de requêtes avec jointure

### 1. **Récupérer UN établissement avec l'organisation**

```typescript
const { data, error } = await supabase
  .from('etablissements')
  .select(`
    *,
    profiles!etablissements_gestionnaire_fkey(
      organisation,
      nom,
      prenom,
      email
    )
  `)
  .eq('id', etablissementId)
  .single();

// Résultat :
// data.nom = "Résidence Ossun"
// data.profiles.organisation = "Danto et frère"
// data.profiles.nom = "genevaux"
// data.profiles.prenom = "Loic"
```

### 2. **Récupérer TOUS les établissements avec organisation**

```typescript
const { data, error } = await supabase
  .from('etablissements')
  .select(`
    *,
    profiles!etablissements_gestionnaire_fkey(
      organisation,
      nom,
      prenom,
      email
    )
  `)
  .order('created_at', { ascending: false });

// Résultat : tableau avec data[i].profiles.organisation
```

### 3. **Afficher dans l'interface**

```tsx
{data?.profiles?.organisation && (
  <div>
    <span className="text-sm text-gray-500">Géré par :</span>
    <span className="font-medium">{data.profiles.organisation}</span>
  </div>
)}

{/* Ou afficher le nom si pas d'organisation */}
<div>
  <span className="text-sm text-gray-500">Gestionnaire :</span>
  <span className="font-medium">
    {data.profiles?.organisation || 
     `${data.profiles?.prenom} ${data.profiles?.nom}` ||
     'Non renseigné'}
  </span>
</div>
```

---

## 📝 Fichiers à modifier

### A. **Dashboard gestionnaire** - Afficher les établissements gérés

**Fichier** : `src/app/gestionnaire/dashboard/page.tsx`

**Ajouter** une requête pour charger les établissements du gestionnaire :

```typescript
// Dans loadData()
const { data: etabsData } = await supabase
  .from('etablissements')
  .select(`
    *,
    profiles!etablissements_gestionnaire_fkey(
      organisation,
      nom,
      prenom
    )
  `)
  .eq('gestionnaire', userId)
  .order('created_at', { ascending: false });

if (etabsData) setEtablissements(etabsData);
```

### B. **Page de détail établissement** - Afficher l'organisation

**Fichier** : `src/app/admin/etablissements/[id]/edit/page.tsx`

**Modifier** la requête ligne ~57 :

```typescript
// Avant :
const { data, error: err } = await supabase
  .from("etablissements")
  .select("*")
  .eq("id", id)
  .single();

// Après :
const { data, error: err } = await supabase
  .from("etablissements")
  .select(`
    *,
    profiles!etablissements_gestionnaire_fkey(
      organisation,
      nom,
      prenom,
      email
    )
  `)
  .eq("id", id)
  .single();
```

### C. **Liste des établissements admin** - Afficher l'organisation

**Fichier** : `src/app/admin/etablissements/page.tsx`

**Ajouter** la jointure dans la requête principale :

```typescript
const { data, error } = await supabase
  .from('etablissements')
  .select(`
    *,
    profiles!etablissements_gestionnaire_fkey(
      organisation,
      nom,
      prenom
    )
  `)
  .order('created_at', { ascending: false });
```

---

## 🎯 Syntaxe importante

### **Clé étrangère nommée** (Foreign Key)

```typescript
profiles!etablissements_gestionnaire_fkey(...)
```

- `profiles` = table à joindre
- `etablissements_gestionnaire_fkey` = nom de la clé étrangère dans Supabase
- `(organisation, nom, prenom)` = champs à récupérer

### **Alternative : Si pas de foreign key nommée**

```typescript
profiles:gestionnaire(organisation, nom, prenom)
```

- `profiles:gestionnaire` = joindre `profiles` via le champ `gestionnaire`

---

## 🧪 Tester la requête

**1. Via terminal Node.js :**

```bash
node -e "
(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://minwoumfgutampcgrcbr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.JlzAqMD7HEvM5XFP3Yc13qbnKdXtB6e5EuV6W7xXnKs'
  );
  
  const { data, error } = await supabase
    .from('etablissements')
    .select(\`
      id,
      nom,
      commune,
      gestionnaire,
      profiles!etablissements_gestionnaire_fkey(
        organisation,
        nom,
        prenom
      )
    \`)
    .limit(3);
  
  console.log(JSON.stringify(data, null, 2));
})();
"
```

**2. Via SQL (dans Supabase Studio) :**

```sql
SELECT 
  e.id,
  e.nom,
  e.commune,
  e.gestionnaire,
  p.organisation,
  p.nom as gestionnaire_nom,
  p.prenom as gestionnaire_prenom
FROM etablissements e
LEFT JOIN profiles p ON e.gestionnaire::uuid = p.id
LIMIT 10;
```

---

## 🚀 Résumé

| Action | Statut | Détail |
|--------|--------|--------|
| **Enregistrement gestionnaire** | ✅ Correct | `gestionnaire_id` → `gestionnaire` (UUID) |
| **Récupération organisation** | ⚠️ À faire | Ajouter jointure dans requêtes SELECT |
| **Affichage interface** | ⚠️ À faire | Utiliser `data.profiles.organisation` |

**⚡ Prochaine étape** : Modifier les fichiers listés ci-dessus pour ajouter les jointures.
