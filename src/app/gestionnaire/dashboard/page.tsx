"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseImageUrl } from '@/lib/imageUtils';
import { getHabitatImage } from '@/lib/habitatImages';

interface Etablissement {
  id: string;
  nom: string;
  commune: string;
  departement: string;
  statut_editorial: string;
  habitat_type: string;
  image_path?: string;
  sous_categories?: string[];
  created_at: string;
}

interface Proposition {
  id: string;
  statut: 'en_attente' | 'approuvee' | 'rejetee';
  payload: Record<string, unknown>;
  review_note?: string;
  created_at: string;
}

export default function GestionnaireDashboardV2() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [userOrganisation, setUserOrganisation] = useState('');
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'etablissements' | 'propositions'>('etablissements');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/gestionnaire/login');
        return;
      }

      // Récupérer le profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organisation')
        .eq('id', authUser.id)
        .single();

      if (profile?.role !== 'gestionnaire') {
        router.push('/gestionnaire/login');
        return;
      }

      setUser({ id: authUser.id, email: authUser.email });
      setUserOrganisation(profile.organisation || '');

      // Charger les données
      await loadEtablissements(profile.organisation || '');
      await loadPropositions(authUser.id);
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadEtablissements = async (organisation: string) => {
    if (!organisation) return;

    // Charger les établissements de base
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('id, nom, commune, departement, statut_editorial, habitat_type, created_at')
      .eq('gestionnaire', organisation)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading etablissements:', error);
      return;
    }

    if (!etabs || etabs.length === 0) {
      setEtablissements([]);
      return;
    }

    // Charger les images pour chaque établissement
    const etabsWithImages = await Promise.all(
      etabs.map(async (etab) => {
        const { data: medias } = await supabase
          .from('medias')
          .select('storage_path')
          .eq('etablissement_id', etab.id)
          .order('priority', { ascending: true })
          .limit(1);

        const { data: sousCategories } = await supabase
          .from('etablissement_sous_categorie')
          .select('sous_categories(libelle)')
          .eq('etablissement_id', etab.id);

        return {
          ...etab,
          image_path: medias && medias.length > 0 ? medias[0].storage_path : null,
          sous_categories: sousCategories?.map((sc: any) => sc.sous_categories?.libelle).filter(Boolean) || []
        };
      })
    );

    setEtablissements(etabsWithImages as unknown as Etablissement[]);
  };

  const loadPropositions = async (userId: string) => {
    const { data } = await supabase
      .from('propositions')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setPropositions(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: '#fff', fontSize: '1.2rem' }}>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>
              Tableau de bord gestionnaire
            </h1>
            <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1rem' }}>
              {userOrganisation || user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('etablissements')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'etablissements' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'etablissements' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'etablissements' ? '#667eea' : '#6b7280',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Mes établissements ({etablissements.length})
          </button>
          <button
            onClick={() => setActiveTab('propositions')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'propositions' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'propositions' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'propositions' ? '#667eea' : '#6b7280',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Mes demandes ({propositions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          padding: '2rem',
          minHeight: 500
        }}>
          {activeTab === 'etablissements' && (
            <div>
              {/* Action Button */}
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                  Mes établissements publiés
                </h2>
                <Link
                  href="/gestionnaire/create"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '1.2rem' }}>+</span>
                  Nouvel établissement
                </Link>
              </div>

              {/* Etablissements Grid */}
              {etablissements.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>
                    Aucun établissement pour le moment
                  </h3>
                  <p style={{ margin: 0 }}>
                    Créez votre premier établissement pour commencer
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {etablissements.map(etab => (
                    <div
                      key={etab.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: '#fff'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f3f4f6' }}>
                        <Image
                          src={etab.image_path ? getSupabaseImageUrl(etab.image_path) : getHabitatImage(etab.sous_categories || null)}
                          alt={etab.nom}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ 
                          margin: '0 0 0.5rem', 
                          fontSize: '1.1rem',
                          color: '#1f2937',
                          fontWeight: 600
                        }}>
                          {etab.nom}
                        </h3>
                        <p style={{ 
                          margin: '0 0 1rem', 
                          color: '#6b7280',
                          fontSize: '0.9rem'
                        }}>
                          {etab.commune}, {etab.departement}
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <Link
                            href={`/gestionnaire/edit/${etab.id}`}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '0.625rem',
                              background: '#667eea',
                              color: '#fff',
                              borderRadius: 6,
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              transition: 'background 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
                          >
                            Modifier
                          </Link>
                          <Link
                            href={`/plateforme/fiche?id=${etab.id}`}
                            target="_blank"
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '0.625rem',
                              background: '#f3f4f6',
                              color: '#374151',
                              borderRadius: 6,
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              transition: 'background 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'propositions' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#1f2937' }}>
                Historique de mes demandes
              </h2>

              {propositions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>
                    Aucune demande
                  </h3>
                  <p style={{ margin: 0 }}>
                    Vos demandes de création apparaîtront ici
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {propositions.map(prop => (
                    <div
                      key={prop.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#1f2937' }}>
                          {(prop.payload as { nom?: string }).nom || 'Sans nom'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                          Demandé le {new Date(prop.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        {prop.review_note && (
                          <p style={{ 
                            margin: '0.5rem 0 0', 
                            fontSize: '0.85rem', 
                            color: '#ef4444',
                            fontStyle: 'italic'
                          }}>
                            Note : {prop.review_note}
                          </p>
                        )}
                      </div>
                      <div>
                        {prop.statut === 'en_attente' && (
                          <span style={{
                            padding: '0.5rem 1rem',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: 20,
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            En attente
                          </span>
                        )}
                        {prop.statut === 'approuvee' && (
                          <span style={{
                            padding: '0.5rem 1rem',
                            background: '#d1fae5',
                            color: '#065f46',
                            borderRadius: 20,
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            Approuvée
                          </span>
                        )}
                        {prop.statut === 'rejetee' && (
                          <span style={{
                            padding: '0.5rem 1rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: 20,
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            Rejetée
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
