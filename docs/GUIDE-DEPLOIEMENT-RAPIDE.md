# Guide de Déploiement Rapide - Optimisations Performance

## 🎯 Objectif

Ce guide vous permet d'implémenter les optimisations de performance en **moins de 2 heures** pour obtenir un gain de **90% sur le temps de chargement**.

---

## ⏱️ Timeline d'Implémentation

| Phase | Durée | Gain | Priorité |
|-------|-------|------|----------|
| **Phase 1A** - Index SQL | 15 min | 40% | 🔥 CRITIQUE |
| **Phase 1B** - Pagination serveur | 45 min | 90% | 🔥 CRITIQUE |
| **Phase 2** - Vue matérialisée | 30 min | 70% | ⚡ Important |
| **Phase 3** - Autocomplétion | 20 min | 89% | ⚡ Important |
| **Phase 4** - Cache API Route | 30 min | 95% | 📈 Recommandé |

**Total minimum** : 1h (Phase 1A + 1B) pour 90% d'amélioration
**Total recommandé** : 2h20 (toutes phases) pour performances optimales

---

## 🚀 Phase 1A: Index SQL (15 minutes)

### Fichier: `supabase/migrations/007_performance_indexes.sql`

**✅ Action: Appliquer la migration des index**

```bash
# Option 1: Via Supabase CLI
supabase db push

# Option 2: Via Dashboard Supabase
# 1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# 2. Copier le contenu de 007_performance_indexes.sql
# 3. Cliquer "Run"
```

**✅ Vérification:**

```sql
-- Dans le SQL Editor Supabase, exécuter:
SELECT 
  indexname, 
  tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_etablissements%'
ORDER BY tablename, indexname;

-- Devrait retourner ~10 nouveaux index
```

**⏱️ Durée:** 15 minutes
**🎯 Gain:** 40-60% sur les requêtes filtrées

---

## 🚀 Phase 1B: Pagination Côté Serveur (45 minutes)

### Fichier: `src/app/plateforme/page.tsx`

**✅ Étape 1: Remplacer la fonction de fetch (20 min)**

Localiser le `useEffect` aux lignes 223-248 :

```tsx
// ❌ SUPPRIMER CETTE SECTION (lignes 223-248)
useEffect(() => {
  async function fetchData() {
    const allRows: Etablissement[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: rows, error: err } = await supabase
        .from("v_liste_publication_geoloc")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1);
      // ... reste du code
    }
  }
  fetchData();
}, []);
```

**✅ REMPLACER PAR:**

Copier le code de `docs/EXEMPLE-PAGINATION-OPTIMISEE.tsx` (fonction `fetchEtablissementsOptimized`)

```tsx
// ✅ NOUVEAU CODE
const ITEMS_PER_PAGE = 25;
const [currentPage, setCurrentPage] = useState(0);
const [totalCount, setTotalCount] = useState(0);

useEffect(() => {
  async function loadData() {
    setLoading(true);
    
    // Construction de la requête avec filtres côté serveur
    let query = supabase
      .from("v_liste_publication_geoloc")
      .select("*", { count: "exact" });

    // Appliquer les filtres
    if (search) {
      query = query.or(
        `nom.ilike.%${search}%,commune.ilike.%${search}%,departement.ilike.%${search}%`
      );
    }
    if (selectedDepartement) {
      query = query.ilike('departement', `%${selectedDepartement}%`);
    }
    // ... autres filtres

    // Pagination
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data: rows, error, count } = await query;
    
    if (error) {
      setError(error.message);
    } else {
      setData(rows || []);
      setTotalCount(count || 0);
    }
    
    setLoading(false);
  }
  
  loadData();
}, [currentPage, search, selectedDepartement, /* autres filtres */]);
```

**✅ Étape 2: Supprimer le filtrage côté client (10 min)**

```tsx
// ❌ SUPPRIMER la fonction getFilteredData() (lignes 437-619)
// Elle n'est plus nécessaire car le filtrage se fait côté serveur

// ❌ REMPLACER dans le rendu:
// const filtered = getFilteredData();

// ✅ NOUVEAU:
// Utiliser directement 'data' qui est déjà filtré par le serveur
```

**✅ Étape 3: Ajouter les contrôles de pagination (15 min)**

```tsx
// Ajouter avant le rendu de la liste
<div className="pagination-controls flex justify-between items-center mb-4">
  <button
    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
    disabled={currentPage === 0}
    className="btn"
  >
    ← Précédent
  </button>

  <span>
    Page {currentPage + 1} / {Math.ceil(totalCount / ITEMS_PER_PAGE)} 
    ({totalCount} résultats)
  </span>

  <button
    onClick={() => setCurrentPage(prev => prev + 1)}
    disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount}
    className="btn"
  >
    Suivant →
  </button>
</div>
```

**⏱️ Durée:** 45 minutes
**🎯 Gain:** 90% sur le temps de chargement initial

---

## 🚀 Phase 2: Vue Matérialisée (30 minutes)

### Fichier: `supabase/migrations/008_create_materialized_view.sql`

