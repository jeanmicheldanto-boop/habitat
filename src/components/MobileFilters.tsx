"use client";
import React, { useState } from 'react';
import { HABITAT_TAXONOMY, getAllSousCategories, getSousCategorieColor, getCategoryByKey } from '@/lib/habitatTaxonomy';
import DepartmentAutocomplete from './DepartmentAutocomplete';

interface MobileFiltersProps {
  // États des filtres
  selectedHabitatCategories: string[];
  setSelectedHabitatCategories: (categories: string[]) => void;
  selectedSousCategories: string[];
  setSelectedSousCategories: (sousCategories: string[]) => void;
  selectedDepartement: string;
  setSelectedDepartement: (dept: string) => void;
  selectedCommune: string;
  setSelectedCommune: (commune: string) => void;
  selectedPrices: Array<'€'|'€€'|'€€€'>;
  setSelectedPrices: (prices: Array<'€'|'€€'|'€€€'>) => void;
  selectedPublicCible: string[];
  setSelectedPublicCible: (publicCible: string[]) => void;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  selectedRestauration: {[k:string]: boolean};
  setSelectedRestauration: (restauration: {[k:string]: boolean}) => void;
  selectedLogementTypes: string[];
  setSelectedLogementTypes: (logementTypes: string[]) => void;
  selectedCaracteristiques: any;
  setSelectedCaracteristiques: (caracteristiques: any) => void;
  allServices: string[];
  allLogementTypes: string[];
  resultsCount: number;
}

const PUBLIC_CIBLE_OPTIONS = [
  { key: "personnes_agees", label: "Personnes âgées" },
  { key: "personnes_handicapees", label: "Handicap" },
  { key: "mixtes", label: "Mixte" },
  { key: "intergenerationnel", label: "Intergénérationnel" },
  { key: "alzheimer_accessible", label: "Alzheimer" }
];

const RESTAURATION_OPTIONS = [
  { key: "kitchenette", label: "Kitchenette" },
  { key: "resto_collectif_midi", label: "Resto midi" },
  { key: "resto_collectif", label: "Resto collectif" },
  { key: "portage_repas", label: "Portage repas" }
];

