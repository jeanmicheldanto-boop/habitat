"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import HeaderSubnavGate from "@/components/HeaderSubnavGate";
import DepartmentAutocomplete from "@/components/DepartmentAutocomplete";
import MobileFilters from "@/components/MobileFilters";
import MobileResultsList from "@/components/MobileResultsList";
import type { EtablissementResult } from "@/components/MobileResultsList";
import { supabase } from "../../lib/supabaseClient";
import { HABITAT_TAXONOMY, getSousCategorieColor, getAllSousCategories, getCategoryByKey } from "@/lib/habitatTaxonomy";
import { getHabitatImage } from "@/lib/habitatImages";
import BadgeIcon, { Badge } from "@/components/BadgeIcon";
import AvpBadge from "@/components/AvpBadge";
import './plateforme.css';
import Image from 'next/image';
// Palette de couleurs pour les sous-catégories (maintenant gérée par la taxonomie)
const TAG_COLORS: Record<string, string> = {
  // Ancienne palette pour compatibilité - sera migrée vers getSousCategorieColor
  "résidence autonomie": "#a85b2b",
  "résidence services": "#2b7fa8",
  "résidence service séniors": "#2b7fa8",
  "colocation": "#2ba85b",
  "maison partagée": "#a82b7f",
  "béguinage": "#e0a800",
  "ehpad": "#a82b2b",
  "foyer logement": "#2b2ba8",
  "habitat inclusif": "#2ba8a8",
  "accueil familial": "#8b4513",
  "logement accompagné": "#9932cc",
  "autre": "#888"
};

const HABITAT_TYPE_LABELS: Record<string, string> = {
  // Anciens labels - remplacés par la taxonomie
  "logement_independant": "Logement indépendant",
  "residence": "Résidence", 
  "habitat_partage": "Habitat partagé",
  // Nouveaux labels de la taxonomie
  "habitat_individuel": "Habitat individuel",
  "logement_individuel_en_residence": "Logement individuel en résidence"
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
  fourchette_prix?: string;
  prix_min?: number;
  prix_max?: number;
  presentation?: string;
  public_cible?: string[];
  services?: string[];
  logements_types?: LogementType[];
  habitat_type?: string;
  geom?: { coordinates: [number, number] };
  eligibilite_statut?: string;
}

