/**
 * EXEMPLE D'IMPLÉMENTATION: Pagination Côté Serveur
 * 
 * Ce fichier montre comment remplacer le chargement massif par une pagination efficace.
 * À intégrer dans: src/app/plateforme/page.tsx
 * 
 * GAIN ATTENDU: 90% de réduction du temps de chargement initial
 * - Avant: 5+ secondes (1000+ établissements)
 * - Après: < 1 seconde (20-25 établissements)
 */

"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

// =====================================================
// CONFIGURATION
// =====================================================

const ITEMS_PER_PAGE = 25; // Nombre d'items par page

// Types (conservés de l'original)
interface Etablissement {
  etab_id: string;
  nom: string;
  commune?: string;
  departement?: string;
  region?: string;
  // ... autres champs
}

// =====================================================
// FONCTION DE FETCH OPTIMISÉE
// =====================================================

/**
 * Fonction pour charger les établissements avec pagination et filtres côté serveur
 */
async function fetchEtablissementsOptimized(params: {
  page: number;
  search?: string;
  selectedDepartement?: string;
  selectedCommune?: string;
  selectedHabitatCategories?: string[];
  selectedSousCategories?: string[];
  selectedPrices?: Array<"€" | "€€" | "€€€">;
  selectedPublicCible?: string[];
  selectedAvpEligibility?: string;
}) {
  const {
    page,
    search,
    selectedDepartement,
    selectedCommune,
    selectedHabitatCategories,
    selectedSousCategories,
    selectedPrices,
    selectedPublicCible,
    selectedAvpEligibility,
  } = params;

  // Construction de la requête de base
  let query = supabase
    .from("mv_liste_publication_geoloc") // Utiliser la vue matérialisée si disponible
    .select("*", { count: "exact" }); // count: 'exact' pour obtenir le nombre total

  // =====================================================
  // FILTRES CÔTÉ SERVEUR (au lieu de côté client)
  // =====================================================

  // Filtre: Recherche textuelle globale
  if (search && search.length >= 2) {
    // Recherche dans plusieurs colonnes avec OR
    query = query.or(
      `nom.ilike.%${search}%,` +
      `commune.ilike.%${search}%,` +
      `departement.ilike.%${search}%,` +
      `presentation.ilike.%${search}%`
    );
  }

  // Filtre: Département
  if (selectedDepartement) {
    query = query.ilike("departement", `%${selectedDepartement}%`);
  }

  // Filtre: Commune
  if (selectedCommune) {
    query = query.ilike("commune", `%${selectedCommune}%`);
  }

  // Filtre: Types d'habitat (résidence, habitat_partage, logement_independant)
  if (selectedHabitatCategories && selectedHabitatCategories.length > 0) {
    query = query.in("habitat_type", selectedHabitatCategories);
  }

  // Filtre: Sous-catégories (recherche dans tableau)
  if (selectedSousCategories && selectedSousCategories.length > 0) {
    // Utiliser cs (contains) pour les tableaux
    query = query.contains("sous_categories", selectedSousCategories);
  }

  // Filtre: Fourchette de prix
  if (selectedPrices && selectedPrices.length > 0) {
    const PRICE_UI_TO_DB: Record<"€" | "€€" | "€€€", string> = {
      "€": "euro",
      "€€": "deux_euros",
      "€€€": "trois_euros",
    };
    const dbPrices = selectedPrices.map((p) => PRICE_UI_TO_DB[p]);
    query = query.in("fourchette_prix", dbPrices);
  }

  // Filtre: Public cible (recherche dans tableau)
  if (selectedPublicCible && selectedPublicCible.length > 0) {
    // Utiliser overlaps pour trouver au moins une correspondance
    query = query.overlaps("public_cible", selectedPublicCible);
  }

  // Filtre: Éligibilité AVP
  if (selectedAvpEligibility) {
    query = query.eq("eligibilite_statut", selectedAvpEligibility);
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  // =====================================================
  // TRI (optionnel)
  // =====================================================

  // Trier par nom (optionnel)
  query = query.order("nom", { ascending: true });

  // =====================================================
  // EXÉCUTION
  // =====================================================

  const { data, error, count } = await query;

  if (error) {
    console.error("Erreur lors du chargement des établissements:", error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    hasMore: count ? (page + 1) * ITEMS_PER_PAGE < count : false,
  };
}

// =====================================================
// COMPOSANT AVEC PAGINATION
// =====================================================

function PlateformeContentOptimized() {
  // États
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filtres
  const [search, setSearch] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedHabitatCategories, setSelectedHabitatCategories] = useState<string[]>([]);
  const [selectedSousCategories, setSelectedSousCategories] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<Array<"€" | "€€" | "€€€">>([]);
  const [selectedPublicCible, setSelectedPublicCible] = useState<string[]>([]);
  const [selectedAvpEligibility, setSelectedAvpEligibility] = useState<"" | "avp_eligible" | "non_eligible" | "a_verifier">("");

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchEtablissementsOptimized({
          page: currentPage,
          search,
          selectedDepartement,
          selectedCommune,
          selectedHabitatCategories,
          selectedSousCategories,
          selectedPrices,
          selectedPublicCible,
          selectedAvpEligibility,
        });

        setData(result.data);
        setTotalCount(result.count);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    currentPage,
    search,
    selectedDepartement,
    selectedCommune,
    selectedHabitatCategories,
    selectedSousCategories,
    selectedPrices,
    selectedPublicCible,
    selectedAvpEligibility,
  ]);

  // =====================================================
  // RÉINITIALISER LA PAGE QUAND LES FILTRES CHANGENT
  // =====================================================

  useEffect(() => {
    // Retourner à la première page quand un filtre change
    setCurrentPage(0);
  }, [
    search,
    selectedDepartement,
    selectedCommune,
    selectedHabitatCategories,
    selectedSousCategories,
    selectedPrices,
    selectedPublicCible,
    selectedAvpEligibility,
  ]);

  // =====================================================
  // HANDLERS DE PAGINATION
  // =====================================================

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const displayedRange = {
    from: currentPage * ITEMS_PER_PAGE + 1,
    to: Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount),
  };

  return (
    <div>
      {/* Filtres (conservés de l'original) */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Autres filtres... */}
      </div>

      {/* Résultats */}
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur: {error}</div>
      ) : (
        <div>
          {/* Info pagination */}
          <div className="pagination-info">
            Affichage de {displayedRange.from} à {displayedRange.to} sur{" "}
            {totalCount} résultats
          </div>

          {/* Liste des établissements */}
          <div className="etablissements-list">
            {data.map((etab) => (
              <div key={etab.etab_id} className="etab-card">
                <h3>{etab.nom}</h3>
                <p>
                  {etab.commune} ({etab.departement})
                </p>
              </div>
            ))}
          </div>

          {/* Contrôles de pagination */}
          <div className="pagination-controls">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="btn"
            >
              ← Précédent
            </button>

            <span className="page-info">
              Page {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className="btn"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// ALTERNATIVE: INFINITE SCROLL
// =====================================================

/**
 * Version avec chargement infini au scroll
 * Meilleure UX pour mobile
 */
function PlateformeContentInfiniteScroll() {
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ... filtres

  useEffect(() => {
    async function loadMore() {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const result = await fetchEtablissementsOptimized({
          page: currentPage,
          // ... filtres
        });

        // Ajouter les nouveaux résultats aux existants
        setData((prev) => [...prev, ...result.data]);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMore();
  }, [currentPage]);

  // Détection du scroll
  useEffect(() => {
    function handleScroll() {
      if (loading || !hasMore) return;

      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Charger plus quand on arrive à 80% de la page
      if (scrollTop + windowHeight >= docHeight * 0.8) {
        setCurrentPage((prev) => prev + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div>
      {data.map((etab) => (
        <div key={etab.etab_id}>{/* Card établissement */}</div>
      ))}
      {loading && <div>Chargement...</div>}
    </div>
  );
}

// =====================================================
// NOTES D'IMPLÉMENTATION
// =====================================================

/**
 * 1. Remplacer le useEffect actuel (lignes 223-248) par la version optimisée
 * 
 * 2. Supprimer la fonction getFilteredData() (lignes 437-619) car le filtrage
 *    se fait maintenant côté serveur
 * 
 * 3. Pour les filtres avancés (services, restauration, caractéristiques):
 *    - Soit les migrer côté serveur (plus complexe)
 *    - Soit les garder côté client sur les résultats paginés (acceptable)
 * 
 * 4. Pour la carte:
 *    - Si affichage de tous les points: charger uniquement etab_id et geom
 *    - Si clustering: utiliser des tuiles vectorielles
 * 
 * 5. Ajouter un débounce sur la recherche pour éviter trop de requêtes:
 *    
 *    const debouncedSearch = useMemo(
 *      () => debounce((value: string) => setSearch(value), 300),
 *      []
 *    );
 * 
 * 6. Considérer React Query pour le caching et la synchronisation:
 *    
 *    const { data, isLoading } = useQuery({
 *      queryKey: ['etablissements', page, filters],
 *      queryFn: () => fetchEtablissementsOptimized({...}),
 *      keepPreviousData: true, // Garde les données précédentes pendant le chargement
 *    });
 */

export { PlateformeContentOptimized, PlateformeContentInfiniteScroll };
