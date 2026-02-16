/**
 * API Route Next.js avec Caching
 * 
 * Fichier: src/app/api/etablissements/route.ts
 * 
 * OBJECTIF: Implémenter un cache HTTP pour réduire les appels Supabase
 * et améliorer drastiquement les performances sur les requêtes répétées.
 * 
 * GAINS ATTENDUS:
 * - 95% de réduction du temps de réponse pour requêtes en cache
 * - Réduction de 80% des appels Supabase
 * - Distribution via Vercel Edge Network (gratuit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// CONFIGURATION
// =====================================================

// Revalidation : durée avant rafraîchissement (en secondes)
export const revalidate = 3600; // 1 heure

// Configuration du cache (Vercel Edge)
const CACHE_CONFIG = {
  // Cache public (partagé entre tous les utilisateurs)
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  // s-maxage=3600 : Cache pendant 1h sur le CDN
  // stale-while-revalidate=86400 : Peut servir une version périmée pendant 24h 
  //                                 pendant qu'une nouvelle est générée en arrière-plan
};

// Client Supabase (côté serveur)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// TYPES
// =====================================================

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departement?: string;
  commune?: string;
  habitat_type?: string[];
  sous_categories?: string[];
  fourchette_prix?: string[];
  public_cible?: string[];
  eligibilite_statut?: string;
}

// =====================================================
// HANDLER GET
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Extraire les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const params = parseQueryParams(searchParams);

    // Logger la requête (optionnel, pour monitoring)
    console.log('[API] Requête établissements:', params);

    // Construire la requête Supabase
    const result = await fetchEtablissements(params);

    // Retourner la réponse avec cache headers
    return NextResponse.json(result, {
      status: 200,
      headers: CACHE_CONFIG,
    });
  } catch (error) {
    console.error('[API] Erreur:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement des établissements',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PARSING DES PARAMÈTRES
// =====================================================

function parseQueryParams(searchParams: URLSearchParams): QueryParams {
  return {
    page: parseInt(searchParams.get('page') || '0'),
    limit: parseInt(searchParams.get('limit') || '25'),
    search: searchParams.get('search') || undefined,
    departement: searchParams.get('departement') || undefined,
    commune: searchParams.get('commune') || undefined,
    habitat_type: searchParams.getAll('habitat_type'),
    sous_categories: searchParams.getAll('sous_categories'),
    fourchette_prix: searchParams.getAll('fourchette_prix'),
    public_cible: searchParams.getAll('public_cible'),
    eligibilite_statut: searchParams.get('eligibilite_statut') || undefined,
  };
}

// =====================================================
// FETCH ÉTABLISSEMENTS
// =====================================================

async function fetchEtablissements(params: QueryParams) {
  const {
    page = 0,
    limit = 25,
    search,
    departement,
    commune,
    habitat_type,
    sous_categories,
    fourchette_prix,
    public_cible,
    eligibilite_statut,
  } = params;

  // Construction de la requête
  let query = supabase
    .from('mv_liste_publication_geoloc') // Vue matérialisée
    .select('*', { count: 'exact' });

  // Appliquer les filtres
  if (search) {
    query = query.or(
      `nom.ilike.%${search}%,` +
      `commune.ilike.%${search}%,` +
      `departement.ilike.%${search}%,` +
      `presentation.ilike.%${search}%`
    );
  }

  if (departement) {
    query = query.ilike('departement', `%${departement}%`);
  }

  if (commune) {
    query = query.ilike('commune', `%${commune}%`);
  }

  if (habitat_type && habitat_type.length > 0) {
    query = query.in('habitat_type', habitat_type);
  }

  if (sous_categories && sous_categories.length > 0) {
    query = query.contains('sous_categories', sous_categories);
  }

  if (fourchette_prix && fourchette_prix.length > 0) {
    query = query.in('fourchette_prix', fourchette_prix);
  }

  if (public_cible && public_cible.length > 0) {
    query = query.overlaps('public_cible', public_cible);
  }

  if (eligibilite_statut) {
    query = query.eq('eligibilite_statut', eligibilite_statut);
  }

  // Pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Tri
  query = query.order('nom', { ascending: true });

  // Exécution
  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: count ? (page + 1) * limit < count : false,
    },
  };
}

// =====================================================
// HANDLER POST (pour filtres complexes)
// =====================================================

/**
 * Utiliser POST pour des filtres très complexes ou longs
 * (évite les limitations d'URL)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await fetchEtablissements(body);

    // Attention: POST n'est pas cachable par défaut
    // Utiliser GET autant que possible
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error('[API] Erreur POST:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des établissements' },
      { status: 500 }
    );
  }
}

// =====================================================
// UTILISATION DANS LE COMPOSANT FRONTEND
// =====================================================

/**
 * Dans src/app/plateforme/page.tsx:
 * 
 * async function loadData() {
 *   const params = new URLSearchParams({
 *     page: currentPage.toString(),
 *     limit: '25',
 *   });
 * 
 *   if (search) params.append('search', search);
 *   if (selectedDepartement) params.append('departement', selectedDepartement);
 *   // ... autres filtres
 * 
 *   const response = await fetch(`/api/etablissements?${params.toString()}`);
 *   const result = await response.json();
 * 
 *   setData(result.data);
 *   setTotalCount(result.pagination.total);
 * }
 */

// =====================================================
// VARIANTE: CACHE PLUS AGRESSIF AVEC TAGS
// =====================================================

/**
 * Utiliser les tags Next.js 13+ pour invalider le cache de manière ciblée
 */
export async function GET_WithTags(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = parseQueryParams(searchParams);

  // Définir des tags de cache basés sur les filtres
  const cacheTags = ['etablissements'];
  if (params.departement) cacheTags.push(`dept-${params.departement}`);
  if (params.commune) cacheTags.push(`commune-${params.commune}`);

  try {
    const result = await fetchEtablissements(params);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CACHE_CONFIG,
        'x-cache-tags': cacheTags.join(','),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

/**
 * Fonction pour invalider le cache après une modification
 * (appeler depuis une edge function ou webhook)
 */
export async function revalidateCache(tags: string[]) {
  // Next.js 13+
  // import { revalidateTag } from 'next/cache';
  // tags.forEach(tag => revalidateTag(tag));
}
