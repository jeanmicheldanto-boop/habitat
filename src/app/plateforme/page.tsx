"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import type { JSX } from "react";
import nextDynamic from "next/dynamic";
import HeaderSubnavGate from "@/components/HeaderSubnavGate";
import DepartmentAutocomplete from "@/components/DepartmentAutocomplete";
import MobileFilters from "@/components/MobileFilters";
import MobileResultsList from "@/components/MobileResultsList";
import type { EtablissementResult } from "@/components/MobileResultsList";
import { supabase } from "../../lib/supabaseClient";
import { HABITAT_TAXONOMY, getSousCategorieColor, getAllSousCategories, getCategoryByKey, getHabitatTypeFromSousCategorie, doesSousCategorieMatchHabitatType, findSousCategorieWithTolerance } from "@/lib/habitatTaxonomy";
import { getHabitatImage } from "@/lib/habitatImages";
import { getSupabaseImageUrl } from "@/lib/imageUtils";
import BadgeIcon from "@/components/BadgeIcon";
import AvpBadge from "@/components/AvpBadge";
import ChatbotIcon from "@/components/ChatbotIcon";
import "./plateforme.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

// Labels des habitat_type selon le nouveau mapping centralisé
const HABITAT_TYPE_LABELS: Record<string, string> = {
  residence: "Résidence",
  habitat_partage: "Habitat partagé", 
  logement_independant: "Logement indépendant",
  // Anciens labels pour compatibilité
  habitat_individuel: "Habitat individuel",
  logement_individuel_en_residence: "Logement individuel en résidence",
};

interface LogementType {
  libelle: string;
  surface_min?: number;
  surface_max?: number;
  meuble?: boolean;
  pmr?: boolean;
  domotique?: boolean;
  plain_pied?: boolean;
  nb_unites?: number;
}
interface Etablissement {
  etab_id: string;
  nom: string;
  commune?: string;
  departement?: string;
  region?: string;
  code_postal?: string;
  image_path?: string;
  sous_categories?: string[];
  fourchette_prix?: "euro" | "deux_euros" | "trois_euros";
  prix_min?: number;
  prix_max?: number;
  presentation?: string;
  public_cible?: string[];
  services?: string[];
  logements_types?: LogementType[];
  habitat_type?: string;
  geom?: { coordinates?: [number, number] };
  eligibilite_statut?: "avp_eligible" | "non_eligible" | "a_verifier" | "";
  // Restauration flags (optional presence in the view)
  kitchenette?: boolean;
  resto_collectif_midi?: boolean;
  resto_collectif?: boolean;
  portage_repas?: boolean;
}