**✅ Étape 1: Créer la vue matérialisée (10 min)**

```bash
# Appliquer la migration
supabase db push

# OU via Dashboard Supabase SQL Editor
```

**✅ Étape 2: Rafraîchir manuellement la première fois (2 min)**

```sql
-- Dans SQL Editor Supabase
SELECT refresh_mv_liste_publication();
```

**✅ Étape 3: Mettre à jour le code frontend (10 min)**

```tsx
// Dans src/app/plateforme/page.tsx
// Ligne ~235

// ❌ ANCIEN:
.from("v_liste_publication_geoloc")

// ✅ NOUVEAU:
.from("mv_liste_publication_geoloc") // Vue matérialisée
```

**✅ Étape 4: Configurer le rafraîchissement automatique (8 min)**

**Option A: Vercel Cron (Recommandé si Vercel Pro)**

Créer `src/app/api/cron/refresh-view/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Vérifier le secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.rpc('refresh_mv_liste_publication');
  
  return NextResponse.json({ success: true });
}
```

Ajouter dans `vercel.json` :

```json
{
  "crons": [{
    "path": "/api/cron/refresh-view",
    "schedule": "*/30 * * * *"
  }]
}
```

**Option B: Manuel (Plan gratuit)**

Appeler manuellement après chaque modification importante :

```sql
SELECT refresh_mv_liste_publication();
```

**⏱️ Durée:** 30 minutes
**🎯 Gain:** 70-80% sur le temps de requête

---

## 🚀 Phase 3: Autocomplétion Optimisée (20 minutes)

### Fichiers concernés
- `supabase/migrations/009_autocomplete_function.sql`
- `src/components/SearchAutocomplete.tsx`
- `src/components/IntegratedSearchBar.tsx`

**✅ Étape 1: Créer la fonction SQL (5 min)**

```bash
# Appliquer la migration
supabase db push
```

**✅ Étape 2: Mettre à jour SearchAutocomplete.tsx (10 min)**

Copier le code de `docs/EXEMPLE-AUTOCOMPLETE-OPTIMISEE.tsx`

```tsx
// ❌ SUPPRIMER les 3 requêtes séparées (lignes ~30-90)

// ✅ REMPLACER PAR:
const { data, error } = await supabase.rpc('search_autocomplete_hybrid', {
  search_query: query,
  max_results: 8
});

if (data) {
  setSuggestions(data);
  setShowSuggestions(true);
}
```

**✅ Étape 3: Mettre à jour IntegratedSearchBar.tsx (5 min)**

Appliquer le même changement que ci-dessus.

**⏱️ Durée:** 20 minutes
**🎯 Gain:** 89% sur l'autocomplétion (900ms → 100ms)

---

## 🚀 Phase 4: Cache API Route (30 minutes)

### Fichier: `src/app/api/etablissements/route.ts`

**✅ Étape 1: Créer l'API Route (15 min)**

Copier le code de `docs/EXEMPLE-API-ROUTE-CACHE.ts`

**✅ Étape 2: Mettre à jour le composant plateforme (10 min)**

```tsx
// Dans src/app/plateforme/page.tsx

// ❌ ANCIEN:
const { data, count } = await supabase
  .from("mv_liste_publication_geoloc")
  .select("*", { count: "exact" })
  // ...

// ✅ NOUVEAU:
const params = new URLSearchParams({
  page: currentPage.toString(),
  limit: '25',
});
if (search) params.append('search', search);
if (selectedDepartement) params.append('departement', selectedDepartement);

const response = await fetch(`/api/etablissements?${params.toString()}`);
const result = await response.json();

setData(result.data);
setTotalCount(result.pagination.total);
```

**✅ Étape 3: Tester le cache (5 min)**

```bash
# Dans Chrome DevTools (Network tab)
# 1. Charger la page
# 2. Recharger la page
# 3. Vérifier que la 2ème requête affiche "(disk cache)" ou "(memory cache)"
```

**⏱️ Durée:** 30 minutes
**🎯 Gain:** 95% pour requêtes répétées (5s → 50ms depuis cache)

---

## ✅ Checklist de Déploiement

### Préparation
- [ ] Sauvegarder la base de données (snapshot Supabase)
- [ ] Créer une branche Git `feature/performance-optimization`
- [ ] Tester en local d'abord

### Phase 1A (Obligatoire - 15 min)
- [ ] Appliquer `007_performance_indexes.sql`
- [ ] Vérifier les index créés
- [ ] Analyser les tables (`ANALYZE etablissements;`)

### Phase 1B (Obligatoire - 45 min)
- [ ] Modifier `src/app/plateforme/page.tsx`
- [ ] Remplacer le chargement massif par pagination
- [ ] Déplacer les filtres côté serveur
- [ ] Ajouter les contrôles de pagination
- [ ] Tester en local

### Phase 2 (Recommandé - 30 min)
- [ ] Appliquer `008_create_materialized_view.sql`
- [ ] Rafraîchir la vue une première fois
- [ ] Mettre à jour le code pour utiliser `mv_liste_publication_geoloc`
- [ ] Configurer le rafraîchissement automatique (Cron ou manuel)

