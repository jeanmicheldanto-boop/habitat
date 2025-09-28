import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { getHabitatImage } from '@/lib/habitatImages';

// Utilitaire pour générer l'URL publique Supabase Storage
function getPublicUrl(path?: string | null, sous_categories?: string[] | null): string {
  if (!path) return getHabitatImage(sous_categories || null);
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
}

// Correction du bug d'icône par défaut de Leaflet sous Webpack/Next.js
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface EtabMapProps {
  etablissements: Array<{
    etab_id: string;
    nom: string;
    commune?: string;
    departement?: string;
    latitude?: number;
    longitude?: number;
    habitat_type?: string;
    image_path?: string;
    fourchette_prix?: string;
    prix_min?: number;
    prix_max?: number;
    presentation?: string;
    public_cible?: string[];
    sous_categories?: string[];
  }>;
}

const DEFAULT_CENTER: [number, number] = [46.6, 2.2]; // Centre France

// Couleurs par type d'habitat
const habitatColors: Record<string, string> = {
  'logement_independant': '#2e8b57', // vert
  'residence': '#0074d9', // bleu
  'habitat_partage': '#ff851b', // orange
};

function getMarkerIcon(habitat_type?: string) {
  const color = habitatColors[habitat_type || ''] || '#888';
  // Génère un SVG data URL pour l'icône colorée
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'>
      <path d='M16 0C7.2 0 0 7.2 0 16c0 11.2 16 32 16 32s16-20.8 16-32C32 7.2 24.8 0 16 0z' fill='${color}'/>
      <circle cx='16' cy='16' r='7' fill='white'/>
    </svg>
  `);
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41],
  });
}

export default function EtabMap({ etablissements }: EtabMapProps) {
  // Filtre les établissements avec coordonnées valides
  const markers = etablissements.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number');
  return (
    <div style={{ width: '100%', height: 420, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', marginBottom: 24 }}>
      <MapContainer
        // @ts-expect-error center prop is valid for MapContainer but TS types may be outdated
        center={DEFAULT_CENTER as [number, number]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          // @ts-expect-error attribution prop is valid but not typed
          attribution="© OpenStreetMap © CartoDB"
        />
        {markers.map(etab => (
          <Marker
            key={etab.etab_id}
            position={[etab.latitude!, etab.longitude!] as [number, number]}
            icon={getMarkerIcon(etab.habitat_type)}
          >
            {/* @ts-expect-error direction and offset props are valid but not typed */}
            <Tooltip direction="top" offset={[0, -32]}>{etab.nom}</Tooltip>
            {/* @ts-expect-error options prop is valid but not typed */}
            <Popup options={{ minWidth: 260, maxWidth: 320 }}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <img 
                    src={getPublicUrl(etab.image_path, etab.sous_categories)} 
                    alt={etab.nom} 
                    style={{width:40,height:40,objectFit:'cover',borderRadius:8,flexShrink:0,boxShadow:'0 1px 4px 0 rgba(0,0,0,0.08)'}} 
                    onError={e => { e.currentTarget.src = getHabitatImage(etab.sous_categories || null); }}
                  />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:'bold',fontSize:16,marginBottom:2}}>{etab.nom}</div>
                  {etab.fourchette_prix && (
                    <div style={{fontSize:13,color:'#a85b2b',marginBottom:2,fontWeight:500}}>
                      {etab.fourchette_prix === 'euro' && '€'}
                      {etab.fourchette_prix === 'deux_euros' && '€€'}
                      {etab.fourchette_prix === 'trois_euros' && '€€€'}
                      {typeof etab.prix_min === 'number' && ` • ${etab.prix_min}€`} 
                      {typeof etab.prix_max === 'number' && `–${etab.prix_max}€`}
                    </div>
                  )}
                  {etab.presentation && (
                    <div style={{fontSize:13,color:'#444',marginBottom:2,whiteSpace:'pre-line',maxHeight:48,overflow:'hidden',textOverflow:'ellipsis'}}>{etab.presentation}</div>
                  )}
                  {etab.public_cible && etab.public_cible.length > 0 && (
                    <div style={{fontSize:12,color:'#888',marginBottom:2}}>
                      <span style={{fontWeight:500}}>Public cible :</span> {etab.public_cible.join(', ')}
                    </div>
                  )}
                  <a
                    href={`/plateforme/fiche?id=${etab.etab_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display:'inline-block',
                      marginTop:8,
                      padding:'4px 10px',
                      fontSize:11,
                      fontWeight:600,
                      color:'#fff',
                      background:'#a85b2b',
                      border:'none',
                      borderRadius:8,
                      boxShadow:'0 1px 4px 0 rgba(168,91,43,0.10)',
                      textDecoration:'none',
                      transition:'background 0.18s',
                      cursor:'pointer',
                    }}
                  >Voir la fiche</a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
