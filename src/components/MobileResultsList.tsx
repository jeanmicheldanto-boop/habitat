"use client";
import React from 'react';
import { getAllSousCategories, getSousCategorieColor } from '@/lib/habitatTaxonomy';

interface MobileResultsListProps {
  results: any[];
  publicCibleOptions: Array<{key: string, label: string}>;
  restaurationOptions: Array<{key: string, label: string}>;
}

export default function MobileResultsList({ 
  results, 
  publicCibleOptions, 
  restaurationOptions 
}: MobileResultsListProps) {
  if (results.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#333' }}>
          Aucun résultat trouvé
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
          Essayez d'ajuster vos filtres ou élargir votre zone de recherche
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '0 16px 100px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16 
    }}>
      {results.map((etab: any) => (
        <div
          key={etab.etab_id}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid #f0f0f0'
          }}
        >
          {/* Image en haut */}
          <div style={{ 
            width: '100%', 
            height: 200, 
            background: '#f8f8f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {(() => {
              const imgSrc = etab.image_path 
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${etab.image_path}`
                : "/placeholder.jpg";
              return (
                <img
                  src={imgSrc}
                  alt={etab.nom}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={e => { e.currentTarget.src = "/placeholder.jpg"; }}
                />
              );
            })()}
            
            {/* Badge type d'habitat */}
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: (() => {
                const sousCategorie = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 
                  ? etab.sous_categories[0] 
                  : "habitat_alternatif";
                return getSousCategorieColor(sousCategorie);
              })(),
              color: 'white',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {(() => {
                const sousCategorie = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 
                  ? etab.sous_categories[0] 
                  : "habitat_alternatif";
                const sousCat = getAllSousCategories().find(sc => sc.key === sousCategorie);
                return sousCat?.label || sousCategorie?.charAt(0).toUpperCase() + sousCategorie?.slice(1) || "Autre";
              })()}
            </div>

            {/* Prix */}
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 2,
              background: 'rgba(255,255,255,0.9)',
              padding: '6px 10px',
              borderRadius: 16,
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ 
                fontSize: '0.9rem', 
                color: etab.fourchette_prix === "euro" ? "#a85b2b" : "#ddd", 
                fontWeight: 700 
              }}>€</span>
              <span style={{ 
                fontSize: '0.9rem', 
                color: etab.fourchette_prix === "deux_euros" ? "#a85b2b" : "#ddd", 
                fontWeight: 700 
              }}>€</span>
              <span style={{ 
                fontSize: '0.9rem', 
                color: etab.fourchette_prix === "trois_euros" ? "#a85b2b" : "#ddd", 
                fontWeight: 700 
              }}>€</span>
            </div>
          </div>

          {/* Contenu */}
          <div style={{ padding: '16px' }}>
            {/* Nom et localisation */}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#a85b2b',
                margin: 0,
                marginBottom: 4
              }}>
                {etab.nom}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#666',
                margin: 0
              }}>
                {etab.commune} ({etab.departement}) • {etab.region}
              </p>
            </div>

            {/* Description */}
            {etab.presentation && (
              <p style={{
                fontSize: '0.9rem',
                color: '#555',
                lineHeight: 1.4,
                margin: '0 0 12px 0',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {etab.presentation}
              </p>
            )}

            {/* Public cible */}
            {etab.public_cible && Array.isArray(etab.public_cible) && etab.public_cible.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12
              }}>
                {publicCibleOptions.map(opt => 
                  etab.public_cible.includes(opt.key) && (
                    <span key={opt.key} style={{
                      background: '#e8f4f8',
                      color: '#2c5aa0',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {opt.label}
                    </span>
                  )
                )}
              </div>
            )}

            {/* Services */}
            {Array.isArray(etab.services) && etab.services.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12
              }}>
                {etab.services.slice(0, 3).map((service: string, idx: number) => (
                  <span key={idx} style={{
                    background: '#e8f5e8',
                    color: '#2d7d2d',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {service}
                  </span>
                ))}
                {etab.services.length > 3 && (
                  <span style={{
                    background: '#f0f0f0',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    +{etab.services.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Restauration */}
            {restaurationOptions.some(opt => etab[opt.key]) && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12
              }}>
                {restaurationOptions.map(opt => etab[opt.key] && (
                  <span key={opt.key} style={{
                    background: '#fff3e0',
                    color: '#e65100',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {opt.label}
                  </span>
                ))}
              </div>
            )}

            {/* Bouton voir la fiche */}
            <a
              href={`/plateforme/fiche?id=${encodeURIComponent(etab.etab_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                background: 'linear-gradient(135deg, #a85b2b 0%, #d35400 100%)',
                color: 'white',
                textAlign: 'center',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(168, 91, 43, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onTouchStart={() => {}} // Pour le feedback tactile
            >
              Voir la fiche détaillée
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}