### Phase 3 (Recommandé - 20 min)
- [ ] Appliquer `009_autocomplete_function.sql`
- [ ] Mettre à jour `SearchAutocomplete.tsx`
- [ ] Mettre à jour `IntegratedSearchBar.tsx`
- [ ] Tester l'autocomplétion

### Phase 4 (Optionnel - 30 min)
- [ ] Créer `src/app/api/etablissements/route.ts`
- [ ] Mettre à jour le fetch dans le composant
- [ ] Vérifier le cache HTTP

### Déploiement
- [ ] Commit et push vers Git
- [ ] Déployer sur Vercel
- [ ] Tester en production
- [ ] Monitorer les performances (Vercel Analytics)

---

## 🧪 Tests de Performance

### Avant Optimisation
```bash
# Ouvrir Chrome DevTools > Network
# Charger /plateforme

Métriques attendues AVANT:
- Temps de chargement: 5000-7000ms
- Nombre de requêtes: 1-2 grosses requêtes
- Données transférées: 2-5 Mo
- Temps autocomplétion: 500-900ms
```

### Après Optimisation
```bash
# Recharger /plateforme après Phase 1B

Métriques attendues APRÈS:
- Temps de chargement: 500-1000ms (90% plus rapide)
- Nombre de requêtes: 1 requête
- Données transférées: 50-100 Ko (98% de réduction)
- Temps autocomplétion: 50-100ms (89% plus rapide)
```

### Outils de Test
```bash
# Lighthouse
npm install -g lighthouse
lighthouse https://votre-site.vercel.app/plateforme

# Attendu:
# Performance: 90+ (vs <50 avant)
# LCP (Largest Contentful Paint): <1.5s (vs >5s avant)

# Monitoring continu
# Activer Vercel Analytics (gratuit sur plan Pro)
```

---

## 🚨 Résolution de Problèmes

### Problème: "function search_autocomplete_hybrid does not exist"
```sql
-- Vérifier que la fonction existe
SELECT proname FROM pg_proc WHERE proname LIKE '%autocomplete%';

-- Si absente, réappliquer la migration 009
```

### Problème: "relation mv_liste_publication_geoloc does not exist"
```sql
-- Vérifier que la vue matérialisée existe
SELECT matviewname FROM pg_matviews WHERE matviewname = 'mv_liste_publication_geoloc';

-- Si absente, réappliquer la migration 008
```

### Problème: Page blanche après modification
```bash
# Vérifier les logs Vercel
vercel logs

# Ou en local
npm run dev
# Vérifier la console navigateur
```

### Problème: Pagination ne fonctionne pas
```tsx
// Vérifier que currentPage est bien dans les dépendances du useEffect
useEffect(() => {
  // ...
}, [currentPage, /* autres deps */]);
```

---

## 📊 Monitoring Post-Déploiement

### Jour 1
- [ ] Vérifier les temps de réponse (Vercel Dashboard)
- [ ] Vérifier l'utilisation Supabase (Database > Query Performance)
- [ ] Tester manuellement la pagination
- [ ] Tester l'autocomplétion

### Semaine 1
- [ ] Analyser les métriques Vercel Analytics
- [ ] Vérifier que la vue matérialisée se rafraîchit correctement
- [ ] Ajuster le cache si nécessaire

### Mois 1
- [ ] Évaluer si upgrade compute Supabase nécessaire
- [ ] Analyser les requêtes lentes (Supabase Dashboard)
- [ ] Optimiser davantage si besoin

---

## 📞 Support

### Docs créées pour ce projet
- [`PLAN-OPTIMISATION-PERFORMANCES.md`](../PLAN-OPTIMISATION-PERFORMANCES.md) - Plan complet
- [`docs/EXEMPLE-PAGINATION-OPTIMISEE.tsx`](EXEMPLE-PAGINATION-OPTIMISEE.tsx) - Exemple pagination
- [`docs/EXEMPLE-AUTOCOMPLETE-OPTIMISEE.tsx`](EXEMPLE-AUTOCOMPLETE-OPTIMISEE.tsx) - Exemple autocomplétion
- [`docs/EXEMPLE-API-ROUTE-CACHE.ts`](EXEMPLE-API-ROUTE-CACHE.ts) - Exemple cache

### Ressources externes
- [Supabase Performance Tuning](https://supabase.com/docs/guides/platform/performance)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Postgres Index Types](https://www.postgresql.org/docs/current/indexes-types.html)

---

## 🎉 Résultat Final Attendu

Après implémentation des Phases 1A + 1B (minimum) :

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Temps chargement initial | 5000ms | 500ms | **90% 🚀** |
| Données transférées | 3 Mo | 75 Ko | **98% 📉** |
| Nombre établissements chargés | 1000+ | 25 | **98% 📉** |
| Temps autocomplétion | 900ms | 100ms | **89% ⚡** |
| Requêtes Supabase/page | 1000+ | 25 | **98% 💰** |

**Coût Supabase** : Réduction estimée de 95% des lectures (reste dans les limites du micro compute)

---

*Guide créé le 15 février 2026*