function PlateformeContent(): JSX.Element {
  // --- HOOKS ET LOGIQUE ---
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du paramètre ?view=map pour ouvrir la carte par défaut
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [tab, setTab] = useState<"liste" | "carte">(viewMode === "map" ? "carte" : "liste");
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // États pour l'autocomplétion
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'departement' | 'commune' | 'etablissement';
    value: string;
    label: string;
    metadata?: string;
  }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Nouveaux filtres pour habitat_type - Utilisation de la taxonomie
  const [selectedHabitatCategories, setSelectedHabitatCategories] = useState<string[]>([]);
  const [selectedSousCategories, setSelectedSousCategories] = useState<string[]>([]);
  const PRICE_DB_TO_UI: Record<"euro" | "deux_euros" | "trois_euros", "€" | "€€" | "€€€"> = {
    euro: "€",
    deux_euros: "€€",
    trois_euros: "€€€",
  };
  const [selectedPrices, setSelectedPrices] = useState<Array<"€" | "€€" | "€€€">>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const RESTAURATION_OPTIONS = [
    { key: "kitchenette", label: "Kitchenette" },
    { key: "resto_collectif_midi", label: "Resto midi" },
    { key: "resto_collectif", label: "Resto collectif" },
    { key: "portage_repas", label: "Portage repas" },
  ] as const;
  const [selectedRestauration, setSelectedRestauration] = useState<Record<string, boolean>>({});
  const [allLogementTypes, setAllLogementTypes] = useState<string[]>([]);
  const [selectedLogementTypes, setSelectedLogementTypes] = useState<string[]>([]);
  type Caracteristiques = {
    meuble?: boolean;
    pmr?: boolean;
    domotique?: boolean;
    plain_pied?: boolean;
    surface_min?: string;
    surface_max?: string;
  };
  const [selectedCaracteristiques, setSelectedCaracteristiques] = useState<Caracteristiques>({});
  const PUBLIC_CIBLE_OPTIONS = [
    { key: "personnes_agees", label: "Personnes âgées" },
    { key: "personnes_handicapees", label: "Handicap" },
    { key: "mixtes", label: "Mixte" },
    { key: "intergenerationnel", label: "Intergénérationnel" },
    { key: "alzheimer_accessible", label: "Alzheimer" },
  ];
  const [selectedPublicCible, setSelectedPublicCible] = useState<string[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<string>("");
  // Filtre AVP
  const [selectedAvpEligibility, setSelectedAvpEligibility] = useState<"" | "avp_eligible" | "non_eligible" | "a_verifier">("");
  // Sticky responsive: top = 80px (desktop), 120px (mobile)
  const [stickyTop, setStickyTop] = useState(80);
  useEffect(() => {
    function handleResize() {
      setStickyTop(window.innerWidth < 700 ? 120 : 80);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  // États pour la pagination côté serveur
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 25;
  // État séparé pour les données de la carte (tous les résultats)
  const [mapData, setMapData] = useState<Etablissement[]>([]);
  
  // État pour les sections collapsibles (style Airbnb)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    sousCategories: false,
    publicCible: false,
    tarifs: false,
    restauration: false,
    caracteristiques: false,
    services: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSelectedHabitatCategories([]);
    setSelectedSousCategories([]);
    setSelectedDepartement('');
    setSelectedCommune('');
    setSelectedPrices([]);
    setSelectedPublicCible([]);
    setSelectedServices([]);
    setSelectedRestauration({});
    setSelectedLogementTypes([]);
    setSelectedCaracteristiques({});
    setSelectedAvpEligibility('');
    setSearch('');
  };

  // Compter le nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedHabitatCategories.length > 0) count += selectedHabitatCategories.length;
    if (selectedSousCategories.length > 0) count += selectedSousCategories.length;
    if (selectedDepartement) count += 1;
    if (selectedCommune) count += 1;
    if (selectedPrices.length > 0) count += selectedPrices.length;
    if (selectedPublicCible.length > 0) count += selectedPublicCible.length;
    if (selectedServices.length > 0) count += selectedServices.length;
    if (Object.values(selectedRestauration).some(Boolean)) count += Object.values(selectedRestauration).filter(Boolean).length;
    if (selectedAvpEligibility) count += 1;
    const caracCount = Object.values(selectedCaracteristiques).filter(v => v !== '' && v !== false).length;
    if (caracCount > 0) count += caracCount;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Récupérer le paramètre de recherche depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) setSearch(searchParam);
  }, []);

  // Reset de la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedHabitatCategories, selectedSousCategories, selectedPrices, selectedServices, selectedRestauration, selectedLogementTypes, selectedCaracteristiques, selectedPublicCible, selectedDepartement, selectedCommune, selectedAvpEligibility, search]);

  // ✅ OPTIMISATION : Chargement avec pagination côté serveur
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Construction de la requête avec filtres côté serveur
        let query = supabase
          .from("mv_liste_publication_geoloc") // ✅ Vue matérialisée
          .select("*", { count: "exact" });

        // Filtres côté serveur pour les champs simples
        if (search && search.length >= 2) {
          query = query.or(
            `nom.ilike.%${search}%,commune.ilike.%${search}%,departement.ilike.%${search}%,presentation.ilike.%${search}%`
          );
        }

        if (selectedDepartement) {
          query = query.ilike("departement", `%${selectedDepartement}%`);
        }

        if (selectedCommune) {
          query = query.ilike("commune", `%${selectedCommune}%`);
        }

        if (selectedHabitatCategories.length > 0) {
          query = query.in("habitat_type", selectedHabitatCategories);
        }

        if (selectedAvpEligibility) {
          query = query.eq("eligibilite_statut", selectedAvpEligibility);
        }

        // Pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        // Tri
        query = query.order("nom", { ascending: true });

        const { data: rows, error: err, count } = await query;

        if (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError(err.message);
          setLoading(false);
          return;
        }

        console.log(`Données chargées: ${rows?.length || 0} établissements (page ${currentPage})`);
        setData(rows || []);
        setTotalCount(count || 0);
        setHasMore(count ? currentPage * ITEMS_PER_PAGE < count : false);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    // ✅ OPTIMISATION : Chargement séparé pour la carte (tous les résultats, champs légers)
    async function fetchMapData() {
      try {
        // Construction de la requête avec les mêmes filtres mais sans pagination
        let mapQuery = supabase
          .from("mv_liste_publication_geoloc")
          .select("etab_id, nom, commune, departement, habitat_type, image_path, fourchette_prix, sous_categories, geom");

        // Appliquer les mêmes filtres que pour la liste
        if (search && search.length >= 2) {
          mapQuery = mapQuery.or(
            `nom.ilike.%${search}%,commune.ilike.%${search}%,departement.ilike.%${search}%`
          );
        }

        if (selectedDepartement) {
          mapQuery = mapQuery.ilike("departement", `%${selectedDepartement}%`);
        }

        if (selectedCommune) {
          mapQuery = mapQuery.ilike("commune", `%${selectedCommune}%`);
        }

        if (selectedHabitatCategories.length > 0) {
          mapQuery = mapQuery.in("habitat_type", selectedHabitatCategories);
        }

        if (selectedAvpEligibility) {
          mapQuery = mapQuery.eq("eligibilite_statut", selectedAvpEligibility);
        }

        // Limiter à 3500 résultats max pour la carte
        mapQuery = mapQuery.limit(3500);
        mapQuery = mapQuery.order("nom", { ascending: true });

        const { data: mapRows, error: mapErr } = await mapQuery;

        if (mapErr) {
          console.error("⚠️ Erreur chargement carte:", mapErr);
          return;
        }

        console.log(`🗺️ Carte: ${mapRows?.length || 0} établissements chargés`);
        setMapData(mapRows || []);
      } catch (err) {
        console.error("Erreur carte:", err);
      }
    }

    fetchData();
    fetchMapData();
  }, [currentPage, selectedHabitatCategories, selectedSousCategories, selectedPrices, selectedServices, selectedRestauration, selectedLogementTypes, selectedCaracteristiques, selectedPublicCible, selectedDepartement, selectedCommune, selectedAvpEligibility, search]);

  // Chargement des sous-catégories disponibles
  useEffect(() => {
    async function fetchSousCategories() {
      // Récupérer un échantillon pour les filtres (optimisé)
      const { data: rows } = await supabase
        .from("mv_liste_publication_geoloc")
        .select("services, logements_types")
        .limit(500); // Échantillon suffisant pour avoir tous les types

      if (rows) {
        const allServ = rows.flatMap((row: { services?: string[] }) => row.services || []);
        const uniqueServices = Array.from(new Set(allServ)).sort();
        setAllServices(uniqueServices);

        const allLogTypes = rows
          .flatMap((row: { logements_types?: LogementType[] }) => (row.logements_types || []).map((lt: LogementType) => lt.libelle))
          .filter(Boolean) as string[];
        setAllLogementTypes(Array.from(new Set(allLogTypes)).sort());
      }
    }
    
    fetchSousCategories();
  }, []);

  // ✅ OPTIMISATION : Autocomplétion avec fonction RPC unique
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        // ✅ 1 seule requête au lieu de 3 !
        const { data, error } = await supabase.rpc('search_autocomplete_hybrid', {
          search_query: search,
          max_results: 8
        });

        if (error) {
          console.error('Erreur recherche autocomplétion:', error);
          setSuggestions([]);
          return;
        }

        if (data && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Erreur recherche suggestions:', error);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler pour la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: { type: string; value: string; label: string }) => {
    if (suggestion.type === 'etablissement') {
      // Aller directement à la fiche établissement
      router.push(`/plateforme/fiche?id=${encodeURIComponent(suggestion.value)}`);
    } else {
      // Mettre à jour la recherche avec la valeur sélectionnée
      setSearch(suggestion.value);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  function getFilteredData(): Etablissement[] {
    const filtered = data.filter((etab: Etablissement) => {
      // Logique de filtres améliorée avec correspondance centralisée
      
      // Debug: log pour comprendre le filtrage des villes
      if (search && (search.toLowerCase().includes('royan') || search.toLowerCase().includes('angoul'))) {
        console.log(`🔍 Filtrage de ${etab.nom} (${etab.commune})`);
        console.log(`  - search: "${search}"`);
        console.log(`  - selectedCommune: "${selectedCommune}"`);
      }

      // 1. Catégories d'habitat (avec validation du mapping)
      if (selectedHabitatCategories.length > 0) {
        if (!etab.habitat_type) return false;
        if (!selectedHabitatCategories.includes(etab.habitat_type)) return false;
      }

      // 2. Sous-catégories d'habitat
      if (selectedSousCategories.length > 0) {
        if (!etab.sous_categories || !Array.isArray(etab.sous_categories)) return false;
        
        // Vérifier qu'au moins une sous-catégorie de l'établissement correspond aux filtres sélectionnés
        // On utilise une recherche tolérante pour gérer les variations de noms
        const hasValidMatch = etab.sous_categories.some((etabSousCategorie) => {
          // 1. Vérification exacte par key
          if (selectedSousCategories.includes(etabSousCategorie)) return true;
          
          // 2. Vérification avec tolérance (normalisation)
          const foundSc = findSousCategorieWithTolerance(etabSousCategorie);
          if (foundSc && selectedSousCategories.includes(foundSc.key)) return true;
          
          // 3. Vérification par recherche dans les labels
          return selectedSousCategories.some((selectedKey) => {
            const selectedSc = getAllSousCategories().find(sc => sc.key === selectedKey);
            if (!selectedSc) return false;
            
            const normalized = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
            return normalized(etabSousCategorie).includes(normalized(selectedSc.label)) ||
                   normalized(selectedSc.label).includes(normalized(etabSousCategorie));
          });
        });
        
        if (!hasValidMatch) return false;
      }

      // Prix
      if (selectedPrices.length > 0) {
        const dbValue = etab.fourchette_prix;
        if (!dbValue) return false;
        const uiValue = PRICE_DB_TO_UI[dbValue];
        if (!uiValue || !selectedPrices.includes(uiValue)) return false;
      }

      // Services dynamiques (au moins un des services sélectionnés doit être présent)
      if (selectedServices.length > 0) {
        if (!etab.services || !Array.isArray(etab.services)) return false;
        const hasServiceMatch = selectedServices.some((s) => etab.services!.includes(s));
        if (!hasServiceMatch) return false;
      }

      // Restauration (toutes les cases cochées doivent être vraies)
      if (Object.values(selectedRestauration).some(Boolean)) {
        for (const key of Object.keys(selectedRestauration)) {
          if (selectedRestauration[key] && !(key in etab && Boolean((etab as unknown as Record<string, unknown>)[key]))) return false;
        }
      }

      // Types de logement (au moins un type sélectionné doit être présent)
      if (selectedLogementTypes.length > 0) {
        if (!Array.isArray(etab.logements_types)) return false;
        const found = etab.logements_types.some((lt) => selectedLogementTypes.includes(lt.libelle));
        if (!found) return false;
      }

      // Caractéristiques (toutes les cases cochées doivent être vraies sur au moins un logement)
      if (
        selectedCaracteristiques.meuble ||
        selectedCaracteristiques.pmr ||
        selectedCaracteristiques.domotique ||
        selectedCaracteristiques.plain_pied ||
        selectedCaracteristiques.surface_min ||
        selectedCaracteristiques.surface_max
      ) {
        if (!Array.isArray(etab.logements_types)) return false;
        const found = etab.logements_types.some((lt) => {
          if (selectedCaracteristiques.meuble && !lt.meuble) return false;
          if (selectedCaracteristiques.pmr && !lt.pmr) return false;
          if (selectedCaracteristiques.domotique && !lt.domotique) return false;
          if (selectedCaracteristiques.plain_pied && !lt.plain_pied) return false;
          if (selectedCaracteristiques.surface_min && (lt.surface_min == null || Number(lt.surface_min) < Number(selectedCaracteristiques.surface_min))) return false;
          if (selectedCaracteristiques.surface_max && (lt.surface_max == null || Number(lt.surface_max) > Number(selectedCaracteristiques.surface_max))) return false;
          return true;
        });
        if (!found) return false;
      }

      // Public cible (au moins une case cochée doit être présente)
      if (selectedPublicCible.length > 0) {
        if (!Array.isArray(etab.public_cible)) return false;
        if (!selectedPublicCible.some((pc) => etab.public_cible!.includes(pc))) return false;
      }

      // Localisation - Support des codes et noms de départements
      if (selectedDepartement && etab.departement) {
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const isCode = /^[\d]{1,3}[AB]?$/.test(selectedDepartement);
        
        if (isCode) {
          // Si on recherche par code (ex: "36"), vérifier si le code est dans le département
          // Gère les formats: "36", "Indre (36)", etc.
          const etabDeptCode = etab.departement.match(/\((\d{1,3}[AB]?)\)/)?.[1] || etab.departement;
          if (etabDeptCode !== selectedDepartement) return false;
        } else {
          // Si on recherche par nom, enlever le code entre parenthèses pour la comparaison
          const etabDeptName = etab.departement.replace(/\s*\(\d{1,3}[AB]?\)\s*$/, '').trim();
          if (!normalize(etabDeptName).includes(normalize(selectedDepartement))) return false;
        }
      }

      // Filtre éligibilité AVP
      if (selectedAvpEligibility && etab.eligibilite_statut !== selectedAvpEligibility) return false;
      
      // Correction : ignorer le filtre selectedCommune si search est utilisé
      // Cela évite les conflits entre recherche textuelle et filtre de commune
      if (!search && selectedCommune && etab.commune) {
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        if (!normalize(etab.commune).includes(normalize(selectedCommune))) return false;
      }

      // Recherche texte - globale
      if (search) {
        const normalize = (s: string | null | undefined) => s ? s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") : "";
        const searchTerms = normalize(search).split(/\s+/).filter((term) => term.length > 1);

        const matchesSearch = searchTerms.every((term) => {
          if (etab.nom && normalize(etab.nom).includes(term)) return true;
          if (etab.presentation && normalize(etab.presentation).includes(term)) return true;
          if (etab.commune && normalize(etab.commune).includes(term)) return true;
          if (etab.departement && normalize(etab.departement).includes(term)) return true;
          if (etab.region && normalize(etab.region).includes(term)) return true;
          if (etab.habitat_type) {
            const habitatLabel = HABITAT_TYPE_LABELS[etab.habitat_type] || etab.habitat_type;
            if (normalize(habitatLabel).includes(term)) return true;
          }
          if (Array.isArray(etab.sous_categories) && etab.sous_categories.some((sc) => normalize(sc).includes(term))) return true;
          if (Array.isArray(etab.services) && etab.services.some((s) => normalize(s).includes(term))) return true;
          // if (etab.gestionnaire && normalize(etab.gestionnaire).includes(term)) return true; // gestionnaire n'existe pas dans Etablissement
          if (Array.isArray(etab.logements_types) && etab.logements_types.some((lt) => lt.libelle && normalize(lt.libelle).includes(term))) return true;
          return false;
        });

        if (!matchesSearch) {
          // Debug pour villes problématiques
          if (search.toLowerCase().includes('royan') || search.toLowerCase().includes('angoul')) {
            console.log(`  ❌ ${etab.nom} filtré (pas de match)`);
          }
          return false;
        }
        
        // Debug pour villes problématiques
        if (search.toLowerCase().includes('royan') || search.toLowerCase().includes('angoul')) {
          console.log(`  ✅ ${etab.nom} accepté`);
        }
      }

      return true;
    });

    return filtered;
  }

  // Import dynamique de la carte pour CSR uniquement
  const EtabMap = nextDynamic(() => import("../../components/EtabMap"), { ssr: false });

  // Note: getFilteredData() est conservée pour les filtres complexes côté client à implémenter plus tard
  // Les filtres simples (search, departement, commune, habitat_type, AVP) sont maintenant côté serveur
  const filteredData = getFilteredData();

  // --- RENDU JSX ---
  if (isMobile) {
    return (
      <main style={{ background: "#f8f8f8", minHeight: "100vh", fontSize: "0.95rem" }}>
        <HeaderSubnavGate />

        {/* Barre de recherche mobile */}
        <div
          style={{
            background: "#fff",
            padding: "16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            position: "sticky",
            top: 64,
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#f8f8f8",
              borderRadius: 25,
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Nom, ville, département, type d'habitat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                outline: "none",
                color: "#333",
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                  setSuggestions([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}

            {/* Dropdown des suggestions mobile */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: 300,
                  overflowY: 'auto',
                  zIndex: 1000,
                  border: '1px solid #e0e0e0'
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: selectedIndex === index ? '#f0f8ff' : '#fff',
                      borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                      borderRadius: index === 0 ? '16px 16px 0 0' : index === suggestions.length - 1 ? '0 0 16px 16px' : 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: '#333', fontSize: '0.9rem' }}>
                        {suggestion.label}
                      </div>
                      {suggestion.metadata && (
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>
                          {suggestion.metadata}
                        </div>
                      )}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indicateur de recherche active */}
          {search && (
            <div
              style={{
                textAlign: "center",
                fontSize: "0.8rem",
                color: "#666",
                marginTop: "8px",
                background: "rgba(168, 91, 43, 0.1)",
                padding: "4px 12px",
                borderRadius: "12px",
                display: "inline-block",
                width: "100%",
              }}
            >
              <strong>Recherche :</strong> &quot;{search}&quot; dans tous les champs
            </div>
          )}
        </div>

        {/* Onglets Liste/Carte mobile */}
        <div
          style={{
            background: "#fff",
            display: "flex",
            borderBottom: "1px solid #eee",
          }}
        >
          <button
            onClick={() => setTab("liste")}
            style={{
              flex: 1,
              padding: "16px",
              background: "none",
              border: "none",
              borderBottom: tab === "liste" ? "3px solid #a85b2b" : "3px solid transparent",
              color: tab === "liste" ? "#a85b2b" : "#666",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            📋 Liste ({totalCount})
          </button>
          <button
            onClick={() => setTab("carte")}
            style={{
              flex: 1,
              padding: "16px",
              background: "none",
              border: "none",
              borderBottom: tab === "carte" ? "3px solid #a85b2b" : "3px solid transparent",
              color: tab === "carte" ? "#a85b2b" : "#666",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            🗺️ Carte
          </button>
        </div>

        {/* Contenu mobile */}
        {!loading && !error && (tab === "carte" ? (
          <div style={{ height: "calc(100vh - 200px)", padding: "16px" }}>
            {mounted && (
              <EtabMap
                etablissements={mapData.map((etab) => ({
                  ...etab,
                  longitude: etab.geom?.coordinates?.[0],
                  latitude: etab.geom?.coordinates?.[1],
                }))}
              />
            )}
          </div>
        ) : (
          <MobileResultsList 
            results={data as EtablissementResult[]} 
            publicCibleOptions={PUBLIC_CIBLE_OPTIONS} 
            restaurationOptions={RESTAURATION_OPTIONS as unknown as { key: string; label: string }[]}
            displayCount={data.length}
            onLoadMore={handleNextPage}
            onLoadPrevious={handlePreviousPage}
            hasMore={hasMore}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        ))}

        {loading && (
          <div style={{ textAlign: "center", color: "#888", marginTop: 40, padding: "40px" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>⏳</div>
            <div>Chargement des établissements...</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", color: "#a82b2b", marginTop: 40, padding: "40px" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>⚠️</div>
            <div>Erreur : {error}</div>
          </div>
        )}

        {/* Filtres mobiles */}
        <MobileFilters
          selectedHabitatCategories={selectedHabitatCategories}
          setSelectedHabitatCategories={setSelectedHabitatCategories}
          selectedSousCategories={selectedSousCategories}
          setSelectedSousCategories={setSelectedSousCategories}
          selectedDepartement={selectedDepartement}
          setSelectedDepartement={setSelectedDepartement}
          selectedCommune={selectedCommune}
          setSelectedCommune={setSelectedCommune}
          selectedPrices={selectedPrices}
          setSelectedPrices={setSelectedPrices}
          selectedPublicCible={selectedPublicCible}
          setSelectedPublicCible={setSelectedPublicCible}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
          selectedRestauration={selectedRestauration}
          setSelectedRestauration={setSelectedRestauration}
          selectedLogementTypes={selectedLogementTypes}
          setSelectedLogementTypes={setSelectedLogementTypes}
          selectedCaracteristiques={selectedCaracteristiques}
          setSelectedCaracteristiques={setSelectedCaracteristiques}
          allServices={allServices}
          resultsCount={totalCount}
        />
      </main>
    );
  }

  // Version desktop
  return (
    <main style={{ background: "#f3f3f3", minHeight: "100vh", padding: 0, fontSize: "0.95rem" }}>
      <HeaderSubnavGate />

      {/* Ligne principale : sidebar, sticky top bar (search+tabs), contenu */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 36, maxWidth: 1600, margin: "0 auto", padding: "0 1.5rem", marginTop: 0 }}>
{/* Sidebar filtres sticky sous le header - Style Airbnb élégant */}
        <aside
          style={{
            minWidth: 290,
            maxWidth: 340,
            width: 320,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.07)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            zIndex: 10,
            marginTop: 0,
            overflowY: "auto",
            fontSize: "0.85rem",
          }}
        >
          {/* Header avec bouton reset */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: "1px solid #ebebeb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222" }}>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="active-filters-badge">{activeFiltersCount}</span>
              )}
            </div>
            <button
              onClick={resetAllFilters}
              className="reset-filters-btn"
              title="Effacer tous les filtres"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>

          {/* Section Gestionnaire - En haut des filtres */}
          <div
            style={{
              background: "linear-gradient(135deg, #222 0%, #444 100%)",
              borderRadius: 12,
              padding: "16px",
              textAlign: "center",
              color: "white",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 6 }}>Proposez votre habitat ?</div>
            <div style={{ fontSize: "0.75rem", marginBottom: 12, opacity: 0.85, lineHeight: 1.3 }}>Référencez votre établissement</div>
            <button
              onClick={() => { window.location.href = "/gestionnaire/create"; }}
              style={{
                background: "#fff",
                color: "#222",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                width: "100%",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#f7f7f7"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              ✨ Ajouter mon habitat
            </button>
          </div>

          {/* Localisation - Toujours visible */}
          <div className="filter-section">
            <div className="filter-section-title" style={{ marginBottom: 12 }}>
              <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ color: "#222" }}>Localisation</span>
            </div>
            <DepartmentAutocomplete 
              value={selectedDepartement} 
              onChange={setSelectedDepartement} 
              placeholder="Département" 
              className="filtre-input" 
            />
            <input 
              type="text" 
              placeholder="Commune" 
              value={selectedCommune} 
              onChange={(e) => setSelectedCommune(e.target.value)} 
              className="filtre-input" 
              style={{ marginTop: 8 }} 
            />
          </div>

          {/* Types d'habitat - Toujours visible */}
          <div className="filter-section">
            <div className="filter-section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={{ color: "#222" }}>Types d&apos;habitat</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Types d\'habitat\n\n• Résidence : Logements avec services collectifs (résidence autonomie, services seniors, MARPA)\n\n• Habitat partagé : Colocation, habitat inclusif, accueil familial\n\n• Logement indépendant : Béguinage, village seniors, habitat regroupé\n\nPour un guide personnalisé, utilisez notre simulateur.');
                }}
                title="En savoir plus sur les types d'habitat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.5,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="#666"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HABITAT_TAXONOMY.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() =>
                    setSelectedHabitatCategories((arr) => (arr.includes(category.key) ? arr.filter((x) => x !== category.key) : [...arr, category.key]))
                  }
                  className={`habitat-category-btn ${selectedHabitatCategories.includes(category.key) ? 'selected' : ''}`}
                >
                  <span className="category-icon" dangerouslySetInnerHTML={{ __html: category.icon }} />
                  <span className="category-label">{category.label}</span>
                  <span className="category-check">
                    {selectedHabitatCategories.includes(category.key) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* Sous-catégories - Apparaît quand un type est sélectionné */}
            {selectedHabitatCategories.length > 0 && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px 14px',
                background: 'linear-gradient(135deg, #fff8f5 0%, #fef5f0 100%)',
                borderRadius: '12px',
                border: '1px solid #f8dcd1'
              }}>
                <div 
                  className="filter-section-header"
                  onClick={() => toggleSection('sousCategories')}
                  style={{ marginBottom: expandedSections.sousCategories ? 12 : 0 }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#c1694a", fontWeight: 600 }}>
                    Affinez votre recherche
                  </span>
                  <svg className={`filter-section-chevron ${expandedSections.sousCategories ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="#c1694a" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className={`filter-section-content ${expandedSections.sousCategories ? 'open' : ''}`}>
                  <div className="sous-cat-container">
                    {getAllSousCategories()
                      .filter(sc => {
                        const parentKey = HABITAT_TAXONOMY.find(cat => cat.sousCategories.some(s => s.key === sc.key))?.key;
                        return parentKey && selectedHabitatCategories.includes(parentKey);
                      })
                      .map((sousCategorie) => {
                        const parentCategory = getCategoryByKey(
                          HABITAT_TAXONOMY.find((cat) => cat.sousCategories.some((sc) => sc.key === sousCategorie.key))?.key || ""
                        );
                        const isSelected = selectedSousCategories.includes(sousCategorie.key);
                        return (
                          <div
                            key={sousCategorie.key}
                            className={`sous-cat-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedSousCategories((arr) => 
                              isSelected ? arr.filter((x) => x !== sousCategorie.key) : [...arr, sousCategorie.key]
                            )}
                          >
                            <span className="sous-cat-checkbox">
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </span>
                            <span className="sous-cat-label">
                              {parentCategory?.icon && (
                                <span className="parent-icon" dangerouslySetInnerHTML={{ __html: parentCategory.icon }} />
                              )}
                              {sousCategorie.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Public cible - Section collapsible avec pills */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('publicCible')}
            >
              <span className="filter-section-title">
                <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span style={{ color: "#222" }}>Public cible</span>
                {selectedPublicCible.length > 0 && (
                  <span className="active-filters-badge">{selectedPublicCible.length}</span>
                )}
              </span>
              <svg className={`filter-section-chevron ${expandedSections.publicCible ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className={`filter-section-content ${expandedSections.publicCible ? 'open' : ''}`}>
              <div className="pill-container">
                {PUBLIC_CIBLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`pill-item ${selectedPublicCible.includes(opt.key) ? 'selected' : ''}`}
                    onClick={() => setSelectedPublicCible((arr) => 
                      arr.includes(opt.key) ? arr.filter((x) => x !== opt.key) : [...arr, opt.key]
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarifs - Section collapsible */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('tarifs')}
            >
              <span className="filter-section-title">
                <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span style={{ color: "#222" }}>Tarifs</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Fourchettes de prix\n\n€ = Moins de 750€/mois\n€€ = Entre 750€ et 1500€/mois\n€€€ = Plus de 1500€/mois\n\n⚠️ Ces informations sont issues de sources publiques via un processus d\'ingénierie de la donnée. Malgré nos efforts, veuillez vérifier les tarifs exacts auprès des établissements.');
                  }}
                  title="Détails des fourchettes de prix"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.5,
                    transition: 'opacity 0.2s',
                    marginLeft: 4
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="8" r="1" fill="#666"/>
                  </svg>
                </button>
                {selectedPrices.length > 0 && (
                  <span className="active-filters-badge">{selectedPrices.length}</span>
                )}
              </span>
              <svg className={`filter-section-chevron ${expandedSections.tarifs ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className={`filter-section-content ${expandedSections.tarifs ? 'open' : ''}`}>
              <div className="tarif-container">
                {(["€", "€€", "€€€"] as const).map((prix) => (
                  <button
                    key={prix}
                    type="button"
                    className={`tarif-btn ${selectedPrices.includes(prix) ? 'selected' : ''}`}
                    onClick={() => setSelectedPrices((arr) => 
                      arr.includes(prix) ? arr.filter((x) => x !== prix) : [...arr, prix]
                    )}
                  >
                    {prix}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Restauration - Section collapsible */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('restauration')}
            >
              <span className="filter-section-title">
                <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
                <span style={{ color: "#222" }}>Restauration</span>
                {Object.values(selectedRestauration).filter(Boolean).length > 0 && (
                  <span className="active-filters-badge">{Object.values(selectedRestauration).filter(Boolean).length}</span>
                )}
              </span>
              <svg className={`filter-section-chevron ${expandedSections.restauration ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className={`filter-section-content ${expandedSections.restauration ? 'open' : ''}`}>
              <div className="resto-container">
                {RESTAURATION_OPTIONS.map((opt) => {
                  const isSelected = !!selectedRestauration[opt.key];
                  return (
                    <div
                      key={opt.key}
                      className={`resto-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedRestauration((obj) => ({ ...obj, [opt.key]: !obj[opt.key] }))}
                    >
                      <span className="resto-label">{opt.label}</span>
                      <span className="resto-checkbox">
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Caractéristiques des logements - Section collapsible */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('caracteristiques')}
            >
              <span className="filter-section-title">
                <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span style={{ color: "#222" }}>Caractéristiques des logements</span>
                {Object.values(selectedCaracteristiques).filter(v => v !== '' && v !== false).length > 0 && (
                  <span className="active-filters-badge">
                    {Object.values(selectedCaracteristiques).filter(v => v !== '' && v !== false).length}
                  </span>
                )}
              </span>
              <svg className={`filter-section-chevron ${expandedSections.caracteristiques ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className={`filter-section-content ${expandedSections.caracteristiques ? 'open' : ''}`}>
              <div className="carac-grid">
                <div 
                  className={`carac-item ${selectedCaracteristiques.meuble ? 'selected' : ''}`}
                  onClick={() => setSelectedCaracteristiques((obj) => ({ ...obj, meuble: !obj.meuble }))}
                >
                  <span className="carac-checkbox">
                    {selectedCaracteristiques.meuble && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  Meublé
                </div>
                <div 
                  className={`carac-item ${selectedCaracteristiques.pmr ? 'selected' : ''}`}
                  onClick={() => setSelectedCaracteristiques((obj) => ({ ...obj, pmr: !obj.pmr }))}
                >
                  <span className="carac-checkbox">
                    {selectedCaracteristiques.pmr && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  PMR ♿
                </div>
                <div 
                  className={`carac-item ${selectedCaracteristiques.domotique ? 'selected' : ''}`}
                  onClick={() => setSelectedCaracteristiques((obj) => ({ ...obj, domotique: !obj.domotique }))}
                >
                  <span className="carac-checkbox">
                    {selectedCaracteristiques.domotique && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  Domotique
                </div>
                <div 
                  className={`carac-item ${selectedCaracteristiques.plain_pied ? 'selected' : ''}`}
                  onClick={() => setSelectedCaracteristiques((obj) => ({ ...obj, plain_pied: !obj.plain_pied }))}
                >
                  <span className="carac-checkbox">
                    {selectedCaracteristiques.plain_pied && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  Plain-pied
                </div>
              </div>
              <div className="surface-inputs">
                <div className="surface-input-group">
                  <label>Surface min (m²)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={selectedCaracteristiques.surface_min || ""}
                    onChange={(e) => setSelectedCaracteristiques((obj) => ({ ...obj, surface_min: e.target.value }))}
                  />
                </div>
                <div className="surface-input-group">
                  <label>Surface max (m²)</label>
                  <input
                    type="text"
                    placeholder="∞"
                    value={selectedCaracteristiques.surface_max || ""}
                    onChange={(e) => setSelectedCaracteristiques((obj) => ({ ...obj, surface_max: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services - Section collapsible */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('services')}
            >
              <span className="filter-section-title">
                <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <span style={{ color: "#222" }}>Services</span>
                {selectedServices.length > 0 && (
                  <span className="active-filters-badge">{selectedServices.length}</span>
                )}
              </span>
              <svg className={`filter-section-chevron ${expandedSections.services ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div className={`filter-section-content ${expandedSections.services ? 'open' : ''}`}>
              <div className="services-container">
                {allServices.map((service) => (
                  <button
                    key={service}
                    type="button"
                    className={`service-pill ${selectedServices.includes(service) ? 'selected' : ''}`}
                    onClick={() => setSelectedServices((arr) => 
                      arr.includes(service) ? arr.filter((x) => x !== service) : [...arr, service]
                    )}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aide à la vie partagée (AVP) - Moderne et élégant */}
          <div className="filter-section" style={{ borderBottom: 'none' }}>
            <div className="filter-section-title" style={{ marginBottom: 16 }}>
              <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d9876a">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ color: "#222" }}>Aide à la vie partagée</span>
            </div>
            <div className="avp-filter-container">
              <div 
                className={`avp-option ${selectedAvpEligibility === '' ? 'selected' : ''}`}
                onClick={() => setSelectedAvpEligibility('')}
              >
                <span className="avp-radio">
                  {selectedAvpEligibility === '' && <span className="avp-radio-inner" />}
                </span>
                <span className="avp-label">Tous les établissements</span>
              </div>
              <div 
                className={`avp-option ${selectedAvpEligibility === 'avp_eligible' ? 'selected' : ''}`}
                onClick={() => setSelectedAvpEligibility('avp_eligible')}
              >
                <span className="avp-radio">
                  {selectedAvpEligibility === 'avp_eligible' && <span className="avp-radio-inner" />}
                </span>
                <span className="avp-label">
                  <svg style={{ width: 16, height: 16, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Éligibles AVP
                </span>
              </div>
              <div 
                className={`avp-option ${selectedAvpEligibility === 'non_eligible' ? 'selected' : ''}`}
                onClick={() => setSelectedAvpEligibility('non_eligible')}
              >
                <span className="avp-radio">
                  {selectedAvpEligibility === 'non_eligible' && <span className="avp-radio-inner" />}
                </span>
                <span className="avp-label">
                  <svg style={{ width: 16, height: 16, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Non éligibles
                </span>
              </div>
              <div 
                className={`avp-option ${selectedAvpEligibility === 'a_verifier' ? 'selected' : ''}`}
                onClick={() => setSelectedAvpEligibility('a_verifier')}
              >
                <span className="avp-radio">
                  {selectedAvpEligibility === 'a_verifier' && <span className="avp-radio-inner" />}
                </span>
                <span className="avp-label">
                  <svg style={{ width: 16, height: 16, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  À vérifier
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Colonne centrale : sticky top bar (search+tabs) + contenu principal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Sticky block: search bar + tabs */}
          <div
            style={{
              position: "sticky",
              top: stickyTop,
              zIndex: 20,
              background: "#f3f3f3",
              borderRadius: "0 0 18px 18px",
              padding: "0.5rem 0 0.3rem 0",
              marginBottom: 12,
              minHeight: 64,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03), 0 -4px 12px -4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 0, marginTop: 0, position: "relative" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                style={{ display: "flex", alignItems: "center", width: 420, justifyContent: "center", position: "relative" }}
              >
                <div style={{ background: "#fff", borderRadius: 32, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)", display: "flex", alignItems: "center", width: 420, padding: "0.2em 0.3em", position: "relative" }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Nom, ville, département, type d'habitat, service..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    autoComplete="off"
                    className="search-oblong"
                    style={{ 
                      flex: 1, 
                      border: "none", 
                      outline: "none", 
                      background: "transparent", 
                      fontSize: "0.98rem", 
                      padding: "0.7em 1.1em", 
                      borderRadius: 32 
                    }}
                  />
                  <button 
                    type="submit" 
                    className="search-btn" 
                    style={{ 
                      border: "none", 
                      background: "none", 
                      marginLeft: -44, 
                      zIndex: 2, 
                      cursor: "pointer", 
                      padding: 0 
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", background: "#e0e2e6" }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="2" />
                        <path d="m16 16-3-3" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Dropdown des suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 8,
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      maxHeight: 400,
                      overflowY: 'auto',
                      zIndex: 1000,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.type}-${suggestion.value}-${index}`}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: selectedIndex === index ? '#f0f8ff' : '#fff',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          borderRadius: index === 0 ? '16px 16px 0 0' : index === suggestions.length - 1 ? '0 0 16px 16px' : 0,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedIndex !== index) {
                            e.currentTarget.style.background = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedIndex !== index) {
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: '#333', fontSize: '0.95rem' }}>
                            {suggestion.label}
                          </div>
                          {suggestion.metadata && (
                            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 2 }}>
                              {suggestion.metadata}
                            </div>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Bouton IA Chatbot */}
              <button
                onClick={() => {
                  const event = new CustomEvent('openChatbot');
                  window.dispatchEvent(event);
                }}
                className="ai-chatbot-btn"
                title="Lancer l'assistant IA"
                style={{
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #d9876a 0%, #c67659 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(217, 135, 106, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 135, 106, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(217, 135, 106, 0.3)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <circle cx="9" cy="10" r="1.5" fill="white"/>
                  <circle cx="15" cy="10" r="1.5" fill="white"/>
                  <path d="M8 15c1 1.5 3 2 4 2s3-0.5 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>IA</span>
              </button>

              {/* Bouton Reset à droite de la barre de recherche */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="reset-filters-btn"
                  title="Effacer tous les filtres"
                  style={{
                    flexShrink: 0,
                    opacity: activeFiltersCount > 0 ? 1 : 0.3,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Indicateur de recherche active */}
            {search && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#666",
                  marginTop: "0.5rem",
                  background: "rgba(168, 91, 43, 0.1)",
                  padding: "0.4rem 1rem",
                  borderRadius: "16px",
                  display: "inline-block",
                  margin: "0.5rem auto 0",
                }}
              >
                <strong>Recherche :</strong> &quot;{search}&quot; dans noms, villes, départements, types d&apos;habitat, services...
              </div>
            )}

            {/* Onglets Liste / Carte sous la barre de recherche */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, fontWeight: 600, fontSize: "0.93rem", background: "none", borderRadius: 0, marginBottom: 0, marginTop: 2 }}>
              <span
                onClick={() => setTab("liste")}
                style={{
                  padding: "0.7em 1.7em",
                  color: tab === "liste" ? "#a85b2b" : "#888",
                  background: "none",
                  cursor: "pointer",
                  borderBottom: tab === "liste" ? "3px solid #a85b2b" : "3px solid transparent",
                  transition: "color 0.18s, border-bottom 0.18s",
                  userSelect: "none",
                  position: "relative",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#a85b2b")}
                onMouseOut={(e) => (e.currentTarget.style.color = tab === "liste" ? "#a85b2b" : "#888")}
              >
                Liste
              </span>
              <span style={{ width: 1, height: 28, background: "#e0e2e6", display: "inline-block", margin: "0 0.5em" }} />
              <span
                onClick={() => setTab("carte")}
                style={{
                  padding: "0.7em 1.7em",
                  color: tab === "carte" ? "#a85b2b" : "#888",
                  background: "none",
                  cursor: "pointer",
                  borderBottom: tab === "carte" ? "3px solid #a85b2b" : "3px solid transparent",
                  transition: "color 0.18s, border-bottom 0.18s",
                  userSelect: "none",
                  position: "relative",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#a85b2b")}
                onMouseOut={(e) => (e.currentTarget.style.color = tab === "carte" ? "#a85b2b" : "#888")}
              >
                Carte
              </span>
            </div>
          </div>

          <section style={{ flex: 1, minWidth: 0, marginTop: 12, fontSize: "0.82rem" }}>
            {!loading && !error && (tab === "carte" ? (
              <div style={{ width: "100%", maxWidth: 900, margin: "8px auto 0" }}>
                {mounted && (
                  <EtabMap
                    etablissements={mapData.map((etab) => ({
                      ...etab,
                      longitude: etab.geom?.coordinates?.[0],
                      latitude: etab.geom?.coordinates?.[1],
                    }))}
                  />
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: 0, padding: 0, width: "100%", maxWidth: 900, marginLeft: "auto", marginRight: "auto", fontSize: "0.82rem" }}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {data.map((etab) => (
                    <div
                      key={etab.etab_id}
                      style={{
                        background: "#fff",
                        borderRadius: "18px",
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                        border: "1.5px solid #e0e2e6",
                        padding: 0,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "row",
                        gap: 0,
                        alignItems: "stretch",
                        minHeight: 160,
                      }}
                    >
                    {/* Vignette image */}
                    <div
                      style={{
                        minWidth: 140,
                        maxWidth: 160,
                        width: 140,
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f4f4f4",
                        borderTopLeftRadius: 18,
                        borderBottomLeftRadius: 18,
                        overflow: "hidden",
                        margin: 10,
                      }}
                    >
                      {(() => {
                        const imgSrc = etab.image_path
                          ? getSupabaseImageUrl(etab.image_path)
                          : getHabitatImage(etab.sous_categories ?? null);
                        return <Image src={imgSrc} alt={etab.nom} width={120} height={100} style={{ objectFit: "contain", borderRadius: 10, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }} />;
                      })()}
                    </div>

                    {/* Corps carte */}
                    <div style={{ flex: 1, padding: "1rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center", fontSize: "0.91rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 2, justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            {(() => {
                              const sousCategorie = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 ? etab.sous_categories[0] : "habitat_alternatif";
                              
                              // Recherche avec tolérance pour trouver la sous-catégorie dans la taxonomie
                              let sousCat = getAllSousCategories().find((sc) => sc.key === sousCategorie);
                              if (!sousCat) {
                                // Recherche avec tolérance aux variations de nom
                                sousCat = findSousCategorieWithTolerance(sousCategorie);
                              }
                              
                              // Obtenir la couleur via le mapping centralisé
                              const color = sousCat ? getSousCategorieColor(sousCat.key) : getSousCategorieColor("habitat_alternatif");
                              const displayLabel = sousCat?.label || sousCategorie?.charAt(0).toUpperCase() + sousCategorie?.slice(1) || "Autre";
                              
                              return (
                                <span
                                  style={{
                                    display: "inline-block",
                                    minWidth: 0,
                                    padding: "0.18em 0.7em",
                                    fontSize: "0.86rem",
                                    fontWeight: 600,
                                    borderRadius: 7,
                                    background: color,
                                    color: "#fff",
                                    letterSpacing: "0.01em",
                                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.06)",
                                  }}
                                >
                                  {displayLabel}
                                </span>
                              );
                            })()}
                            <div style={{ fontWeight: "bold", fontSize: "1.02rem", color: "#a85b2b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{etab.nom}</div>
                          </div>
                          <div style={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: "1.02rem", color: etab.fourchette_prix === "euro" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€</span>
                            <span style={{ fontSize: "1.02rem", color: etab.fourchette_prix === "deux_euros" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€€</span>
                            <span style={{ fontSize: "1.02rem", color: etab.fourchette_prix === "trois_euros" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€€€</span>
                          </div>
                        </div>
                        <a
                          href={`/plateforme/fiche?id=${encodeURIComponent(etab.etab_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            background: "#23272f",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "0.38rem 1.1rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            fontSize: "0.98rem",
                            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                            border: "none",
                            transition: "all 0.18s",
                            cursor: "pointer",
                            minWidth: 120,
                            textAlign: "center",
                          }}
                          onMouseOver={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "#444";
                            (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                          }}
                          onMouseOut={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "#23272f";
                            (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                          }}
                        >
                          Voir la fiche
                        </a>
                      </div>

                      {/* Badge éligibilité AVP */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px", marginBottom: "8px" }}>
                        {etab.eligibilite_statut && (
                          <AvpBadge status={etab.eligibilite_statut as "avp_eligible" | "non_eligible" | "a_verifier"} />
                        )}
                      </div>

                      <div style={{ color: "#444", marginBottom: "0.3rem", fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2 as unknown as number, WebkitBoxOrient: "vertical" as unknown as "vertical" }}>
                        {etab.presentation}
                      </div>
                      <div style={{ color: "#888", fontSize: "0.88rem" }}>
                        {etab.commune} ({etab.departement}, {etab.region}) {etab.code_postal}
                      </div>

                      <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.5em 0 0.2em 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {PUBLIC_CIBLE_OPTIONS.map(
                          (opt) =>
                            etab.public_cible &&
                            etab.public_cible.includes(opt.key) && (
                              <BadgeIcon key={opt.key} type="public-cible" name={opt.key} label={opt.label} size="sm" />
                            )
                        )}
                      </div>

                      {Array.isArray(etab.services) && etab.services.length > 0 && (
                        <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.2em 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {etab.services.map((s, idx) => (
                            <BadgeIcon key={idx} type="services" name={s} label={s === "espace_partage" ? "Espace Partagé" : s} size="sm" />
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0.2rem 0" }}>
                        {RESTAURATION_OPTIONS.filter(opt => opt.key in etab && Boolean((etab as unknown as Record<string, unknown>)[opt.key])).map(opt => (
                          <BadgeIcon key={opt.key} type="restauration" name={opt.key} label={opt.label} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Contrôles de pagination */}
              {!loading && !error && tab === "liste" && totalCount > 0 && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "1rem", 
                  marginTop: "2rem",
                  padding: "1rem",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? "#e0e0e0" : "linear-gradient(135deg, #a85b2b 0%, #d35400 100%)",
                      color: currentPage === 1 ? "#999" : "white",
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 24px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      boxShadow: currentPage === 1 ? "none" : "0 4px 12px rgba(168, 91, 43, 0.3)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                    <span>Précédent</span>
                  </button>
                  
                  <div style={{ 
                    background: "#fff", 
                    borderRadius: "12px", 
                    padding: "12px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1.5px solid #e0e2e6",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4
                  }}>
                    <span style={{ color: "#333" }}>Page {currentPage} / {totalPages}</span>
                    <span style={{ fontSize: "0.8rem", color: "#666" }}>{totalCount} résultat{totalCount > 1 ? 's' : ''}</span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasMore}
                    style={{
                      background: !hasMore ? "#e0e0e0" : "linear-gradient(135deg, #a85b2b 0%, #d35400 100%)",
                      color: !hasMore ? "#999" : "white",
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 24px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: !hasMore ? "not-allowed" : "pointer",
                      boxShadow: !hasMore ? "none" : "0 4px 12px rgba(168, 91, 43, 0.3)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <span>Suivant</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              )}

              {/* Disclaimer en bas de liste */}
              {!loading && !error && tab === "liste" && data.length > 0 && (
                <div style={{
                  marginTop: "3rem",
                  padding: "16px 20px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  border: "1px solid #e5e5e5",
                  fontSize: "0.85rem",
                  color: "#666",
                  textAlign: "center",
                  lineHeight: 1.6
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="8" r="1" fill="#888"/>
                  </svg>
                  Les données affichées (tarifs, services, descriptions) proviennent de <strong>sources publiques</strong> et sont enrichies par ingénierie de la donnée.
                  <br />
                  Malgré nos efforts pour garantir leur fiabilité, nous vous recommandons de <strong>vérifier les informations directement auprès des établissements</strong>.
                  <br />
                  <a href="/contact" style={{ color: "#d9876a", textDecoration: "none", fontWeight: 600, marginLeft: 4 }}>Nous contacter</a>
                </div>
              )}
              </div>
            ))}
            {loading && <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>Chargement...</div>}
            {error && <div style={{ textAlign: "center", color: "#a82b2b", marginTop: 40 }}>Erreur : {error}</div>}
          </section>
        </div>
      </div>
      
      {/* Modal Chatbot */}
      <ChatbotIcon />
    </main>
  );
}

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PlateformeContent />
    </Suspense>
  );
}
