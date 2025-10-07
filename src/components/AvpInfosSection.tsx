"use client";

import React from 'react';

// Types pour les informations AVP
export interface AvpInfos {
  etablissement_id: string;
  statut: 'intention' | 'en_projet' | 'ouvert';
  date_intention?: string;
  date_en_projet?: string;
  date_ouverture?: string;
  pvsp_fondamentaux: {
    objectifs?: string;
    animation_vie_sociale?: string;
    gouvernance_partagee?: string;
    ouverture_au_quartier?: string;
    prevention_isolement?: string;
    participation_habitants?: string;
  };
  public_accueilli?: string;
  modalites_admission?: string;
  partenaires_principaux: Array<{
    nom: string;
    type?: string;
    description?: string;
  }>;
  intervenants: Array<{
    nom: string;
    specialite?: string;
    contact?: string;
  }>;
  heures_animation_semaine?: number;
  infos_complementaires?: string;
  created_at: string;
  updated_at: string;
}

interface AvpInfosSectionProps {
  avpInfos: AvpInfos;
  isPublic?: boolean; // true pour affichage public, false pour édition
}

export function AvpInfosSection({ avpInfos, isPublic = true }: AvpInfosSectionProps) {
  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'intention': return 'Projet en intention';
      case 'en_projet': return 'Projet en cours';
      case 'ouvert': return 'Ouvert et fonctionnel';
      default: return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'intention': return '#f59e0b'; // orange
      case 'en_projet': return '#3b82f6'; // blue
      case 'ouvert': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const pvspFields = [
    { key: 'objectifs', label: 'Objectifs et finalités' },
    { key: 'animation_vie_sociale', label: 'Animation de la vie sociale' },
    { key: 'gouvernance_partagee', label: 'Gouvernance partagée' },
    { key: 'ouverture_au_quartier', label: 'Ouverture au quartier' },
    { key: 'prevention_isolement', label: 'Prévention de l&apos;isolement' },
    { key: 'participation_habitants', label: 'Participation des habitants' }
  ];

  if (isPublic) {
    return (
      <div style={{ 
        marginTop: 32, 
        padding: '24px', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: 16,
        border: '2px solid #0ea5e9',
        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <div style={{
            background: '#0ea5e9',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            🏡 Appartement de Coordination
          </div>
          <div style={{
            background: getStatutColor(avpInfos.statut),
            color: 'white',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            {getStatutLabel(avpInfos.statut)}
          </div>
        </div>

        {/* Dates importantes */}
        <div style={{ marginBottom: 20 }}>
          {avpInfos.date_intention && (
            <div style={{ marginBottom: 6, color: '#0c4a6e' }}>
              <strong>Date d&apos;intention :</strong> {formatDate(avpInfos.date_intention)}
            </div>
          )}
          {avpInfos.date_en_projet && (
            <div style={{ marginBottom: 6, color: '#0c4a6e' }}>
              <strong>Mise en projet :</strong> {formatDate(avpInfos.date_en_projet)}
            </div>
          )}
          {avpInfos.date_ouverture && (
            <div style={{ marginBottom: 6, color: '#0c4a6e' }}>
              <strong>Date d&apos;ouverture :</strong> {formatDate(avpInfos.date_ouverture)}
            </div>
          )}
        </div>

        {/* PVSP - Projet de Vie Sociale Partagée */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            color: '#0c4a6e', 
            marginBottom: 16,
            borderBottom: '2px solid #0ea5e9',
            paddingBottom: 8
          }}>
            Projet de Vie Sociale Partagée (PVSP)
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {pvspFields.map(field => {
              const value = avpInfos.pvsp_fondamentaux[field.key as keyof typeof avpInfos.pvsp_fondamentaux];
              if (!value || value.trim() === '') return null;
              
              return (
                <div key={field.key} style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>
                    {field.label}
                  </div>
                  <div style={{ color: '#1e40af', lineHeight: 1.5 }}>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Public accueilli */}
        {avpInfos.public_accueilli && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Public accueilli</h4>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              padding: '12px 16px', 
              borderRadius: 8,
              border: '1px solid #bae6fd',
              color: '#1e40af'
            }}>
              {avpInfos.public_accueilli}
            </div>
          </div>
        )}

        {/* Modalités d'admission */}
        {avpInfos.modalites_admission && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Modalités d&apos;admission</h4>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              padding: '12px 16px', 
              borderRadius: 8,
              border: '1px solid #bae6fd',
              color: '#1e40af'
            }}>
              {avpInfos.modalites_admission}
            </div>
          </div>
        )}

        {/* Animation */}
        {avpInfos.heures_animation_semaine && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Animation</h4>
            <div style={{ color: '#1e40af' }}>
              <strong>{avpInfos.heures_animation_semaine}h</strong> d&apos;animation par semaine
            </div>
          </div>
        )}

        {/* Partenaires */}
        {avpInfos.partenaires_principaux && avpInfos.partenaires_principaux.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Partenaires principaux</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {avpInfos.partenaires_principaux.map((partenaire, idx) => (
                <div key={idx} style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: '#0c4a6e',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  border: '1px solid #0ea5e9'
                }}>
                  {typeof partenaire === 'string' ? partenaire : partenaire.nom}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intervenants */}
        {avpInfos.intervenants && avpInfos.intervenants.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Intervenants</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {avpInfos.intervenants.map((intervenant, idx) => (
                <div key={idx} style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: '#0c4a6e',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  border: '1px solid #0ea5e9'
                }}>
                  {typeof intervenant === 'string' ? intervenant : intervenant.nom}
                  {typeof intervenant === 'object' && intervenant.specialite && (
                    <span style={{ fontStyle: 'italic', marginLeft: 4 }}>
                      ({intervenant.specialite})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations complémentaires */}
        {avpInfos.infos_complementaires && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0c4a6e', marginBottom: 8 }}>Informations complémentaires</h4>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              padding: '12px 16px', 
              borderRadius: 8,
              border: '1px solid #bae6fd',
              color: '#1e40af',
              lineHeight: 1.5
            }}>
              {avpInfos.infos_complementaires}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Version pour édition/administration (plus compacte)
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
          🏡 AVP
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium text-white`} 
              style={{ backgroundColor: getStatutColor(avpInfos.statut) }}>
          {getStatutLabel(avpInfos.statut)}
        </span>
      </div>
      
      <div className="text-sm text-blue-800 space-y-1">
        {avpInfos.date_ouverture && (
          <div><strong>Ouverture :</strong> {formatDate(avpInfos.date_ouverture)}</div>
        )}
        {avpInfos.heures_animation_semaine && (
          <div><strong>Animation :</strong> {avpInfos.heures_animation_semaine}h/semaine</div>
        )}
        {avpInfos.intervenants && avpInfos.intervenants.length > 0 && (
          <div><strong>Intervenants :</strong> {avpInfos.intervenants.length}</div>
        )}
        {avpInfos.partenaires_principaux && avpInfos.partenaires_principaux.length > 0 && (
          <div><strong>Partenaires :</strong> {avpInfos.partenaires_principaux.length}</div>
        )}
      </div>
    </div>
  );
}

export default AvpInfosSection;