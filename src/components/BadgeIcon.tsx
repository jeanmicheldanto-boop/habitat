import React from 'react';
import {
  CalendarIcon,
  ShoppingBagIcon,
  BellIcon,
  UsersIcon,
  HeartIcon,
  MoonIcon,
  HomeIcon,
  TruckIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

// Couleurs par catégorie
const COLORS = {
  avp: {
    eligible: '#059669',      // Vert premium
    nonEligible: '#dc2626',   // Rouge professionnel  
    aVerifier: '#6b7280',     // Gris professionnel
  },
  services: '#3b82f6',        // Bleu
  restauration: '#f97316',    // Orange
  tarification: '#10b981',    // Vert
  'public-cible': '#7c3aed',     // Violet
  logement: '#4338ca',        // Indigo
};

// Mapping des services vers les icônes Heroicons
const SERVICE_ICONS = {
  'activités organisées': CalendarIcon,
  'commerces à pied': ShoppingBagIcon,
  'conciergerie': BellIcon,
  'espace_partage': UsersIcon,
  'médecin intervenant': HeartIcon,
  'personnel de nuit': MoonIcon,
};

const RESTAURATION_ICONS = {
  'kitchenette': HomeIcon,
  'resto_collectif_midi': UsersIcon, // Repas collectif = groupe
  'resto_collectif': UsersIcon,
  'portage_repas': TruckIcon,
};

const TARIFICATION_ICONS = {
  'euro': CurrencyEuroIcon,
  'deux_euros': CurrencyEuroIcon,
  'trois_euros': CurrencyEuroIcon,
};

const PUBLIC_CIBLE_ICONS = {
  'seniors_autonomes': UserGroupIcon,
  'seniors_dependants': HeartIcon,
  'handicap': UsersIcon,
  'jeunes_seniors': UserGroupIcon,
  'familles': UserGroupIcon,
};

const LOGEMENT_ICONS = {
  'meuble': HomeIcon,
  'pmr': UsersIcon,
  'domotique': CogIcon,
  'plain_pied': HomeIcon,
  'surface_min': WrenchScrewdriverIcon,
  'surface_max': WrenchScrewdriverIcon,
};

const AVP_ICONS = {
  'avp_eligible': CheckCircleIcon,
  'non_eligible': XCircleIcon,
  'a_verifier': QuestionMarkCircleIcon,
};

interface BadgeIconProps {
  type: 'services' | 'restauration' | 'tarification' | 'public-cible' | 'logement' | 'avp';
  name: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BadgeIcon({ type, name, label, size = 'md', className = '' }: BadgeIconProps) {
  let IconComponent;
  let color;

  // Sélection de l'icône et couleur selon le type
  switch (type) {
    case 'services':
      IconComponent = SERVICE_ICONS[name as keyof typeof SERVICE_ICONS];
      color = COLORS.services;
      break;
    case 'restauration':
      IconComponent = RESTAURATION_ICONS[name as keyof typeof RESTAURATION_ICONS];
      color = COLORS.restauration;
      break;
    case 'tarification':
      IconComponent = TARIFICATION_ICONS[name as keyof typeof TARIFICATION_ICONS];
      color = COLORS.tarification;
      break;
    case 'public-cible':
      IconComponent = PUBLIC_CIBLE_ICONS[name as keyof typeof PUBLIC_CIBLE_ICONS];
      color = COLORS['public-cible'];
      break;
    case 'logement':
      IconComponent = LOGEMENT_ICONS[name as keyof typeof LOGEMENT_ICONS];
      color = COLORS.logement;
      break;
    case 'avp':
      IconComponent = AVP_ICONS[name as keyof typeof AVP_ICONS];
      if (name === 'avp_eligible') color = COLORS.avp.eligible;
      else if (name === 'non_eligible') color = COLORS.avp.nonEligible;
      else color = COLORS.avp.aVerifier;
      break;
    default:
      return null;
  }

  // Configuration des tailles
  const sizeConfig = {
    sm: { icon: 12, padding: '2px 6px', fontSize: '0.7rem' },
    md: { icon: 16, padding: '4px 8px', fontSize: '0.8rem' },
    lg: { icon: 20, padding: '6px 10px', fontSize: '0.9rem' },
  };

  const config = sizeConfig[size];

  // Si aucune icône trouvée, afficher juste le label
  if (!IconComponent) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: config.padding,
          borderRadius: '6px',
          fontSize: config.fontSize,
          fontWeight: '500',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          color: '#6b7280'
        }}
        className={className}
      >
        {label}
      </span>
    );
  }

  // Couleurs de fond par type
  const bgColors = {
    services: '#eff6ff',      // Bleu très clair
    restauration: '#fff7ed',   // Orange très clair  
    tarification: '#ecfdf5',   // Vert très clair
    'public-cible': '#faf5ff', // Violet très clair
    logement: '#eef2ff',       // Indigo très clair
    avp: name === 'avp_eligible' ? '#ecfdf5' : 
         name === 'non_eligible' ? '#fef2f2' : '#f9fafb'
  };

  const borderColors = {
    services: '#dbeafe',
    restauration: '#fed7aa', 
    tarification: '#d1fae5',
    'public-cible': '#e9d5ff',
    logement: '#e0e7ff',
    avp: name === 'avp_eligible' ? '#a7f3d0' : 
         name === 'non_eligible' ? '#fecaca' : '#e5e7eb'
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: config.padding,
        borderRadius: '6px',
        fontSize: config.fontSize,
        fontWeight: '500',
        backgroundColor: bgColors[type],
        border: `1px solid ${borderColors[type]}`,
        color: color
      }}
      className={className}
    >
      <IconComponent
        width={config.icon}
        height={config.icon}
        style={{ color: color }}
      />
      {label}
    </span>
  );
}

// Export des couleurs pour utilisation externe
export { COLORS };

// Type pour compatibilité
export interface Badge {
  type: 'services' | 'restauration' | 'tarification' | 'public-cible' | 'logement' | 'avp';
  name: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}