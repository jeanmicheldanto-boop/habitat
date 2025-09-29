"use client";
import React from 'react';
import Image from 'next/image';
import { getAllSousCategories, getSousCategorieColor } from '@/lib/habitatTaxonomy';
import { getHabitatImage } from '@/lib/habitatImages';
import BadgeIcon from './BadgeIcon';
import AvpBadge from './AvpBadge';

export interface EtablissementResult {
  etab_id: string;
  nom: string;
  commune?: string;
  departement?: string;
  region?: string;
  image_path?: string;
  sous_categories?: string[] | null;
  fourchette_prix?: string;
  presentation?: string;
  public_cible?: string[];
  services?: string[];
  habitat_type?: string;
  eligibilite_statut?: string;
  [key: string]: string | string[] | boolean | undefined | null;
}
interface MobileResultsListProps {
  results: EtablissementResult[];
  publicCibleOptions: Array<{key: string, label: string}>;
  restaurationOptions: Array<{key: string, label: string}>;
}

export default function MobileResultsList({ results, publicCibleOptions, restaurationOptions }: MobileResultsListProps) {
  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <span>Aucun résultat trouvé.</span>
      </div>
    );
  }
  return (
    <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
  {results.map((etab: EtablissementResult) => {
        const sousCategorie = Array.isArray(etab.sous_categories) && etab.sous_categories.length > 0 
          ? etab.sous_categories[0] 
          : "habitat_alternatif";
        const badgeColor = getSousCategorieColor(sousCategorie);
        const sousCat = getAllSousCategories().find(sc => sc.key === sousCategorie);
        const badgeLabel = sousCat?.label || sousCategorie?.charAt(0).toUpperCase() + sousCategorie?.slice(1) || "Autre";
        return (
          <div key={etab.etab_id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <div style={{ 
              width: '100%', 
              height: 220, 
              background: '#f8f8f8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0'
            }}>
              <Image
                src={etab.image_path 
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${etab.image_path}`
                  : getHabitatImage(etab.sous_categories ?? null)}
                alt={`Image de ${etab.nom}`}
                fill
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                sizes="(max-width: 768px) 100vw, 400px"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLCJvTUReu+lQblbqfVZP2mvs="
                priority={false}
                unoptimized={false}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.objectFit = 'contain';
                  target.style.backgroundColor = '#f8f8f8';
                }}
              />
              <div style={{ position: 'absolute', top: 12, left: 12, background: badgeColor, color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{badgeLabel}</div>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 2, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: '0.9rem', color: etab.fourchette_prix === "euro" ? "#a85b2b" : "#ddd", fontWeight: 700 }}>€</span>
                <span style={{ fontSize: '0.9rem', color: etab.fourchette_prix === "deux_euros" ? "#a85b2b" : "#ddd", fontWeight: 700 }}>€</span>
                <span style={{ fontSize: '0.9rem', color: etab.fourchette_prix === "trois_euros" ? "#a85b2b" : "#ddd", fontWeight: 700 }}>€</span>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a85b2b', margin: 0, marginBottom: 4 }}>{etab.nom}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{etab.commune} ({etab.departement}) • {etab.region}</p>
              </div>
              {etab.presentation && (
                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.4, margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{etab.presentation}</p>
              )}
              {etab.public_cible && Array.isArray(etab.public_cible) && etab.public_cible.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {publicCibleOptions.map(opt => etab.public_cible?.includes(opt.key) && (
                    <BadgeIcon key={opt.key} type="public-cible" name={opt.key} label={opt.label} size="sm" />
                  ))}
                </div>
              )}
              {Array.isArray(etab.services) && etab.services.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {etab.services.slice(0, 3).map((service: string, idx: number) => (
                    <BadgeIcon key={idx} type="services" name={service} label={service === "espace_partage" ? "Espace Partagé" : service} size="sm" />
                  ))}
                  {etab.services.length > 3 && (
                    <span style={{ background: '#f0f0f0', color: '#666', padding: '4px 8px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 500 }}>+{etab.services.length - 3}</span>
                  )}
                </div>
              )}
              {restaurationOptions.some(opt => Boolean(etab[opt.key])) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {restaurationOptions.map(opt => Boolean(etab[opt.key]) && (
                    <BadgeIcon key={opt.key} type="restauration" name={opt.key} label={opt.label} size="sm" />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href={`/plateforme/fiche?id=${encodeURIComponent(etab.etab_id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', flex: 1, background: 'linear-gradient(135deg, #a85b2b 0%, #d35400 100%)', color: 'white', textAlign: 'center', padding: '12px 16px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(168, 91, 43, 0.2)', transition: 'all 0.2s ease' }}
                  onTouchStart={() => {}} // Pour le feedback tactile
                >
                  Voir la fiche détaillée
                </a>
                {etab.eligibilite_statut && etab.eligibilite_statut !== null && etab.eligibilite_statut !== '' && (
                  <AvpBadge status={etab.eligibilite_statut as 'avp_eligible' | 'non_eligible' | 'a_verifier'} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
