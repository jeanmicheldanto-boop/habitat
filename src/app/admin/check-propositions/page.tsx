'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CheckPropositions() {
  const [propositions, setPropositions] = useState([]);
  const [stats, setStats] = useState({ total: 0, etablissements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Compter et récupérer les propositions
      const { data: propositions, count: propCount, error: propError } = await supabase
        .from('propositions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(20);

      if (propError) throw propError;

      // Compter les établissements
      const { count: etabCount, error: etabError } = await supabase
        .from('etablissements')
        .select('*', { count: 'exact', head: true });

      if (etabError) throw etabError;

      setPropositions(propositions || []);
      setStats({ total: propCount || 0, etablissements: etabCount || 0 });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusBadge = (statut) => {
    const colors = {
      en_attente: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
      approuvee: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      partielle: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      rejetee: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
      retiree: { bg: '#f3f4f6', text: '#374151', border: '#6b7280' }
    };
    
    const color = colors[statut] || colors.en_attente;
    
    return (
      <span
        style={{
          backgroundColor: color.bg,
          color: color.text,
          border: `1px solid ${color.border}`,
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}
      >
        {statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #f3f4f6', 
            borderTop: '3px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Chargement des propositions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '800px', 
        margin: '2rem auto',
        background: '#fee2e2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>
          ❌ Erreur
        </h2>
        <p style={{ color: '#7f1d1d' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '2rem auto',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#374151' }}>
        🔍 Vérification de la table propositions
      </h1>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#f0f9ff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>
            📊 Propositions
          </h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
            {stats.total}
          </p>
        </div>
        
        <div style={{
          background: '#f0fdf4',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#14532d' }}>
            🏢 Établissements
          </h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#16a34a' }}>
            {stats.etablissements}
          </p>
        </div>
      </div>

      {/* Bouton actualiser */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={checkData}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des propositions */}
      {stats.total === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Aucune proposition trouvée
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            La table propositions est vide. C'est normal si vous n'avez créé des établissements 
            que via l'interface admin (qui crée directement des établissements).
          </p>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            <strong>Pour tester la modération :</strong><br/>
            Allez sur <code style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>/admin</code> 
            {' '}et cliquez sur "🧪 Créer des propositions de test"
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem', color: '#374151' }}>
            📋 Propositions trouvées ({stats.total})
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {propositions.map((prop, idx) => (
              <div
                key={prop.id}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                      {prop.payload?.nom || `Proposition ${idx + 1}`}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                      <span><strong>Type:</strong> {prop.type_cible}</span>
                      <span><strong>Action:</strong> {prop.action}</span>
                      <span><strong>Source:</strong> {prop.source}</span>
                    </div>
                  </div>
                  {getStatusBadge(prop.statut)}
                </div>
                
                {prop.payload?.ville && (
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                    📍 {prop.payload.ville}
                  </p>
                )}
                
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Créé le {formatDate(prop.created_at)}</span>
                  {prop.reviewed_at && (
                    <span> • Révisé le {formatDate(prop.reviewed_at)}</span>
                  )}
                </div>
                
                {prop.review_note && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#fffbeb',
                    border: '1px solid #fed7aa',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    <strong>Note de révision:</strong> {prop.review_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}