export default function MobileFilters({
  selectedHabitatCategories,
  setSelectedHabitatCategories,
  selectedSousCategories,
  setSelectedSousCategories,
  selectedDepartement,
  setSelectedDepartement,
  selectedCommune,
  setSelectedCommune,
  selectedPrices,
  setSelectedPrices,
  selectedPublicCible,
  setSelectedPublicCible,
  selectedServices,
  setSelectedServices,
  selectedRestauration,
  setSelectedRestauration,
  selectedLogementTypes,
  setSelectedLogementTypes,
  selectedCaracteristiques,
  setSelectedCaracteristiques,
  allServices,
  allLogementTypes,
  resultsCount
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    location: false,
    habitat: false,
    public: false,
    price: false,
    services: false,
    restauration: false,
    logement: false,
    caracteristiques: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Compter les filtres actifs
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
    if (selectedLogementTypes.length > 0) count += selectedLogementTypes.length;
    const caracCount = Object.values(selectedCaracteristiques).filter(v => v !== '' && v !== false).length;
    if (caracCount > 0) count += caracCount;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const clearAllFilters = () => {
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
  };

  return (
    <>
      {/* Bouton de déclenchement des filtres */}
      <div style={{ 
        position: 'fixed', 
        bottom: 20, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 1000,
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #a85b2b 0%, #d35400 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 25,
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(168, 91, 43, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filtres
          {activeFiltersCount > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              minWidth: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '8px 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#666'
        }}>
          {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
        </div>
      </div>

      {/* Modal plein écran des filtres */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header du modal */}
          <div style={{
            background: 'linear-gradient(135deg, #a85b2b 0%, #d35400 100%)',
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              Filtres de recherche
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Contenu scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            
            {/* Section Localisation */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => toggleSection('location')}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                📍 Localisation
                <svg 
                  width="20" 
                  height="20" 
                  style={{ 
                    transform: expandedSections.location ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedSections.location && (
                <div style={{ padding: '0 20px 20px' }}>
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
                    onChange={e => setSelectedCommune(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      marginTop: 12,
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: '1rem'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Section Types d'habitat */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => toggleSection('habitat')}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                🏠 Types d'habitat
                <svg 
                  width="20" 
                  height="20" 
                  style={{ 
                    transform: expandedSections.habitat ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedSections.habitat && (
                <div style={{ padding: '0 20px 20px' }}>
                  {/* Catégories principales */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
                      Catégories principales
                    </h4>
                    {HABITAT_TAXONOMY.map(category => (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => {
                          const isSelected = selectedHabitatCategories.includes(category.key);
                          if (isSelected) {
                            setSelectedHabitatCategories(selectedHabitatCategories.filter(x => x !== category.key));
                          } else {
                            setSelectedHabitatCategories([...selectedHabitatCategories, category.key]);
                          }
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          marginBottom: 8,
                          borderRadius: 10,
                          border: '1.5px solid',
                          borderColor: selectedHabitatCategories.includes(category.key) ? '#a85b2b' : '#e0e2e6',
                          background: selectedHabitatCategories.includes(category.key) ? '#a85b2b' : '#fff',
                          color: selectedHabitatCategories.includes(category.key) ? '#fff' : '#444',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {category.icon} {category.label}
                      </button>
                    ))}
                  </div>

                  {/* Sous-catégories */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
                      Sous-catégories
                    </h4>
                    {getAllSousCategories().map(sousCategorie => {
                      const parentCategory = getCategoryByKey(
                        HABITAT_TAXONOMY.find(cat => 
                          cat.sousCategories.some(sc => sc.key === sousCategorie.key)
                        )?.key || ''
                      );
                      return (
                        <label key={sousCategorie.key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          marginBottom: 8,
                          background: selectedSousCategories.includes(sousCategorie.key) ? '#f8f9fa' : 'transparent',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={selectedSousCategories.includes(sousCategorie.key)} 
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedSousCategories([...selectedSousCategories, sousCategorie.key]);
                              } else {
                                setSelectedSousCategories(selectedSousCategories.filter(x => x !== sousCategorie.key));
                              }
                            }}
                            style={{ marginRight: 12 }}
                          />
                          <span style={{ 
                            color: getSousCategorieColor(sousCategorie.key),
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}>
                            {parentCategory?.icon} {sousCategorie.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Section Prix */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => toggleSection('price')}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                💰 Tarif
                <svg 
                  width="20" 
                  height="20" 
                  style={{ 
                    transform: expandedSections.price ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedSections.price && (
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['€', '€€', '€€€'].map(prix => (
                      <button
                        key={prix}
                        type="button"
                        onClick={() => {
                          const prixValue = prix as '€'|'€€'|'€€€';
                          const isSelected = selectedPrices.includes(prixValue);
                          if (isSelected) {
                            setSelectedPrices(selectedPrices.filter(x => x !== prix));
                          } else {
                            setSelectedPrices([...selectedPrices, prixValue]);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 24,
                          border: '1.5px solid',
                          borderColor: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#a85b2b' : '#e0e2e6',
                          background: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#a85b2b' : '#fff',
                          color: selectedPrices.includes(prix as '€'|'€€'|'€€€') ? '#fff' : '#a85b2b',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          cursor: 'pointer'
                        }}
                      >
                        {prix}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section Public cible */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => toggleSection('public')}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                👥 Public cible
                <svg 
                  width="20" 
                  height="20" 
                  style={{ 
                    transform: expandedSections.public ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedSections.public && (
                <div style={{ padding: '0 20px 20px' }}>
                  {PUBLIC_CIBLE_OPTIONS.map(opt => (
                    <label key={opt.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      marginBottom: 8,
                      background: selectedPublicCible.includes(opt.key) ? '#f8f9fa' : 'transparent',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={selectedPublicCible.includes(opt.key)} 
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedPublicCible([...selectedPublicCible, opt.key]);
                          } else {
                            setSelectedPublicCible(selectedPublicCible.filter(x => x !== opt.key));
                          }
                        }}
                        style={{ marginRight: 12 }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Section Services */}
            {allServices.length > 0 && (
              <div style={{ borderBottom: '1px solid #eee' }}>
                <button
                  onClick={() => toggleSection('services')}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#333',
                    cursor: 'pointer'
                  }}
                >
                  🛎️ Services
                  <svg 
                    width="20" 
                    height="20" 
                    style={{ 
                      transform: expandedSections.services ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                {expandedSections.services && (
                  <div style={{ padding: '0 20px 20px', maxHeight: 200, overflowY: 'auto' }}>
                    {allServices.map(service => (
                      <label key={service} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        marginBottom: 8,
                        background: selectedServices.includes(service) ? '#f8f9fa' : 'transparent',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={selectedServices.includes(service)} 
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedServices([...selectedServices, service]);
                            } else {
                              setSelectedServices(selectedServices.filter(x => x !== service));
                            }
                          }}
                          style={{ marginRight: 12 }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>
                          {service}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section Restauration */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => toggleSection('restauration')}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                🍽️ Restauration
                <svg 
                  width="20" 
                  height="20" 
                  style={{ 
                    transform: expandedSections.restauration ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedSections.restauration && (
                <div style={{ padding: '0 20px 20px' }}>
                  {RESTAURATION_OPTIONS.map(opt => (
                    <label key={opt.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      marginBottom: 8,
                      background: selectedRestauration[opt.key] ? '#f8f9fa' : 'transparent',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedRestauration[opt.key]} 
                        onChange={e => {
                          setSelectedRestauration({
                            ...selectedRestauration,
                            [opt.key]: e.target.checked
                          });
                        }}
                        style={{ marginRight: 12 }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer avec actions */}
          <div style={{
            background: '#fff',
            borderTop: '1px solid #eee',
            padding: '16px 20px',
            display: 'flex',
            gap: 12
          }}>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Effacer tout
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                flex: 2,
                padding: '12px',
                background: 'linear-gradient(135deg, #a85b2b 0%, #d35400 100%)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Voir {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </>
  );
}