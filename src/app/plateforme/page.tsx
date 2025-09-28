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
  // Ajout des états manquants pour la compilation
  const [selectedAvpEligibility, setSelectedAvpEligibility] = React.useState<string>('');
  const stickyTop = 64;
  // États pour les filtres
  const [selectedHabitatCategories, setSelectedHabitatCategories] = React.useState<any[]>([]);
  const [selectedSousCategories, setSelectedSousCategories] = React.useState<any[]>([]);
  const [selectedDepartement, setSelectedDepartement] = React.useState<string>('');
  const [selectedCommune, setSelectedCommune] = React.useState<string>('');
  const [selectedPrices, setSelectedPrices] = React.useState<any[]>([]);
  const [selectedPublicCible, setSelectedPublicCible] = React.useState<any[]>([]);
  const [selectedServices, setSelectedServices] = React.useState<any[]>([]);
  const [selectedRestauration, setSelectedRestauration] = React.useState<any>({});
  const [selectedLogementTypes, setSelectedLogementTypes] = React.useState<any[]>([]);
  const [selectedCaracteristiques, setSelectedCaracteristiques] = React.useState<any>({});
  const [allServices, setAllServices] = React.useState<any[]>([]);
  // Mock ou initialisation par défaut pour compilation
  const loading = false;
  const error = null;
  const PUBLIC_CIBLE_OPTIONS: any[] = [];
  const RESTAURATION_OPTIONS: any[] = [];
  // Détection mobile (exemple simple, à adapter selon le projet)
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 900);
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Barre de recherche
  const [search, setSearch] = React.useState('');

  // Onglet actif (liste/carte)
  const [tab, setTab] = React.useState('liste');
  // --- HOOKS ET LOGIQUE ---
  const [mounted, setMounted] = useState(false);

  // Import dynamique de la carte pour SSR
  const EtabMap = dynamic(() => import("../../components/EtabMap"), { ssr: false });

  // Filtrage des données (mocké ici, à adapter selon vos données réelles)
  const filteredData: any[] = React.useMemo(() => {
    // Exemple de logique de filtrage (à adapter selon vos données réelles)
    // Ici, on suppose que vous avez une variable "data" contenant tous les établissements
    // Remplacez "data" par votre source réelle
    const data: any[] = [];
    const term = search.trim().toLowerCase();
    return data.filter((etab: any) => {
      let matchesSearch = true;
      if (term) {
        // Recherche dans les sous-catégories
        if (Array.isArray(etab.sous_categories)) {
          if (etab.sous_categories.some((sc: string) =>
            sc.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
          )) matchesSearch = true;
        }
        // Recherche dans les services
        if (Array.isArray(etab.services)) {
          if (etab.services.some((service: string) =>
            service.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
          )) matchesSearch = true;
        }
        // Recherche dans le gestionnaire
        if (etab.gestionnaire && etab.gestionnaire.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)) matchesSearch = true;
        // Recherche dans les types de logement
        if (Array.isArray(etab.logements_types)) {
          if (etab.logements_types.some((lt: any) =>
            lt.libelle && lt.libelle.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(term)
          )) matchesSearch = true;
        }
        // Si aucune correspondance
        if (!matchesSearch) return false;
      }
      // Ajoutez ici vos autres filtres (catégories, prix, etc.)
      return true;
    });
  }, [search, selectedHabitatCategories, selectedSousCategories, selectedDepartement, selectedCommune, selectedPrices, selectedPublicCible, selectedServices, selectedRestauration, selectedLogementTypes, selectedCaracteristiques]);
  
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
              placeholder="Nom, ville, département, type d'habitat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none', color: '#333' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#999' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
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
                      placeholder="Nom, ville, département, type d'habitat..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none', color: '#333' }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#999' }}
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
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '8px', background: 'rgba(168, 91, 43, 0.1)', padding: '4px 12px', borderRadius: '12px', display: 'inline-block', width: '100%' }}>
                      <strong>Recherche :</strong> &quot;{search}&quot; dans tous les champs
                    </div>
                  )}
                </div>
                {/* Onglets Liste/Carte mobile */}
                <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={() => setTab('liste')}
                    style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'liste' ? '3px solid #a85b2b' : '3px solid transparent', color: tab === 'liste' ? '#a85b2b' : '#666', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                  >📋 Liste ({filteredData.length})</button>
                  <button
                    onClick={() => setTab('carte')}
                    style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'carte' ? '3px solid #a85b2b' : '3px solid transparent', color: tab === 'carte' ? '#a85b2b' : '#666', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                  >🗺️ Carte</button>
                </div>
                {/* Contenu mobile */}
                {!loading && !error && (
                  tab === 'carte' ? (
                    <div style={{ height: 'calc(100vh - 200px)', padding: '16px' }}>
                      {mounted && (
                        <EtabMap etablissements={filteredData.map((etab:any) => ({ ...etab, longitude: etab.geom?.coordinates?.[0], latitude: etab.geom?.coordinates?.[1] }))} />
                      )}
                    </div>
                  ) : (
                    <MobileResultsList results={filteredData as EtablissementResult[]} publicCibleOptions={PUBLIC_CIBLE_OPTIONS} restaurationOptions={RESTAURATION_OPTIONS} />
                  )
                )}
                {loading && (
                  <div style={{ textAlign: 'center', color: '#888', marginTop: 40, padding: '40px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
                    <div>Chargement des établissements...</div>
                  </div>
                )}
                {error && (
                  <div style={{ textAlign: 'center', color: '#a82b2b', marginTop: 40, padding: '40px' }}>
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
                  resultsCount={filteredData.length}
                />
              </main>
            );
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