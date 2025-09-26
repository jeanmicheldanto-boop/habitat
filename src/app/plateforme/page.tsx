"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderSubnavGate from "@/components/HeaderSubnavGate";
import DepartmentAutocomplete from "@/components/DepartmentAutocomplete";
import { supabase } from "../../lib/supabaseClient";
import { HABITAT_TAXONOMY, getSousCategorieColor, getAllSousCategories, getCategoryByKey } from "@/lib/habitatTaxonomy";
import './plateforme.css';
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

export default function Page() {
  // --- HOOKS ET LOGIQUE ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [tab, setTab] = useState<'liste'|'carte'>('liste');
  const [data, setData] = useState<any[]>([]);
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
        const allSousCat = data.flatMap((row:any) => row.sous_categories || []);
        const uniqueSousCat = Array.from(new Set(allSousCat)).sort();
        console.log("Sous-catégories disponibles:", uniqueSousCat);
        setSousCategories(uniqueSousCat);
        
        const allServ = data.flatMap((row:any) => row.services || []);
        const uniqueServices = Array.from(new Set(allServ)).sort();
        console.log("Services disponibles:", uniqueServices);
        setAllServices(uniqueServices);
        
        const allLogTypes = data.flatMap((row:any) => (row.logements_types || []).map((lt:any) => lt.libelle).filter(Boolean));
        setAllLogementTypes(Array.from(new Set(allLogTypes)).sort());

        // Debug: afficher les types d'habitat disponibles
        const allHabitatTypes = data.map((row:any) => row.habitat_type).filter(Boolean);
        const uniqueHabitatTypes = Array.from(new Set(allHabitatTypes));
        console.log("Types d'habitat disponibles (habitat_type):", uniqueHabitatTypes);
      }
    }
    fetchSousCategories();
  }, []);

  function getFilteredData() {
    let filtered = data.filter((etab:any) => {
      // Catégories d'habitat (nouvelles catégories principales)
      if (selectedHabitatCategories.length > 0) {
        if (!etab.habitat_type) return false;
        if (!selectedHabitatCategories.includes(etab.habitat_type)) return false;
      }
      
      // Sous-catégories d'habitat
      if (selectedSousCategories.length > 0) {
        if (!etab.sous_categories || !Array.isArray(etab.sous_categories)) return false;
        const hasMatch = selectedSousCategories.some(sc => etab.sous_categories.includes(sc));
        if (!hasMatch) return false;
      }
      
      // Prix
      if (selectedPrices.length > 0) {
        const dbValue = etab.fourchette_prix;
        if (!dbValue) return false;
        const uiValue = PRICE_DB_TO_UI[dbValue] as "€"|"€€"|"€€€"|undefined;
        if (!uiValue || !selectedPrices.includes(uiValue)) return false;
      }
      
      // Services dynamiques (au moins un des services sélectionnés doit être présent)
      if (selectedServices.length > 0) {
        if (!etab.services || !Array.isArray(etab.services)) return false;
        const hasServiceMatch = selectedServices.some(s => etab.services.includes(s));
        if (!hasServiceMatch) return false;
      }
      
      // Restauration (toutes les cases cochées doivent être vraies)
      if (Object.values(selectedRestauration).some(Boolean)) {
        for (const key of Object.keys(selectedRestauration)) {
          if (selectedRestauration[key] && !etab[key]) return false;
        }
      }
      
      // Types de logement (au moins un type sélectionné doit être présent)
      if (selectedLogementTypes.length > 0) {
        if (!Array.isArray(etab.logements_types)) return false;
        const found = etab.logements_types.some((lt:any) => selectedLogementTypes.includes(lt.libelle));
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
        const found = etab.logements_types.some((lt:any) => {
          if (selectedCaracteristiques.meuble && !lt.meuble) return false;
          if (selectedCaracteristiques.pmr && !lt.pmr) return false;
          if (selectedCaracteristiques.domotique && !lt.domotique) return false;
          if (selectedCaracteristiques.plain_pied && !lt.plain_pied) return false;
          if (
            selectedCaracteristiques.surface_min &&
            (lt.surface_min == null || Number(lt.surface_min) < Number(selectedCaracteristiques.surface_min))
          ) return false;
          if (
            selectedCaracteristiques.surface_max &&
            (lt.surface_max == null || Number(lt.surface_max) > Number(selectedCaracteristiques.surface_max))
          ) return false;
          return true;
        });
        if (!found) return false;
      }
      
      // Public cible (au moins une case cochée doit être présente)
      if (selectedPublicCible.length > 0) {
        if (!Array.isArray(etab.public_cible)) return false;
        if (!selectedPublicCible.some(pc => etab.public_cible.includes(pc))) return false;
      }
      
      // Localisation - Support des codes et noms de départements
      if (selectedDepartement && etab.departement) {
        // Si selectedDepartement est un code (2-3 chiffres ou lettres), on compare directement
        // Sinon on fait une recherche textuelle dans le nom du département
        const isCode = /^[\d]{1,3}[AB]?$/.test(selectedDepartement);
        if (isCode) {
          // Comparaison exacte avec le code
          if (etab.departement !== selectedDepartement) return false;
        } else {
          // Recherche textuelle dans le nom (pour compatibilité)
          if (!etab.departement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(selectedDepartement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))) return false;
        }
      }
      if (selectedCommune && etab.commune && !etab.commune.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(selectedCommune.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))) return false;
      
      // Recherche texte
      if (search && !(
        (etab.nom && etab.nom.toLowerCase().includes(search.toLowerCase())) ||
        (etab.presentation && etab.presentation.toLowerCase().includes(search.toLowerCase())) ||
        (etab.commune && etab.commune.toLowerCase().includes(search.toLowerCase())) ||
        (etab.departement && etab.departement.toLowerCase().includes(search.toLowerCase()))
      )) return false;
      
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
  // --- RENDU JSX ---
  return (
  <main style={{ background: "#f3f3f3", minHeight: "100vh", padding: 0, fontSize: "0.95rem" }}>
    <HeaderSubnavGate />
  
    {/* Ligne principale : sidebar, sticky top bar (search+tabs), contenu */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36, maxWidth: 1600, margin: '0 auto', padding: '0 1.5rem', marginTop: 0 }}>
      {/* Sidebar filtres sticky sous le header */}
  <aside style={{ minWidth: 290, maxWidth: 340, width: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)', padding: '2.2rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 64, height: 'calc(100vh - 64px)', zIndex: 10, marginTop: 0, overflowY: 'auto', fontSize: '0.82rem' }}>
        
        {/* Section Gestionnaire - En haut des filtres */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  placeholder="Rechercher par nom, commune, département..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="search-oblong"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.98rem', padding: '0.7em 1.1em', borderRadius: 32 }}
                />
                <button type="submit" className="search-btn" style={{ border: 'none', background: 'none', marginLeft: -44, zIndex: 2, cursor: 'pointer', padding: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: '#e0e2e6' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7 10.5l3 3 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
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
                      <EtabMap etablissements={getFilteredData().map((etab:any) => ({
                        ...etab,
                        longitude: etab.geom?.coordinates?.[0],
                        latitude: etab.geom?.coordinates?.[1],
                      }))} />
                    )}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem", margin: 0, padding: 0, width: "100%", maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', fontSize: '0.82rem' }}>
                    {getFilteredData().map((etab:any) => (
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
                          {(() => {
                            const imgSrc = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${etab.image_path}`;
                            return (
                              <img
                                src={imgSrc}
                                alt={etab.nom}
                                style={{ maxWidth: 120, maxHeight: 100, width: "auto", height: "auto", objectFit: "contain", borderRadius: 10, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}
                                onError={e => { e.currentTarget.src = "/placeholder.jpg"; }}
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
                          <div style={{ color: "#444", marginBottom: "0.3rem", fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {etab.presentation}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.88rem" }}>
                            {etab.commune} ({etab.departement}, {etab.region}) {etab.code_postal}
                          </div>
                          <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.5em 0 0.2em 0", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                            {PUBLIC_CIBLE_OPTIONS.map(opt => etab.public_cible && etab.public_cible.includes(opt.key) && (
                              <span key={opt.key} style={{ display: "flex", alignItems: "center", gap: 4, color: "#a85b2b", fontWeight: 500, fontSize: "0.90em" }}>
                                {opt.label}
                              </span>
                            ))}
                          </div>
                          {Array.isArray(etab.services) && etab.services.length > 0 && (
                            <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.2em 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {etab.services.map((s:string, idx:number) => (
                                <span key={idx} style={{ color: "#2ba85b", fontWeight: 500, fontSize: "0.90em" }}>{s === "espace_partage" ? "Espace Partagé" : s}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "0.2rem 0" }}>
                            {RESTAURATION_OPTIONS.map(opt => etab[opt.key] && (
                              <span key={opt.key} style={{ background: "#e0e2e6", color: "#444", borderRadius: 8, padding: "0.18em 0.7em", fontSize: "0.84rem", fontWeight: 500 }}>{opt.label}</span>
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