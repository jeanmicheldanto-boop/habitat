# ✅ Mapping Organisation → Gestionnaire

## 📌 Problème résolu

Le champ `gestionnaire` dans la table `etablissements` est de type **TEXT** et doit contenir le **nom de l'organisation**, pas un UUID.

**Ancienne approche (incorrecte)** :
- ❌ On essayait de stocker l'UUID du gestionnaire
- ❌ Nécessitait une jointure complexe avec la table profiles
- ❌ Incompatible avec les établissements existants (créés en masse)

**Nouvelle approche (correcte)** :
- ✅ On récupère `organisation` depuis le profil
- ✅ On passe directement le nom dans `payload.gestionnaire`
- ✅ Le nom est stocké tel quel dans `etablissements.gestionnaire`
- ✅ Pas de jointure nécessaire, affichage direct

---

## 🔧 Modifications effectuées

### 1. **Formulaire de création** (`src/app/gestionnaire/create/page.tsx`)

#### Ajout d'un state pour l'organisation
```typescript
const [userOrganisation, setUserOrganisation] = useState<string>('');
```

#### Récupération lors de l'authentification
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role, organisation')  // ← Ajouter organisation
  .eq('id', user.id)
  .single();

setUserOrganisation(profile?.organisation || '');
```

#### Passage dans le payload
```typescript
payload: {
  ...formData,
  commune: formData.ville,
  adresse_l1: formData.adresse,
  gestionnaire: userOrganisation,  // ← Nom de l'organisation (pas UUID)
  // ...
}
```

### 2. **Approval code** (`src/app/admin/propositions/[id]/page.tsx`)

#### Mapping simplifié
```typescript
// Mapper le nom de l'organisation vers gestionnaire (text)
if (!etablissementData.gestionnaire && payload.gestionnaire) {
  etablissementData.gestionnaire = String(payload.gestionnaire);
}
```

**Avant** : Complexe avec UUID + fallback sur created_by
**Après** : Simple copie du nom depuis le payload

### 3. **Modération rapide** (`src/app/admin/propositions/page.tsx`)

Même modification que dans la page de détail.

---

## 📊 Résultat

### Base de données
| Champ | Type | Contenu |
|-------|------|---------|
| `etablissements.gestionnaire` | TEXT | `"Danto et frère"` |
| `profiles.organisation` | TEXT | `"Danto et frère"` |

### Affichage
```typescript
// Simple ! Pas de jointure nécessaire
<div>
  <span>Gestionnaire :</span>
  <span>{etablissement.gestionnaire}</span>
  {/* Affiche directement "Danto et frère" */}
</div>
```

### Si besoin de plus d'infos
Si vous voulez aussi afficher le contact du gestionnaire (nom, email, etc.), vous pouvez :

**Option A** : Ajouter ces infos dans le payload au moment de la création
```typescript
payload: {
  gestionnaire: userOrganisation,
  gestionnaire_email: user.email,  // Si besoin
  gestionnaire_nom: `${profile.prenom} ${profile.nom}`,  // Si besoin
}
```

**Option B** : Stocker `created_by` (UUID) ET `gestionnaire` (nom) séparément
- `gestionnaire` = Nom de l'organisation (pour affichage)
- `created_by` = UUID (pour retrouver le profil complet si besoin)

---

## 🧪 Test

**Commande** : `node test-organisation-mapping.js`

**Résultat attendu** :
```
✅ Profil trouvé: organisation = "Danto et frère"
✅ Payload contiendrait: gestionnaire = "Danto et frère"
✅ Pas besoin de jointure
```

---

## 🎯 Avantages de cette approche

1. **Simple** : Un seul champ TEXT, pas de foreign key
2. **Compatible** : Fonctionne avec les établissements existants
3. **Performant** : Pas de jointure nécessaire pour l'affichage
4. **Flexible** : Le champ peut contenir n'importe quel texte (nom d'organisation, nom de personne, etc.)
5. **Lisible** : Les données sont directement compréhensibles en SQL

---

## 📝 Notes

- Les établissements créés **avant** cette modification n'ont pas de gestionnaire
- Les établissements créés **après** auront le nom de l'organisation
- Si un gestionnaire modifie son `organisation` dans son profil, les établissements existants ne seront pas mis à jour (c'est normal, c'est une copie)
- Si vous voulez un lien dynamique, il faudrait utiliser `created_by` (UUID) pour la relation, et `gestionnaire` uniquement pour l'affichage
