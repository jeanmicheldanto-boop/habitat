# Plan d'Optimisation des Performances de la Plateforme

## 📊 Diagnostic des Problèmes de Performance

### Symptômes Observés
- ⏱️ **Autocomplétion lente** lors de la recherche
- ⏱️ **Liste et carte prenant ~5 secondes** à s'afficher
- 💰 **Contraintes** : Vercel gratuit + Supabase Pro (micro compute)

---

## 🔍 Analyse des Causes

### 1. ⚠️ **CRITIQUE : Chargement Massif Initial**
**Localisation** : [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx#L223-L248)

```tsx
// PROBLÈME : Charge TOUS les établissements au démarrage
while (hasMore) {
  const { data: rows, error: err } = await supabase
    .from("v_liste_publication_geoloc")
    .select("*")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  allRows.push(...rows);
}
```

**Impact** :
- 🔴 Charge potentiellement 1000+ établissements dès le chargement
- 🔴 Transfert réseau massif (plusieurs Mo de données)
- 🔴 Temps de réponse de 5+ secondes
- 🔴 Consommation excessive des ressources Supabase (micro compute)

### 2. ⚠️ **CRITIQUE : Vue Complexe avec Sous-Requêtes**
**Localisation** : [`supabase/schema.sql`](supabase/schema.sql#L970-L1060)

La vue `v_liste_publication_geoloc` contient **11 sous-requêtes** pour chaque ligne :
- Sous-catégories (JOIN + aggregation)
- Services (JOIN + aggregation)
- Tarifications (ORDER BY + LIMIT 1)
- Disponibilités (ORDER BY + LIMIT 1)
- Médias/images (ORDER BY + LIMIT 1)
- Restaurations (LIMIT 1)
- Logements types (JSON aggregation)
- etc.

**Impact** :
- 🔴 Chaque établissement nécessite ~11 requêtes supplémentaires
- 🔴 Pour 500 établissements = ~5500 sous-requêtes
- 🔴 Surcharge énorme sur micro compute Supabase

### 3. ⚠️ **Filtrage Côté Client vs Serveur**
**Localisation** : [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx#L437-L619)

```tsx
// Tous les filtres sont appliqués APRÈS avoir chargé toutes les données
function getFilteredData(): Etablissement[] {
  const filtered = data.filter((etab: Etablissement) => {
    // 300+ lignes de logique de filtrage côté client
  });
}
```

**Impact** :
- 🔴 Données inutiles transférées sur le réseau
- 🔴 Temps de traitement JavaScript côté client
- 🔴 Pas d'optimisation des requêtes SQL

### 4. ⚠️ **Index Manquants**
**Problème** : Plusieurs colonnes fréquemment utilisées n'ont pas d'index

Index Manquants :
```sql
-- Filtres fréquemment utilisés
- etablissements.statut_editorial (utilisé dans les vues)
- etablissements.departement (filtrage géographique)
- etablissements.habitat_type (filtrage par type)
- etablissements.eligibilite_statut (filtrage AVP)

-- Tables de jointure
- etablissement_service.etablissement_id
- etablissement_sous_categorie.etablissement_id  
- medias.etablissement_id + priority
- restaurations.etablissement_id
- logements_types.etablissement_id
- disponibilites.etablissement_id + date_capture
```

Index Existants (bons) :
- ✅ `idx_etablissements_nom` (GIN trgm)
- ✅ `idx_etablissements_commune` (GIN trgm)
- ✅ `idx_etablissements_geom` (GIST)

### 5. ⚠️ **Pas de Cache**
- Aucun cache HTTP
- Aucun cache côté client (React Query, SWR, etc.)
- Rechargement complet à chaque visite

### 6. ⚠️ **Autocomplétion : Requêtes Multiples**
**Localisation** : [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx#L293-L382)

```tsx
// 3 requêtes séparées pour chaque saisie
const { data: depts } = await supabase.from('v_liste_publication_geoloc')...
const { data: communes } = await supabase.from('v_liste_publication_geoloc')...
const { data: etabs } = await supabase.from('v_liste_publication_geoloc')...
```

**Impact** :
- 🟡 3 requêtes réseau pour chaque frappe clavier (avec debounce 200ms)
- 🟡 Chaque requête scanne la vue complexe

---

## 🎯 Plan d'Optimisation par Priorité

### 🔥 **PHASE 1 : Impact Immédiat (Quick Wins)**

#### 1.1. Pagination Côté Serveur
**Gain attendu** : 🚀 90% de réduction du temps de chargement initial

**Action** :
```tsx
// Remplacer le chargement massif par une pagination
const ITEMS_PER_PAGE = 20;

const { data, count, error } = await supabase
  .from("v_liste_publication_geoloc")
  .select("*", { count: 'exact' })
  .range(0, ITEMS_PER_PAGE - 1);
```

**Avantages** :
- Charge uniquement 20 établissements au lieu de 1000+
- Temps de réponse < 1 seconde
- Réduction drastique de l'utilisation des ressources

**Fichiers à modifier** :
- [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx#L223-L248)

#### 1.2. Déplacer les Filtres Côté Serveur
**Gain attendu** : 🚀 50-70% de réduction du temps de filtrage

**Action** :
```tsx
// Au lieu de charger tout puis filtrer
let query = supabase.from("v_liste_publication_geoloc").select("*");

if (selectedDepartement) {
  query = query.ilike('departement', `%${selectedDepartement}%`);
}
if (selectedCommune) {
  query = query.ilike('commune', `%${selectedCommune}%`);
}
if (selectedHabitatCategories.length > 0) {
  query = query.in('habitat_type', selectedHabitatCategories);
}
if (search) {
  query = query.or(`nom.ilike.%${search}%,commune.ilike.%${search}%`);
}
// etc.
```

**Avantages** :
- Filtrage optimisé par PostgreSQL
- Utilisation des index
- Moins de données transférées

**Fichiers à modifier** :
- [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx#L223-L248)

#### 1.3. Ajouter les Index Manquants
**Gain attendu** : 🚀 40-60% de réduction du temps de requête avec filtres

**Action** : Créer un fichier de migration

```sql
-- Migration: 007_performance_indexes.sql

-- Index sur colonnes fréquemment filtrées
CREATE INDEX IF NOT EXISTS idx_etablissements_statut_editorial 
  ON etablissements(statut_editorial);

CREATE INDEX IF NOT EXISTS idx_etablissements_departement 
  ON etablissements USING gin(departement gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_etablissements_habitat_type 
  ON etablissements(habitat_type);

CREATE INDEX IF NOT EXISTS idx_etablissements_eligibilite_statut 
  ON etablissements(eligibilite_statut);

-- Index sur tables de jointure (accélère les sous-requêtes de la vue)
CREATE INDEX IF NOT EXISTS idx_etablissement_service_etab_id 
  ON etablissement_service(etablissement_id);

CREATE INDEX IF NOT EXISTS idx_etablissement_sous_categorie_etab_id 
  ON etablissement_sous_categorie(etablissement_id);

CREATE INDEX IF NOT EXISTS idx_medias_etab_priority 
  ON medias(etablissement_id, priority, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurations_etab_id 
  ON restaurations(etablissement_id);

CREATE INDEX IF NOT EXISTS idx_logements_types_etab_id 
  ON logements_types(etablissement_id);

CREATE INDEX IF NOT EXISTS idx_disponibilites_etab_date 
  ON disponibilites(etablissement_id, date_capture DESC);

CREATE INDEX IF NOT EXISTS idx_tarifications_etab_date 
  ON tarifications(etablissement_id, date_observation DESC);
```

**Fichier à créer** :
- `supabase/migrations/007_performance_indexes.sql`

---

### 🚀 **PHASE 2 : Optimisations Structurelles (Impact Majeur)**

#### 2.1. Créer une Vue Matérialisée
**Gain attendu** : 🚀 70-80% de réduction du temps de requête

**Problème** : La vue `v_liste_publication_geoloc` est recalculée à chaque requête

**Solution** : Vue matérialisée rafraîchie périodiquement

```sql
-- Créer la vue matérialisée
CREATE MATERIALIZED VIEW mv_liste_publication_geoloc AS
SELECT * FROM v_liste_publication_geoloc;

-- Index sur la vue matérialisée
CREATE INDEX idx_mv_liste_nom ON mv_liste_publication_geoloc USING gin(nom gin_trgm_ops);
CREATE INDEX idx_mv_liste_commune ON mv_liste_publication_geoloc USING gin(commune gin_trgm_ops);
CREATE INDEX idx_mv_liste_departement ON mv_liste_publication_geoloc USING gin(departement gin_trgm_ops);
CREATE INDEX idx_mv_liste_habitat_type ON mv_liste_publication_geoloc(habitat_type);
CREATE INDEX idx_mv_liste_geom ON mv_liste_publication_geoloc USING gist(geom);

-- Fonction de rafraîchissement
CREATE OR REPLACE FUNCTION refresh_mv_liste_publication()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_liste_publication_geoloc;
END;
$$ LANGUAGE plpgsql;

-- Trigger de rafraîchissement (à chaque modification d'établissement)
CREATE OR REPLACE FUNCTION trigger_refresh_mv()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_mv_liste_publication();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
CREATE TRIGGER refresh_mv_on_update
AFTER INSERT OR UPDATE OR DELETE ON etablissements
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_mv();
```

**Avantages** :
- ✅ Calcul des sous-requêtes fait une seule fois
- ✅ Lectures ultra-rapides 
- ✅ Mise à jour seulement quand les données changent

**Note** : Sur Supabase gratuit, utiliser un CRON job ou rafraîchir manuellement. Sur Pro, utiliser pg_cron.

#### 2.2. Implémenter le Caching HTTP
**Gain attendu** : 🚀 Réponse instantanée pour requêtes répétées

**Next.js (App Router)** :
```tsx
// Dans src/app/api/etablissements/route.ts
export const revalidate = 3600; // Cache 1 heure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Récupération des filtres
  
  const { data } = await supabase
    .from("mv_liste_publication_geoloc") // Utiliser la vue matérialisée
    .select("*")
    .range(0, 19);
    
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

**Puis dans le composant** :
```tsx
// Utiliser l'API Route au lieu d'appeler Supabase directement
const response = await fetch('/api/etablissements?page=1&filters=...');
const data = await response.json();
```

**Avantages** :
- ✅ Cache Vercel Edge Network (même sur gratuit)
- ✅ Réduit les appels Supabase
- ✅ Serving ultra-rapide depuis le CDN

#### 2.3. React Query / SWR pour Cache Client
**Gain attendu** : 🚀 Navigation instantanée, réduction des requêtes

**Installation** :
```bash
npm install @tanstack/react-query
```

**Configuration** :
```tsx
// src/app/plateforme/page.tsx
import { useQuery } from '@tanstack/react-query';

function PlateformeContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['etablissements', filters],
    queryFn: () => fetchEtablissements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

**Avantages** :
- ✅ Cache en mémoire navigateur
- ✅ Rafraîchissement automatique en arrière-plan
- ✅ Retry automatique
- ✅ Pas de requêtes dupliquées

---

### 🎨 **PHASE 3 : Optimisations UX (Impact Perceptif)**

#### 3.1. Optimiser l'Autocomplétion
**Action** :
```tsx
// Utiliser une seule requête avec textSearch
const { data } = await supabase
  .rpc('search_autocomplete', { 
    query: search 
  });

// Côté Supabase : créer une fonction SQL optimisée
CREATE OR REPLACE FUNCTION search_autocomplete(query TEXT)
RETURNS TABLE (
  type TEXT,
  value TEXT,
  label TEXT,
  metadata TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Départements
  SELECT 
    'departement'::TEXT, 
    departement, 
    departement, 
    '📍 Département'::TEXT
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND departement ILIKE '%' || query || '%'
  GROUP BY departement
  LIMIT 3
  
  UNION ALL
  
  -- Communes
  SELECT 
    'commune'::TEXT, 
    commune, 
    commune || ' (' || departement || ')', 
    '🏘️ Commune'::TEXT
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND commune ILIKE '%' || query || '%'
  GROUP BY commune, departement
  LIMIT 5
  
  UNION ALL
  
  -- Établissements
  SELECT 
    'etablissement'::TEXT, 
    id::TEXT, 
    nom, 
    '🏠 ' || commune
  FROM etablissements
  WHERE statut_editorial = 'publie' 
    AND nom ILIKE '%' || query || '%'
  LIMIT 5;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Avantages** :
- ✅ 1 seule requête au lieu de 3
- ✅ Optimisée et compilée côté serveur
- ✅ Utilise les index efficacement

#### 3.2. Ajouter des Skeletons/Placeholders
**Action** :
```tsx
{loading ? (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    ))}
  </div>
) : (
  // Contenu réel
)}
```

**Avantages** :
- ✅ Perception de rapidité
- ✅ Meilleure UX pendant le chargement

#### 3.3. Lazy Loading de la Carte
**Problème** : La carte Leaflet charge toutes les données même si non visible

**Action** :
```tsx
// Charger la carte uniquement quand l'onglet est actif
{tab === 'carte' && (
  <Suspense fallback={<MapSkeleton />}>
    <EtabMap data={displayedData} />
  </Suspense>
)}
```

---

### ⚡ **PHASE 4 : Optimisations Avancées (Long Terme)**

#### 4.1. Implémenter la Recherche Full-Text (pg_trgm)
**Pour recherches textuelles ultra-rapides**

```sql
-- Extension déjà activée (vu dans les index GIN trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index combiné pour recherche multi-colonnes
CREATE INDEX idx_etablissements_search 
  ON etablissements 
  USING gin((nom || ' ' || COALESCE(presentation, '') || ' ' || commune) gin_trgm_ops);
```

#### 4.2. Considérer Edge Functions pour l'API
**Si besoin de logique serveur complexe**

Avantages :
- ✅ Exécution au plus près de l'utilisateur
- ✅ Pas de cold start (Vercel Edge)

#### 4.3. Upgrade Compute Supabase
**Si budget le permet**

- Passer de **Micro** à **Small** compute
- Gain : 2x CPU, 2x RAM
- Coût : ~$10-15/mois supplémentaires

---

## 📋 Checklist d'Implémentation Recommandée

### Semaine 1 (Impact Immédiat) ✅
- [ ] Implémenter pagination côté serveur (20 items/page)
- [ ] Déplacer filtres de base côté serveur (departement, commune, search)
- [ ] Ajouter les index manquants (migration SQL)
- [ ] Tester les performances

### Semaine 2 (Optimisations Structurelles) ⚡
- [ ] Créer vue matérialisée `mv_liste_publication_geoloc`
- [ ] Implémenter API Routes Next.js avec cache
- [ ] Installer React Query et migrer les fetches
- [ ] Optimiser la fonction d'autocomplétion (RPC unique)

### Semaine 3 (Polissage UX) 🎨
- [ ] Ajouter skeletons de chargement
- [ ] Lazy loading de la carte
- [ ] Optimiser les images (next/image)
- [ ] Tests de charge

### Optionnel (Long Terme) 🚀
- [ ] Index full-text search combiné
- [ ] Monitoring des performances (Vercel Analytics)
- [ ] Considérer upgrade compute Supabase si nécessaire

---

## 📈 Gains Attendus

### Avant Optimisation
- ⏱️ Temps de chargement initial : **5+ secondes**
- 📦 Données transférées : **2-5 Mo**
- 🔄 Requêtes Supabase : **1000+ lignes**

### Après Phase 1 (Quick Wins)
- ⏱️ Temps de chargement initial : **< 1 seconde** (80% plus rapide)
- 📦 Données transférées : **< 100 Ko** (95% de réduction)
- 🔄 Requêtes Supabase : **20 lignes**

### Après Phase 2 (Optimisations Structurelles)
- ⏱️ Temps de chargement initial : **< 500ms** (90% plus rapide)
- 📦 Données en cache : **Réutilisable pendant 1h**
- 🔄 Requêtes Supabase : **Divisées par 10** (cache)

### Après Phase 3 (UX)
- ⏱️ Perception de rapidité : **Instantanée**
- 🎯 Autocomplétion : **< 200ms** (au lieu de 500ms+)

---

## 🎯 Recommandations Finales

### Priorité ABSOLUE 🔥
1. **Pagination côté serveur** - Sans cela, rien d'autre ne résoudra le problème fondamental
2. **Filtres côté serveur** - Réduire drastiquement les données transférées
3. **Index manquants** - Essentiel pour les performances avec micro compute

### Si Vous N'Avez le Temps que pour UNE Chose
👉 **Implémenter la pagination côté serveur** (1.1)
- Impact : 90% d'amélioration
- Effort : 2-3 heures
- Fichier : [`src/app/plateforme/page.tsx`](src/app/plateforme/page.tsx)

### Budget vs Performance
| Compute | Coût/mois | Performance | Recommandation |
|---------|-----------|-------------|----------------|
| Micro | Inclus Pro | Limitée | ✅ OK si optimisations Phase 1+2 |
| Small | +$10 | 2x | Considérer après Phase 1+2 si encore lent |
| Medium | +$40 | 4x | Pas nécessaire pour ce use case |

**Verdict** : Avec les optimisations Phase 1 et 2, le compute Micro devrait suffire.

---

## 📞 Support Technique

Si besoin d'aide pour l'implémentation :
1. Commencer par la Phase 1 (quick wins)
2. Mesurer les résultats (Chrome DevTools Network tab)
3. Itérer sur Phase 2 si nécessaire

**Outils de monitoring recommandés** :
- Vercel Analytics (gratuit sur plan Pro)
- Supabase Dashboard "Disk IO" et "CPU Usage"
- Chrome DevTools Performance tab

---

*Document généré le 15 février 2026*
