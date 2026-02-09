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

export default function GestionnaireDashboardRefonte() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [userOrganisation, setUserOrganisation] = useState('');
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
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
      await loadEtablissements(profile.organisation || '', authUser.id);
      await loadPropositions(authUser.id);
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadEtablissements = async (organisation: string, userId: string) => {
    if (!organisation && !userId) return;

    // Charger les établissements de l'organisation
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('id, nom, commune, departement, statut_editorial, habitat_type, created_at')
      .eq('gestionnaire', organisation)
      .order('created_at', { ascending: false });

    // Charger les établissements dont l'utilisateur est proprietaire
    const { data: proprietaireEtabs } = await supabase
      .from('etablissement_proprietaires')
      .select('etablissement_id, active')
      .eq('user_id', userId)
      .eq('active', true);

    // Récupérer les détails des établissements proprietaires
    const proprietaireEtabIds = proprietaireEtabs?.map(p => p.etablissement_id) || [];
    const { data: proprietaireEtabDetails } = proprietaireEtabIds.length > 0 ? await supabase
      .from('etablissements')
      .select('id, nom, commune, departement, statut_editorial, habitat_type, created_at')
      .in('id', proprietaireEtabIds)
      .order('created_at', { ascending: false })
      : { data: [] };

    // Combiner les deux listes (sans doublons)
    const allEtabs = etabs || [];
    const proprietaireDetails = proprietaireEtabDetails || [];
    const combined = [
      ...allEtabs,
      ...proprietaireDetails.filter(p => !allEtabs.some(o => o.id === p.id))
    ];

    if (error && !proprietaireEtabDetails) {
      console.error('Error loading etablissements:', error);
      return;
    }

    if (!combined || combined.length === 0) {
      setEtablissements([]);
      return;
    }

    // Charger les images pour chaque établissement
    const etabsWithImages = await Promise.all(
      combined.map(async (etab) => {
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
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ======================== HERO HEADER ======================== */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                Bienvenue, {userOrganisation || user?.email?.split('@')[0]}
              </h1>
              <p style={{ margin: '0.75rem 0 0', opacity: 0.95, fontSize: '1.05rem', fontWeight: 300 }}>
                Gérez vos établissements et vos demandes facilement
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff',
                padding: '0.875rem 1.75rem',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              Déconnexion
            </button>
          </div>

          {/* Stats row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2.5rem'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{etablissements.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>Établissements</div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{propositions.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>Demandes</div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem 1.5rem',
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{propositions.filter(p => p.statut === 'approuvee').length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>Approuvées</div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================== MAIN CONTENT ======================== */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* ======================== SECTION 1: ACTIONS RAPIDES ======================== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            🚀 Actions rapides
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* CREATE Card*/}
            <Link href="/gestionnaire/create" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.2)';
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                <h3 style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  Créer un établissement
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  Ajouter une nouvelle fiche établissement
                </p>
              </div>
            </Link>

            {/* CLAIM Card */}
            <Link href="/gestionnaire/claim" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.2)';
                e.currentTarget.style.borderColor = '#22c55e';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
                <h3 style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  Réclamer une propriété
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  Revendiquer la propriété d'un établissement
                </p>
              </div>
            </Link>

            {/* MANAGE Card */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '2rem',
              cursor: 'not-allowed',
              opacity: etablissements.length === 0 ? 0.6 : 1,
              transition: 'all 0.3s ease',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚙️</div>
              <h3 style={{ 
                margin: '0 0 0.5rem', 
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1f2937'
              }}>
                Gérer les établissements
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem',
                color: '#6b7280'
              }}>
                {etablissements.length === 0 
                  ? 'Aucun établissement à gérer' 
                  : 'Modifier vos établissements'}
              </p>
            </div>
          </div>
        </section>

        {/* ======================== SECTION 2: MES ÉTABLISSEMENTS ======================== */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#1f2937',
              margin: 0
            }}>
              📍 Mes établissements ({etablissements.length})
            </h2>
          </div>

          {etablissements.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
              border: '2px dashed #e5e7eb'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏗️</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#374151', fontSize: '1.1rem' }}>
                Aucun établissement pour le moment
              </h3>
              <p style={{ margin: 0 }}>
                Créez votre premier établissement ou réclamez la propriété d'un établissement existant
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {etablissements.map(etab => (
                <div
                  key={etab.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    background: '#fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f3f4f6' }}>
                    <Image
                      src={etab.image_path ? getSupabaseImageUrl(etab.image_path) : getHabitatImage(etab.sous_categories || null)}
                      alt={etab.nom}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem', 
                      fontSize: '1.1rem',
                      color: '#1f2937',
                      fontWeight: 600
                    }}>
                      {etab.nom}
                    </h3>
                    <div style={{ 
                      margin: '0.5rem 0 1rem',
                      fontSize: '0.9rem',
                      color: '#6b7280'
                    }}>
                      <p style={{ margin: '0 0 0.25rem' }}>📍 {etab.commune}</p>
                      <p style={{ margin: 0 }}>📞 {etab.departement}</p>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: etab.statut_editorial === 'publie' ? '#d1fae5' : '#fee2e2',
                        color: etab.statut_editorial === 'publie' ? '#065f46' : '#991b1b',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        {etab.statut_editorial === 'publie' ? '✓ Publié' : '⏱️ Brouillon'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link
                        href={`/gestionnaire/edit/${etab.id}`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          borderRadius: 8,
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        ✏️ Modifier
                      </Link>
                      <Link
                        href={`/plateforme/fiche?id=${etab.id}`}
                        target="_blank"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '0.75rem 1rem',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: 8,
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          border: '1px solid #e5e7eb'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        👁️ Voir
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================== SECTION 3: HISTORIQUE DE DEMANDES ======================== */}
        <section>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            📋 Historique de vos demandes
          </h2>

          {propositions.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
              border: '2px dashed #e5e7eb'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#374151', fontSize: '1.1rem' }}>
                Aucune demande en attente
              </h3>
              <p style={{ margin: 0 }}>
                Tous vos établissements sont en ordre
              </p>
            </div>
          ) : (
            <div style={{ 
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {propositions.map((prop, idx) => (
                  <div
                    key={prop.id}
                    style={{
                      borderBottom: idx < propositions.length - 1 ? '1px solid #e5e7eb' : 'none',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#1f2937', fontWeight: 600 }}>
                        {(prop.payload as { nom?: string }).nom || 'Sans nom'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                        Demandé le {new Date(prop.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {prop.review_note && (
                        <p style={{ 
                          margin: '0.5rem 0 0', 
                          fontSize: '0.85rem', 
                          color: '#dc2626',
                          fontStyle: 'italic'
                        }}>
                          💬 {prop.review_note}
                        </p>
                      )}
                    </div>
                    <div style={{ marginLeft: '1rem' }}>
                      {prop.statut === 'en_attente' && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: 20,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          ⏱️ En attente
                        </span>
                      )}
                      {prop.statut === 'approuvee' && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#d1fae5',
                          color: '#065f46',
                          borderRadius: 20,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          ✅ Approuvée
                        </span>
                      )}
                      {prop.statut === 'rejetee' && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: 20,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          ❌ Rejetée
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
