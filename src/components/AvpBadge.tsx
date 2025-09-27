import React from 'react';

interface AvpBadgeProps {
  status: 'avp_eligible' | 'non_eligible' | 'a_verifier';
  className?: string;
}

export default function AvpBadge({ status, className = '' }: AvpBadgeProps) {
  // Pour non_eligible, on n'affiche rien du tout
  if (status === 'non_eligible') {
    return null;
  }

  // Configuration des styles pour chaque statut
  const config = {
    'avp_eligible': {
      text: 'AVP ✓',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#ffffff',
      border: '2px solid #047857',
      tooltip: 'Habitat éligible à l\'aide à la vie partagée'
    },
    'a_verifier': {
      text: 'AVP ?',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: '#ffffff',
      border: '2px solid #b45309',
      tooltip: 'Habitat potentiellement éligible à l\'aide à la vie partagée'
    }
  };

  const style = config[status];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        background: style.background,
        color: style.color,
        border: style.border,
        minWidth: '50px',
        height: '24px',
        cursor: 'help',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      title={style.tooltip}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      onClick={() => {
        // Copier l'info dans le presse-papier et afficher un message temporaire
        if (navigator.clipboard) {
          navigator.clipboard.writeText(style.tooltip);
        }
        // Optionnel : afficher une notification temporaire
        alert(style.tooltip);
      }}
    >
      {style.text}
    </div>
  );
}