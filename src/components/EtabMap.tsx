import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './EtabMap.css';
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

// Fonction pour créer des icônes de cluster personnalisées
function createClusterCustomIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 'small';
  let fontSize = 14;
  let diameter = 40;
  
  if (count >= 100) {
    size = 'large';
    fontSize = 16;
    diameter = 60;
  } else if (count >= 30) {
    size = 'medium';
    fontSize = 15;
    diameter = 50;
  }
  
  // Gradient terracotta élégant
  return L.divIcon({
    html: `<div style="
      width: ${diameter}px;
      height: ${diameter}px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d9876a 0%, #c1694a 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: ${fontSize}px;
      box-shadow: 0 4px 12px rgba(217, 135, 106, 0.4);
      border: 3px solid white;
      transition: all 0.2s ease;
    ">${count}</div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(diameter, diameter),
  });
}

export default function EtabMap({ etablissements }: EtabMapProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Filtre les établissements avec coordonnées valides
  const markers = etablissements.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number');
  
  const MapContent = () => (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        // @ts-expect-error attribution prop is valid but not typed
        attribution="© OpenStreetMap © CartoDB"
      />
      
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        disableClusteringAtZoom={14}
        iconCreateFunction={createClusterCustomIcon}
        animate={true}
        animateAddingMarkers={true}
      >
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
      </MarkerClusterGroup>
    </>
  );
  
  return (
    <>
      {/* Carte normale */}
      <div style={{ 
        width: '100%', 
        height: 420, 
        borderRadius: 16, 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', 
        marginBottom: 24,
        position: 'relative'
      }}>
        {/* Bouton agrandir */}
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            background: 'white',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '13px',
            fontWeight: 600,
            color: '#333',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f7f7f7';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Agrandir la carte"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
          </svg>
          Agrandir
        </button>

        <MapContainer
          // @ts-expect-error center prop is valid for MapContainer but TS types may be outdated
          center={DEFAULT_CENTER as [number, number]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          attributionControl={true}
        >
          <MapContent />
        </MapContainer>
      </div>

      {/* Modal carte agrandie */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            style={{
              width: '95%',
              height: '90%',
              background: 'white',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              animation: 'scaleIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                zIndex: 10000,
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f7f7f7';
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
              title="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <MapContainer
              // @ts-expect-error center prop is valid for MapContainer but TS types may be outdated
              center={DEFAULT_CENTER as [number, number]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              attributionControl={true}
            >
              <MapContent />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