export default function Page() {
  // --- HOOKS ET LOGIQUE ---
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => { 
    setMounted(true);
    
    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [tab, setTab] = useState<'liste'|'carte'>('liste');
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sousCategories, setSousCategories] = useState<string[]>([]);
  
  // Nouveaux filtres pour habitat_type - Utilisation de la taxonomie
  const [selectedHabitatCategories, setSelectedHabitatCategories] = useState<string[]>([]);
  const [selectedSousCategories, setSelectedSousCategories] = useState<string[]>([]);
  const PRICE_UI_TO_DB: Record<string, string> = { '€': 'euro', '€€': 'deux_euros', '€€€': 'trois_euros' };
  const PRICE_DB_TO_UI: Record<string, string> = { 'euro': '€', 'deux_euros': '€€', 'trois_euros': '€€€' };
  const [selectedPrices, setSelectedPrices] = useState<Array<'€'|'€€'|'€€€'>>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const RESTAURATION_OPTIONS = [
    { key: "kitchenette", label: "Kitchenette" },
    { key: "resto_collectif_midi", label: "Resto midi" },
    { key: "resto_collectif", label: "Resto collectif" },
    { key: "portage_repas", label: "Portage repas" }
  ];
  const [selectedRestauration, setSelectedRestauration] = useState<{[k:string]:boolean}>({});
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
    { key: "alzheimer_accessible", label: "Alzheimer" }
  ];
  const [selectedPublicCible, setSelectedPublicCible] = useState<string[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<string>("");
  // Filtre AVP
  const [selectedAvpEligibility, setSelectedAvpEligibility] = useState<string>(""); // '', 'avp_eligible', 'non_eligible', 'a_verifier'
  // Sticky responsive: top = 80px (desktop), 120px (mobile)
  const [stickyTop, setStickyTop] = useState(80);
  useEffect(() => {
    function handleResize() {
      setStickyTop(window.innerWidth < 700 ? 120 : 80);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [selectedCommune, setSelectedCommune] = useState<string>("");

  // Récupérer le paramètre de recherche depuis l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search');
      if (searchParam) {
        setSearch(searchParam);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("v_liste_publication_geoloc").select("*").limit(500);
      if (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(error.message);
      } else {
        console.log("Données chargées:", data?.length || 0, "établissements");
        // Debug: afficher les premiers établissements
        if (data && data.length > 0) {
          console.log("Premier établissement:", data[0]);
        }
      }
      setData(data || []);
      setLoading(false);
    }
    fetchData();
    async function fetchSousCategories() {
      const { data } = await supabase
        .from("v_liste_publication_geoloc")
        .select("sous_categories, services, logements_types, habitat_type")
        .limit(500);
      if (data) {
  const allSousCat = data.flatMap((row: { sous_categories?: string[] }) => row.sous_categories || []);
        const uniqueSousCat = Array.from(new Set(allSousCat)).sort();
        console.log("Sous-catégories disponibles:", uniqueSousCat);
        setSousCategories(uniqueSousCat);
        
  const allServ = data.flatMap((row: { services?: string[] }) => row.services || []);
        const uniqueServices = Array.from(new Set(allServ)).sort();
        console.log("Services disponibles:", uniqueServices);
        setAllServices(uniqueServices);
        
  const allLogTypes = data.flatMap((row: { logements_types?: LogementType[] }) => (row.logements_types || []).map((lt: LogementType) => lt.libelle).filter(Boolean));
        setAllLogementTypes(Array.from(new Set(allLogTypes)).sort());

        // Debug: afficher les types d'habitat disponibles
  const allHabitatTypes = data.map((row: { habitat_type?: string }) => row.habitat_type).filter(Boolean);
        const uniqueHabitatTypes = Array.from(new Set(allHabitatTypes));
        console.log("Types d'habitat disponibles (habitat_type):", uniqueHabitatTypes);
      }
    }
    fetchSousCategories();
  }, []);

  function getFilteredData() {
    const filtered = data.filter((etab:unknown) => {
      const etabObj = etab as Etablissement;
      // Catégories d'habitat (nouvelles catégories principales)
      if (selectedHabitatCategories.length > 0) {
        if (!etabObj.habitat_type) return false;
        if (!selectedHabitatCategories.includes(etabObj.habitat_type)) return false;
      }
      
      // Sous-catégories d'habitat
      if (selectedSousCategories.length > 0) {
        if (!etabObj.sous_categories || !Array.isArray(etabObj.sous_categories)) return false;
        const hasMatch = selectedSousCategories.some(sc => etabObj.sous_categories.includes(sc));
        if (!hasMatch) return false;
      }
      
      // Prix
      if (selectedPrices.length > 0) {
        const dbValue = etabObj.fourchette_prix;
        if (!dbValue) return false;
        const uiValue = PRICE_DB_TO_UI[dbValue] as "€"|"€€"|"€€€"|undefined;
        if (!uiValue || !selectedPrices.includes(uiValue)) return false;
      }
      
      // Services dynamiques (au moins un des services sélectionnés doit être présent)
      if (selectedServices.length > 0) {
        if (!etabObj.services || !Array.isArray(etabObj.services)) return false;
        const hasServiceMatch = selectedServices.some(s => etabObj.services.includes(s));
        if (!hasServiceMatch) return false;
      }
      
      // Restauration (toutes les cases cochées doivent être vraies)
      if (Object.values(selectedRestauration).some(Boolean)) {
        for (const key of Object.keys(selectedRestauration)) {
          if (selectedRestauration[key] && !(etabObj as any)[key]) return false;
        }
      }
      
      // Types de logement (au moins un type sélectionné doit être présent)
      if (selectedLogementTypes.length > 0) {
        if (!Array.isArray(etabObj.logements_types)) return false;
        const found = etabObj.logements_types.some((lt:unknown) => selectedLogementTypes.includes((lt as LogementType).libelle));
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
        if (!Array.isArray(etabObj.logements_types)) return false;
        const found = etabObj.logements_types.some((lt:unknown) => {
          const logement = lt as LogementType;
          if (selectedCaracteristiques.meuble && !logement.meuble) return false;
          if (selectedCaracteristiques.pmr && !logement.pmr) return false;
          if (selectedCaracteristiques.domotique && !logement.domotique) return false;
          if (selectedCaracteristiques.plain_pied && !logement.plain_pied) return false;
          if (
            selectedCaracteristiques.surface_min &&
            (logement.surface_min == null || Number(logement.surface_min) < Number(selectedCaracteristiques.surface_min))
          ) return false;
          if (
            selectedCaracteristiques.surface_max &&
            (logement.surface_max == null || Number(logement.surface_max) > Number(selectedCaracteristiques.surface_max))
          ) return false;
          return true;
        });
        if (!found) return false;
      }
      
      // Public cible (au moins une case cochée doit être présente)
      if (selectedPublicCible.length > 0) {
        if (!Array.isArray(etabObj.public_cible)) return false;
        if (!selectedPublicCible.some(pc => etabObj.public_cible.includes(pc))) return false;
      }
      
      // Localisation - Support des codes et noms de départements
  if (selectedDepartement && etabObj.departement) {
        // Si selectedDepartement est un code (2-3 chiffres ou lettres), on compare directement
        // Sinon on fait une recherche textuelle dans le nom du département
        const isCode = /^[\d]{1,3}[AB]?$/.test(selectedDepartement);
        if (isCode) {
          // Comparaison exacte avec le code
          if (etabObj.departement !== selectedDepartement) return false;
        } else {
          // Recherche textuelle dans le nom (pour compatibilité)
          if (!etabObj.departement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(selectedDepartement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))) return false;
        }
      }
      
      // Filtre éligibilité AVP
  if (selectedAvpEligibility && etabObj.eligibilite_statut !== selectedAvpEligibility) return false;
  if (selectedCommune && etabObj.commune && !etabObj.commune.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(selectedCommune.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))) return false;
      
      // Recherche texte - recherche globale dans tous les champs pertinents
      if (search) {
        const searchLower = search.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 1);
        
        const matchesSearch = searchTerms.every(term => {
          // Recherche dans le nom de l'établissement
          if (etabObj.nom && etabObj.nom.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          
          // Recherche dans la présentation
          if (etabObj.presentation && etabObj.presentation.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          
          // Recherche dans la localisation (commune, département, région)
          if (etabObj.commune && etabObj.commune.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          if (etabObj.departement && etabObj.departement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          if (etabObj.region && etabObj.region.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          
          // Recherche dans le type d'habitat
          if (etabObj.habitat_type) {
            const habitatLabel = HABITAT_TYPE_LABELS[etabObj.habitat_type] || etabObj.habitat_type;
            if (habitatLabel.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          }
          
          // Recherche dans les sous-catégories
          if (Array.isArray(etabObj.sous_categories)) {
            if (etabObj.sous_categories.some((sc: string) => 
              sc.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
            )) return true;
          }
          
          // Recherche dans les services
          if (Array.isArray(etabObj.services)) {
            if (etabObj.services.some((service: string) => 
              service.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
            )) return true;
          }
          
          // Recherche dans le gestionnaire
          if (etabObj.gestionnaire && etabObj.gestionnaire.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) return true;
          
          // Recherche dans les types de logement
          if (Array.isArray(etabObj.logements_types)) {
            if (etabObj.logements_types.some((lt: unknown) => 
              (lt as LogementType).libelle && (lt as LogementType).libelle.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
            )) return true;
          }
          
          return false;
        });
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });

    // Debug logging
    if (selectedHabitatCategories.length > 0 || selectedSousCategories.length > 0 || selectedServices.length > 0) {
      console.log(`Filtres appliqués:`, {
        habitatCategories: selectedHabitatCategories,
        sousCategories: selectedSousCategories,
        services: selectedServices,
        resultats: filtered.length
      });
    }

    return filtered;
  }

  // Import dynamique de la carte pour SSR
  const EtabMap = dynamic(() => import("../../components/EtabMap"), { ssr: false });
  
  const filteredData = getFilteredData();
  
  // --- RENDU JSX ---
  if (isMobile) {
    return (
      <main style={{ background: "#f8f8f8", minHeight: "100vh", fontSize: "0.95rem" }}>
        <HeaderSubnavGate />
        
        {/* Barre de recherche mobile */}
        <div style={{
          background: '#fff',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 64,
          zIndex: 100
        }}>
          <div style={{
            background: '#f8f8f8',
            borderRadius: 25,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Nom, ville, département, type d&#39;habitat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                outline: 'none',
                color: '#333'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          
          {/* Indicateur de recherche active */}
          {search && (
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.8rem', 
              color: '#666', 
              marginTop: '8px',
              background: 'rgba(168, 91, 43, 0.1)',
              padding: '4px 12px',
              borderRadius: '12px',
              display: 'inline-block',
              width: '100%'
            }}>
              <strong>Recherche :</strong> &quot;{search}&quot; dans tous les champs
            </div>
          )}
        </div>

        {/* Onglets Liste/Carte mobile */}
        <div style={{
          background: '#fff',
          display: 'flex',
          borderBottom: '1px solid #eee'
        }}>
          <button
            onClick={() => setTab('liste')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'liste' ? '3px solid #a85b2b' : '3px solid transparent',
              color: tab === 'liste' ? '#a85b2b' : '#666',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            📋 Liste ({filteredData.length})
          </button>
          <button
            onClick={() => setTab('carte')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'carte' ? '3px solid #a85b2b' : '3px solid transparent',
              color: tab === 'carte' ? '#a85b2b' : '#666',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🗺️ Carte
          </button>
        </div>

        {/* Contenu mobile */}
        {!loading && !error && (
          tab === 'carte' ? (
            <div style={{ height: 'calc(100vh - 200px)', padding: '16px' }}>
              {mounted && (
                <EtabMap etablissements={filteredData.map((etab:any) => ({
                  ...etab,
                  longitude: etab.geom?.coordinates?.[0],
                  latitude: etab.geom?.coordinates?.[1],
                }))} />
              )}
            </div>
          ) : (
            <MobileResultsList 
              results={filteredData as EtablissementResult[]}
              publicCibleOptions={PUBLIC_CIBLE_OPTIONS}
              restaurationOptions={RESTAURATION_OPTIONS}
            />
          )
        )}
        
        {loading && (
          <div style={{ textAlign: "center", color: "#888", marginTop: 40, padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
            <div>Chargement des établissements...</div>
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: "center", color: "#a82b2b", marginTop: 40, padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
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
          // allLogementTypes prop removed to match MobileFiltersProps
          resultsCount={filteredData.length}
        />
      </main>
    );
  }
  
  // Version desktop
  return (
  <main style={{ background: "#f3f3f3", minHeight: "100vh", padding: 0, fontSize: "0.95rem" }}>
    <HeaderSubnavGate />
  
    {/* Ligne principale : sidebar, sticky top bar (search+tabs), contenu */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36, maxWidth: 1600, margin: '0 auto', padding: '0 1.5rem', marginTop: 0 }}>
      {/* Sidebar filtres sticky sous le header */}
  <aside style={{ minWidth: 290, maxWidth: 340, width: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)', padding: '2.2rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 64, height: 'calc(100vh - 64px)', zIndex: 10, marginTop: 0, overflowY: 'auto', fontSize: '0.82rem' }}>
        
        {/* Section Gestionnaire - En haut des filtres */}
        <div style={{
          background: 'linear-gradient(135deg, #6c6c6c 0%, #d35400 100%)',
          borderRadius: 16,
          padding: '20px 18px',
          textAlign: 'center',
          color: 'white',
          marginBottom: 8
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>
            Proposez votre habitat ?
          </div>
          <div style={{ fontSize: '0.8rem', marginBottom: 16, opacity: 0.9, lineHeight: 1.3 }}>
            Référencez votre établissement sur la plateforme
          </div>
          <button
            onClick={() => window.location.href = '/gestionnaire/create'}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✨ Ajouter mon habitat
          </button>
        </div>

        {/* Localisation */}
        <div>
          <div className="filtre-label">Localisation</div>
          <DepartmentAutocomplete 
            value={selectedDepartement}
            onChange={setSelectedDepartement}
            placeholder="Département"
            className="filtre-input"
          />
          <input type="text" placeholder="Commune" value={selectedCommune} onChange={e => setSelectedCommune(e.target.value)} className="filtre-input" style={{ marginTop: 8 }} />
        </div>

        {/* Filtre éligibilité AVP */}
        <div>
          <div className="filtre-label">Éligibilité AVP</div>
          <select 
            value={selectedAvpEligibility} 
            onChange={e => setSelectedAvpEligibility(e.target.value)} 
            className="filtre-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="">Tous les établissements</option>
            <option value="avp_eligible">✓ Éligibles AVP</option>
            <option value="non_eligible">✗ Non éligibles</option>
            <option value="a_verifier">? À vérifier</option>
          </select>
        </div>
        {/* Types d'habitat - Nouvelle structure hiérarchique */}
        <div>
          <div className="filtre-label">Types d'habitat</div>
          
          {/* Catégories principales */}
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <div className="text-xs font-medium text-gray-600 mb-2">Catégories principales</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {HABITAT_TAXONOMY.map(category => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedHabitatCategories(arr => 
                    arr.includes(category.key) 
                      ? arr.filter(x => x !== category.key) 
                      : [...arr, category.key]
                  )}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.6rem 0.8rem',
                    borderRadius: 10,
                    border: '1.5px solid',
                    borderColor: selectedHabitatCategories.includes(category.key) ? '#a85b2b' : '#e0e2e6',
                    background: selectedHabitatCategories.includes(category.key) ? '#a85b2b' : '#fff',
                    color: selectedHabitatCategories.includes(category.key) ? '#fff' : '#444',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                    boxShadow: selectedHabitatCategories.includes(category.key) 
                      ? '0 2px 6px 0 rgba(168,91,43,0.10)' 
                      : '0 1px 2px 0 rgba(0,0,0,0.03)',
                  }}
                  onMouseOver={e => {
                    if (!selectedHabitatCategories.includes(category.key)) {
                      e.currentTarget.style.borderColor = '#a85b2b';
                      e.currentTarget.style.backgroundColor = '#fef9f5';
                    }
                  }}
                  onMouseOut={e => {
                    if (!selectedHabitatCategories.includes(category.key)) {
                      e.currentTarget.style.borderColor = '#e0e2e6';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sous-catégories */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">Sous-catégories</div>
            <div className="filtre-checkbox-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {getAllSousCategories().map(sousCategorie => {
                const parentCategory = getCategoryByKey(
                  HABITAT_TAXONOMY.find(cat => 
                    cat.sousCategories.some(sc => sc.key === sousCategorie.key)
                  )?.key || ''
                );
                return (
                  <label key={sousCategorie.key} className="filtre-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedSousCategories.includes(sousCategorie.key)} 
                      onChange={e => setSelectedSousCategories(arr => 
                        e.target.checked 
                          ? [...arr, sousCategorie.key] 
                          : arr.filter(x => x !== sousCategorie.key)
                      )} 
                    />
                    <span style={{ 
                      color: getSousCategorieColor(sousCategorie.key),
                      fontSize: '0.82rem'
                    }}>
                      {parentCategory?.icon} {sousCategorie.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Public cible */}
        <div>
          <div className="filtre-label">Public cible</div>
          <div className="filtre-checkbox-group">
            {PUBLIC_CIBLE_OPTIONS.map(opt => (
              <label key={opt.key} className="filtre-checkbox-label">
                <input type="checkbox" checked={selectedPublicCible.includes(opt.key)} onChange={e => setSelectedPublicCible(arr => e.target.checked ? [...arr, opt.key] : arr.filter(x => x !== opt.key))} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        {/* Prix */}
        <div>
          <div className="filtre-label">Tarif</div>
          <div style={{ display: 'flex', gap: 10, margin: '0.5em 0' }}>
            {['€', '€€', '€€€'].map(prix => (
              <button
                key={prix}
                type="button"
                onClick={() => setSelectedPrices(arr => arr.includes(prix as '€'|'€€'|'€€€') ? arr.filter(x => x !== prix) : [...arr, prix as '€'|'€€'|'€€€'])}
                style={{
                  padding: '0.5em 1.2em',
                  borderRadius: 24,
                  border: '1.5px solid',
                  borderColor: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#a85b2b' : '#e0e2e6',
                  background: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#a85b2b' : '#fff',
                  color: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#fff' : '#a85b2b',
                  fontWeight: 600,
                  fontSize: '1.05em',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  boxShadow: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '0 2px 8px 0 rgba(168,91,43,0.08)' : 'none',
                }}
              >{prix}</button>
            ))}
          </div>
        </div>
        {/* Restauration */}
        <div>
          <div className="filtre-label">Restauration</div>
          <div className="filtre-checkbox-group">
            {RESTAURATION_OPTIONS.map(opt => (
              <label key={opt.key} className="filtre-checkbox-label">
                <input type="checkbox" checked={!!selectedRestauration[opt.key]} onChange={e => setSelectedRestauration(obj => ({ ...obj, [opt.key]: e.target.checked }))} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        {/* Types de logement */}
        <div>
          <div className="filtre-label">Types de logement</div>
          <div className="filtre-checkbox-group">
            {allLogementTypes.map(type => (
              <label key={type} className="filtre-checkbox-label">
                <input type="checkbox" checked={selectedLogementTypes.includes(type)} onChange={e => setSelectedLogementTypes(arr => e.target.checked ? [...arr, type] : arr.filter(x => x !== type))} />
                {type}
              </label>
            ))}
          </div>
        </div>
        {/* Caractéristiques */}
        <div>
          <div className="filtre-label">Caractéristiques</div>
          <div className="filtre-checkbox-group">
            <label className="filtre-checkbox-label">
              <input type="checkbox" checked={!!selectedCaracteristiques.meuble} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, meuble: e.target.checked }))} /> Meublé
            </label>
            <label className="filtre-checkbox-label">
              <input type="checkbox" checked={!!selectedCaracteristiques.pmr} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, pmr: e.target.checked }))} /> PMR
            </label>
            <label className="filtre-checkbox-label">
              <input type="checkbox" checked={!!selectedCaracteristiques.domotique} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, domotique: e.target.checked }))} /> Domotique
            </label>
            <label className="filtre-checkbox-label">
              <input type="checkbox" checked={!!selectedCaracteristiques.plain_pied} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, plain_pied: e.target.checked }))} /> Plain-pied
            </label>
            <label className="filtre-checkbox-label">
              <span>Surface min</span>
              <input type="text" value={selectedCaracteristiques.surface_min || ''} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, surface_min: e.target.value }))} style={{ width: 60, marginLeft: 6 }} />
            </label>
            <label className="filtre-checkbox-label">
              <span>Surface max</span>
              <input type="text" value={selectedCaracteristiques.surface_max || ''} onChange={e => setSelectedCaracteristiques(obj => ({ ...obj, surface_max: e.target.value }))} style={{ width: 60, marginLeft: 6 }} />
            </label>
          </div>
        </div>

        {/* Services (placé en dernier) */}
        <div>
          <div className="filtre-label">Services</div>
          <div className="filtre-checkbox-group">
            {allServices.map(service => (
              <label key={service} className="filtre-checkbox-label">
                <input type="checkbox" checked={selectedServices.includes(service)} onChange={e => setSelectedServices(arr => e.target.checked ? [...arr, service] : arr.filter(x => x !== service))} />
                {service}
              </label>
            ))}
          </div>
        </div>
      </aside>
      {/* Colonne centrale : sticky top bar (search+tabs) + contenu principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky block: search bar + tabs */}
        <div style={{
          position: 'sticky',
          top: stickyTop,
          zIndex: 20,
          background: '#f3f3f3',
          borderRadius: '0 0 18px 18px',
          padding: '0.5rem 0 0.3rem 0',
          marginBottom: 12,
          minHeight: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03), 0 -4px 12px -4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginBottom: 0, marginTop: 0 }}>
            <form onSubmit={e => { e.preventDefault(); }} style={{ display: 'flex', alignItems: 'center', width: 420, justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 32, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', width: 420, padding: '0.2em 0.3em' }}>
                <input
                  type="text"
                  placeholder="Nom, ville, département, type d'habitat, service..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="search-oblong"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.98rem', padding: '0.7em 1.1em', borderRadius: 32 }}
                />
                <button type="submit" className="search-btn" style={{ border: 'none', background: 'none', marginLeft: -44, zIndex: 2, cursor: 'pointer', padding: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: '#e0e2e6' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="2"/><path d="m16 16-3-3" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          {/* Indicateur de recherche active */}
          {search && (
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.85rem', 
              color: '#666', 
              marginTop: '0.5rem',
              background: 'rgba(168, 91, 43, 0.1)',
              padding: '0.4rem 1rem',
              borderRadius: '16px',
              display: 'inline-block',
              margin: '0.5rem auto 0',
            }}>
              <strong>Recherche :</strong> &quot;{search}&quot; dans noms, villes, départements, types d&#39;habitat, services...
            </div>
          )}
          {/* Onglets Liste / Carte sous la barre de recherche */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, fontWeight: 600, fontSize: '0.93rem', background: 'none', borderRadius: 0, marginBottom: 0, marginTop: 2 }}>
            <span
              onClick={() => setTab('liste')}
              style={{
                padding: '0.7em 1.7em',
                color: tab === 'liste' ? '#a85b2b' : '#888',
                background: 'none',
                cursor: 'pointer',
                borderBottom: tab === 'liste' ? '3px solid #a85b2b' : '3px solid transparent',
                transition: 'color 0.18s, border-bottom 0.18s',
                userSelect: 'none',
                position: 'relative',
              }}
              onMouseOver={e => (e.currentTarget.style.color = '#a85b2b')}
              onMouseOut={e => (e.currentTarget.style.color = tab === 'liste' ? '#a85b2b' : '#888')}
            >Liste</span>
            <span style={{ width: 1, height: 28, background: '#e0e2e6', display: 'inline-block', margin: '0 0.5em' }} />
            <span
              onClick={() => setTab('carte')}
              style={{
                padding: '0.7em 1.7em',
                color: tab === 'carte' ? '#a85b2b' : '#888',
                background: 'none',
                cursor: 'pointer',
                borderBottom: tab === 'carte' ? '3px solid #a85b2b' : '3px solid transparent',
                transition: 'color 0.18s, border-bottom 0.18s',
                userSelect: 'none',
                position: 'relative',
              }}
              onMouseOver={e => (e.currentTarget.style.color = '#a85b2b')}
              onMouseOut={e => (e.currentTarget.style.color = tab === 'carte' ? '#a85b2b' : '#888')}
            >Carte</span>
          </div>
        </div>
  <section style={{ flex: 1, minWidth: 0, marginTop: 12, fontSize: '0.82rem' }}>
              {!loading && !error && (
                tab === 'carte' ? (
                  <div style={{ width: "100%", maxWidth: 900, margin: '8px auto 0' }}>
                    {mounted && (
                      <EtabMap etablissements={filteredData.map((etab:any) => ({
                        ...etab,
                        longitude: etab.geom?.coordinates?.[0],
                        latitude: etab.geom?.coordinates?.[1],
                      }))} />
                    )}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem", margin: 0, padding: 0, width: "100%", maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', fontSize: '0.82rem' }}>
                    {filteredData.map((etab:any) => (
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
                          minHeight: 160
                        }}
                      >
                        {/* ...existing code for card... */}
                        <div style={{ minWidth: 140, maxWidth: 160, width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f4", borderTopLeftRadius: 18, borderBottomLeftRadius: 18, overflow: "hidden", margin: 10 }}>
                          {/* --- PATCHED CARD IMAGE --- */}
                          {(() => {
                            const imgSrc = etab.image_path 
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${etab.image_path}`
                              : getHabitatImage(etab.sous_categories);
                            return (
                              <Image
                                src={imgSrc}
                                alt={etab.nom}
                                width={120}
                                height={100}
                                style={{ objectFit: "contain", borderRadius: 10, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}
                              />
                            );
                          })()}
                        </div>
                        <div style={{ flex: 1, padding: "1rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center", fontSize: "0.91rem" }}>
                          {/* ...existing code for card text... */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2, justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {(() => {
                                const sousCategorie = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 ? etab.sous_categories[0] : "habitat_alternatif";
                                // Utiliser la nouvelle fonction de couleur de la taxonomie
                                const color = getSousCategorieColor(sousCategorie) || getSousCategorieColor("habitat_alternatif");
                                return (
                                  <span style={{
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
                                    marginRight: 2
                                  }}>
                                    {(() => {
                                      // Chercher le label de la sous-catégorie dans la taxonomie
                                      const sousCat = getAllSousCategories().find(sc => sc.key === sousCategorie);
                                      return sousCat?.label || sousCategorie?.charAt(0).toUpperCase() + sousCategorie?.slice(1) || "Autre";
                                    })()}
                                  </span>
                                );
                              })()}
                              <div style={{ fontWeight: "bold", fontSize: "1.02rem", color: "#a85b2b" }}>
                                {etab.nom}
                              </div>
                              <div style={{ display: "flex", gap: 3, alignItems: "center", marginLeft: 8 }}>
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
                                textAlign: "center"
                              }}
                              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#444'; (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#23272f'; (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
                            >  
                              Voir la fiche
                            </a>
                          </div>
                          {/* Badge éligibilité AVP */}
                          <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "6px",
                            marginBottom: "8px"
                          }}>
                            {etab.eligibilite_statut && etab.eligibilite_statut !== null && etab.eligibilite_statut !== '' && (
                              <AvpBadge 
                                status={etab.eligibilite_statut as 'avp_eligible' | 'non_eligible' | 'a_verifier'} 
                              />
                            )}
                          </div>
                          <div style={{ color: "#444", marginBottom: "0.3rem", fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {etab.presentation}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.88rem" }}>
                            {etab.commune} ({etab.departement}, {etab.region}) {etab.code_postal}
                          </div>
                          <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.5em 0 0.2em 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            {PUBLIC_CIBLE_OPTIONS.map(opt => etab.public_cible && etab.public_cible.includes(opt.key) && (
                              <BadgeIcon 
                                key={opt.key} 
                                type="public-cible" 
                                name={opt.key} 
                                label={opt.label}
                                size="sm"
                              />
                            ))}
                          </div>
                          {Array.isArray(etab.services) && etab.services.length > 0 && (
                            <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.2em 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {etab.services.map((s:string, idx:number) => (
                                <BadgeIcon 
                                  key={idx} 
                                  type="services" 
                                  name={s} 
                                  label={s === "espace_partage" ? "Espace Partagé" : s}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0.2rem 0" }}>
                            {RESTAURATION_OPTIONS.map(opt => etab[opt.key] && (
                              <BadgeIcon 
                                key={opt.key} 
                                type="restauration" 
                                name={opt.key} 
                                label={opt.label}
                                size="sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {loading && <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>Chargement...</div>}
              {error && <div style={{ textAlign: "center", color: "#a82b2b", marginTop: 40 }}>Erreur : {error}</div>}
            </section>
          </div>
        </div>
    </main>
  );
}