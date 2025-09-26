"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderSubnavGate from "@/components/HeaderSubnavGate";
import { supabase } from "../../lib/supabaseClient";
import './plateforme.css';
// Palette de couleurs pour les types d'habitat (sous-catégories)
const TAG_COLORS: Record<string, string> = {
  "résidence autonomie": "#a85b2b",
  "résidence services": "#2b7fa8",
  "colocation": "#2ba85b",
  "maison partagée": "#a82b7f",
  "béguinage": "#e0a800",
  "ehpad": "#a82b2b",
  "foyer logement": "#2b2ba8",
  "habitat inclusif": "#2ba8a8",
  "autre": "#888"
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
  const [selectedCommune, setSelectedCommune] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("v_liste_publication_geoloc").select("*").limit(500);
      if (error) setError(error.message);
      setData(data || []);
      setLoading(false);
    }
    fetchData();
    async function fetchSousCategories() {
      const { data } = await supabase
        .from("v_liste_publication_geoloc")
        .select("sous_categories, services, logements_types")
        .limit(500);
      if (data) {
        const allSousCat = data.flatMap((row:any) => row.sous_categories || []);
        setSousCategories(Array.from(new Set(allSousCat)).sort());
        const allServ = data.flatMap((row:any) => row.services || []);
        setAllServices(Array.from(new Set(allServ)).sort());
        const allLogTypes = data.flatMap((row:any) => (row.logements_types || []).map((lt:any) => lt.libelle).filter(Boolean));
        setAllLogementTypes(Array.from(new Set(allLogTypes)).sort());
      }
    }
    fetchSousCategories();
  }, []);

  function getFilteredData() {
    return data.filter((etab:any) => {
      // Type d'habitat
      if (selectedSousCategories.length > 0) {
        if (!Array.isArray(etab.sous_categories)) return false;
        if (!selectedSousCategories.some(sc => etab.sous_categories.includes(sc))) return false;
      }
      // Prix
      if (selectedPrices.length > 0) {
        const dbValue = etab.fourchette_prix;
        if (!dbValue) return false;
        const uiValue = PRICE_DB_TO_UI[dbValue] as "€"|"€€"|"€€€"|undefined;
        if (!uiValue || !selectedPrices.includes(uiValue)) return false;
      }
      // Services dynamiques
      if (selectedServices.length > 0) {
        if (!etab.services || !Array.isArray(etab.services)) return false;
        if (!selectedServices.every(s => etab.services.includes(s))) return false;
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
      // Localisation (correction : match exact ou partiel, insensible à la casse)
      if (selectedDepartement && etab.departement && !etab.departement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(selectedDepartement.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))) return false;
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
  }

  // Import dynamique de la carte pour SSR
  const EtabMap = dynamic(() => import("../../components/EtabMap"), { ssr: false });
  // --- RENDU JSX ---
  return (
  <main style={{ background: "#f3f3f3", minHeight: "100vh", padding: 0, fontSize: "0.95rem" }}>
    <HeaderSubnavGate />
    {/* Sticky header vide pour conserver l'espace si besoin (optionnel) */}
    <div style={{ height: 24, background: '#f6f6f6', width: '100%' }} />
    {/* Ligne principale : sidebar, sticky top bar (search+tabs), contenu */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36, maxWidth: 1600, margin: '0 auto', padding: '0 1.5rem', marginTop: 0 }}>
      {/* Sidebar filtres sticky sous le header */}
  <aside style={{ minWidth: 290, maxWidth: 340, width: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)', padding: '2.2rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 64, height: 'calc(100vh - 64px)', zIndex: 10, marginTop: 0, overflowY: 'auto', fontSize: '0.89rem' }}>
        {/* Localisation */}
        <div>
          <div className="filtre-label">Localisation</div>
          <input type="text" placeholder="Département" value={selectedDepartement} onChange={e => setSelectedDepartement(e.target.value)} className="filtre-input" />
          <input type="text" placeholder="Commune" value={selectedCommune} onChange={e => setSelectedCommune(e.target.value)} className="filtre-input" style={{ marginTop: 8 }} />
        </div>
        {/* Type d'habitat */}
        <div>
          <div className="filtre-label">Type d'habitat</div>
          <div className="filtre-checkbox-group">
            {sousCategories.map(sc => (
              <label key={sc} className="filtre-checkbox-label">
                <input type="checkbox" checked={selectedSousCategories.includes(sc)} onChange={e => setSelectedSousCategories(arr => e.target.checked ? [...arr, sc] : arr.filter(x => x !== sc))} />
                {sc}
              </label>
            ))}
          </div>
        </div>
        {/* Public cible (immédiatement après type d'habitat) */}
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
            {[
              "Intervention d'un médecin",
              "Personnel de nuit",
              "Espace partagé",
              "Activités organisées",
              "Conciergerie",
              "Commerce à pied"
            ].map(label => (
              <label key={label} className="filtre-checkbox-label">
                <input type="checkbox" checked={selectedServices.includes(label)} onChange={e => setSelectedServices(arr => e.target.checked ? [...arr, label] : arr.filter(x => x !== label))} />
                {label}
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
          top: 88,
          zIndex: 20,
          background: '#f3f3f3',
          borderRadius: '0 0 18px 18px',
          padding: '0.5rem 0 0.3rem 0',
          marginBottom: 0,
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
  <section style={{ flex: 1, minWidth: 0, marginTop: 0, fontSize: '0.89rem' }}>
              {!loading && !error && (
                tab === 'carte' ? (
                  <div style={{ width: "100%", maxWidth: 900, margin: '0 auto' }}>
                    {mounted && (
                      <EtabMap etablissements={getFilteredData().map((etab:any) => ({
                        ...etab,
                        longitude: etab.geom?.coordinates?.[0],
                        latitude: etab.geom?.coordinates?.[1],
                      }))} />
                    )}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem", margin: 0, padding: 0, width: "100%", maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', fontSize: '0.89rem' }}>
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
                        <div style={{ flex: 1, padding: "1rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center", fontSize: "0.97rem" }}>
                          {/* ...existing code for card text... */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2, justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {(() => {
                                const type = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 ? etab.sous_categories[0] : "autre";
                                const color = TAG_COLORS[type?.toLowerCase()] || TAG_COLORS["autre"];
                                return (
                                  <span style={{
                                    display: "inline-block",
                                    minWidth: 0,
                                    padding: "0.18em 0.7em",
                                    fontSize: "0.91rem",
                                    fontWeight: 600,
                                    borderRadius: 7,
                                    background: color,
                                    color: "#fff",
                                    letterSpacing: "0.01em",
                                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.06)",
                                    marginRight: 2
                                  }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </span>
                                );
                              })()}
                              <div style={{ fontWeight: "bold", fontSize: "1.08rem", color: "#a85b2b" }}>
                                {etab.nom}
                              </div>
                              <div style={{ display: "flex", gap: 3, alignItems: "center", marginLeft: 8 }}>
                                <span style={{ fontSize: "1.08rem", color: etab.fourchette_prix === "euro" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€</span>
                                <span style={{ fontSize: "1.08rem", color: etab.fourchette_prix === "deux_euros" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€€</span>
                                <span style={{ fontSize: "1.08rem", color: etab.fourchette_prix === "trois_euros" ? "#a85b2b" : "#e0e2e6", fontWeight: 700 }}>€€€</span>
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
                          <div style={{ color: "#444", marginBottom: "0.3rem", fontSize: "0.99rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {etab.presentation}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.95rem" }}>
                            {etab.commune} ({etab.departement}, {etab.region}) {etab.code_postal}
                          </div>
                          <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.5em 0 0.2em 0", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                            {PUBLIC_CIBLE_OPTIONS.map(opt => etab.public_cible && etab.public_cible.includes(opt.key) && (
                              <span key={opt.key} style={{ display: "flex", alignItems: "center", gap: 4, color: "#a85b2b", fontWeight: 500, fontSize: "0.97em" }}>
                                {opt.label}
                              </span>
                            ))}
                          </div>
                          {Array.isArray(etab.services) && etab.services.length > 0 && (
                            <div style={{ background: "#f6f6f6", borderRadius: 10, padding: "0.4em 0.8em", margin: "0.2em 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {etab.services.map((s:string, idx:number) => (
                                <span key={idx} style={{ color: "#2ba85b", fontWeight: 500, fontSize: "0.97em" }}>{s === "espace_partage" ? "Espace Partagé" : s}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "0.2rem 0" }}>
                            {RESTAURATION_OPTIONS.map(opt => etab[opt.key] && (
                              <span key={opt.key} style={{ background: "#e0e2e6", color: "#444", borderRadius: 8, padding: "0.18em 0.7em", fontSize: "0.91rem", fontWeight: 500 }}>{opt.label}</span>
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