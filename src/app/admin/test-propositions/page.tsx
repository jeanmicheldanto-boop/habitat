'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CreateTestPropositions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestPropositions = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Créer 2 propositions de test
      const testPropositions = [
        {
          type_cible: 'etablissement',
          action: 'create',
          statut: 'en_attente',
          payload: {
            nom: 'Résidence Les Jardins - TEST 1',
            description: 'Une magnifique résidence seniors avec services intégrés.',
            adresse: '15 Avenue des Lilas',
            ville: 'Toulouse',
            code_postal: '31000',
            latitude: 43.6043,
            longitude: 1.4437,
            telephone: '05 61 11 22 33',
            email: 'contact@jardins-toulouse.fr',
            site_web: 'https://jardins-toulouse.fr',
            habitat_type: 'residence',
            capacite_totale: 45,
            prix_min: 800,
            prix_max: 1200
          },
          source: 'gestionnaire'
        },
        {
          type_cible: 'etablissement', 
          action: 'create',
          statut: 'en_attente',
          payload: {
            nom: 'Village Senior Harmonie - TEST 2',
            description: 'Un village de seniors autonomes dans un cadre verdoyant.',
            adresse: '8 Rue de la Paix',
            ville: 'Montpellier', 
            code_postal: '34000',
            latitude: 43.6119,
            longitude: 3.8772,
            telephone: '04 67 44 55 66',
            email: 'info@village-harmonie.fr',
            site_web: 'https://village-harmonie.fr',
            habitat_type: 'habitat_partage',
            capacite_totale: 30,
            prix_min: 600,
            prix_max: 950
          },
          source: 'gestionnaire'
        }
      ];

      const { data, error } = await supabase
        .from('propositions')
        .insert(testPropositions)
        .select();

      if (error) throw error;

      setMessage(`✅ ${data.length} propositions de test créées avec succès !`);
      
    } catch (error) {
      console.error('Erreur:', error);
      setMessage(`❌ Erreur : ${(error instanceof Error ? error.message : 'Erreur inconnue')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '2rem auto',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#374151' }}>
        🧪 Créer des propositions de test
      </h2>
      
      <p style={{ 
        marginBottom: '1.5rem', 
        color: '#6b7280',
        lineHeight: '1.5'
      }}>
  Cela va créer 2 propositions d&apos;établissements en attente de modération 
  pour tester le système de modération.
      </p>

      <button
        onClick={createTestPropositions}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Création en cours...' : 'Créer les propositions de test'}
      </button>

      {message && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '6px',
          background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${message.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
          color: message.startsWith('✅') ? '#166534' : '#991b1b'
        }}>
          {message}
        </div>
      )}

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
        <p><strong>Après création :</strong></p>
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Allez sur <code>/admin/moderation</code></li>
          <li>Vous devriez voir 2 propositions en attente</li>
          <li>Cliquez sur &quot;Examiner&quot; pour les approuver/rejeter</li>
          <li>Si approuvées, elles deviendront de vrais établissements</li>
        </ol>
      </div>
    </div>
  );
}