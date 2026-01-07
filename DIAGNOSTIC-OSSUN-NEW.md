# État de l'établissement "maison sainte michelle ossun"

## ✅ Ce qui est CORRECT dans la base de données

| Champ | Valeur actuelle | Statut |
|-------|----------------|--------|
| `habitat_type` | `"logement_independant"` | ✅ Correct |
| Sous-catégorie | `["village_seniors"]` | ✅ Correct |
| Gestionnaire | `"Danto et frère"` | ✅ Correct |
| Commune | `"Ossun"` | ✅ Correct |
| Coordonnées | `-0.022804, 43.185971` | ✅ Correct |

## ❌ Ce qui manque

| Élément | Statut | Raison |
|---------|--------|--------|
| Photo (`image_path`) | ❌ NULL | Le fichier n'a pas été uploadé au bon endroit dans le storage |

## 📊 Vue v_liste_publication_geoloc

La vue retourne correctement :
```json
{
  "habitat_type": "logement_independant",
  "sous_categories": ["village_seniors"]
}
```

## 🎯 Mapping dans habitatTaxonomy.ts

- **Catégorie** : `logement_independant` → "Logement indépendant" 🏠
- **Sous-catégorie** : `village_seniors` → "Village seniors"

## ❓ Problème signalé

L'utilisateur voit "habitat alternatif" au lieu de "Logement indépendant".

### Hypothèses

1. **Cache navigateur** : L'ancien affichage est mis en cache
   - Solution : Vider le cache / Ctrl+Shift+R

2. **Mapping front-end** : Le code confond les catégories
   - À vérifier : Où exactement "habitat alternatif" est affiché ?

3. **Vue ou API** : Problème dans la requête
   - ✅ Écarté : La vue retourne les bonnes données

## 🔍 Commandes de vérification

### Vérifier la base
```bash
node -e "(async()=>{const{createClient}=require('@supabase/supabase-js');const s=createClient('https://minwoumfgutampcgrcbr.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng');const{data}=await s.from('v_liste_publication_geoloc').select('nom,habitat_type,sous_categories').eq('nom','maison sainte michelle ossun').single();console.log(JSON.stringify(data,null,2));})();"
```

Résultat attendu :
```json
{
  "nom": "maison sainte michelle ossun",
  "habitat_type": "logement_independant",
  "sous_categories": ["village_seniors"]
}
```

## 🛠️ Actions à entreprendre

1. **Identifier où "habitat alternatif" est affiché**
   - Page spécifique ?
   - Composant particulier ?

2. **Vérifier le mapping dans le code d'affichage**
   - Chercher comment `habitat_type` est transformé en label

3. **Pour la photo** : Demander au gestionnaire de la re-uploader depuis son dashboard
