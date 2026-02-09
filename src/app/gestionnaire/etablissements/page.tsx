"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface Etablissement {
  id: string;
  nom: string;
  presentation: string;
  adresse_l1: string;
  code_postal: string;
  commune: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  habitat_type: string;
  sous_categories: string[];
  capacite_totale?: number;
  created_at: string;
}

export default function MesEtablissements() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/gestionnaire/login');
        return;
      }

      // Vérifier le rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError?.code === 'PGRST116' || !profile) {
        const userData = user.user_metadata;
        if (userData?.role === 'gestionnaire') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                nom: userData.nom || '',
                prenom: userData.prenom || '',
                telephone: userData.telephone || '',
                organisation: userData.organisation || '',
                role: 'gestionnaire'
              }
            ]);

          if (insertError) {
            console.error('Erreur création profil:', insertError);
          }
        } else {
          router.push('/gestionnaire/login');
          return;
        }
      } else if (profile?.role !== 'gestionnaire') {
        router.push('/gestionnaire/login');
        return;
      }

      loadEtablissements(user.id);
    };

    checkAuth();
  }, [router]);

  const loadEtablissements = async (userId: string) => {
    try {
      // Charger les établissements créés par ce gestionnaire
      const { data: etablissementsData, error } = await supabase
        .from('etablissements')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement:', error);
        setError('Erreur lors du chargement des établissements');
      } else {
        setEtablissements(etablissementsData || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHabitatTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      logement_independant: 'Logement indépendant',
      residence: 'Résidence',
      habitat_partage: 'Habitat partagé'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image src="/logoDF.png" alt="Logo" width={32} height={32} className="mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes établissements</h1>
                <p className="text-sm text-gray-600">Gérez vos établissements validés</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/gestionnaire/dashboard"
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour au dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {etablissements.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun établissement</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n&#39;avez pas encore d&#39;établissements validés.
            </p>
            <div className="mt-6">
              <Link
                href="/gestionnaire/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer un établissement
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {etablissements.map((etablissement) => (
              <div
                key={etablissement.id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
              >
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 mr-3">
                          {etablissement.nom}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Validé
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600">
                        {etablissement.presentation}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {etablissement.adresse_l1}, {etablissement.code_postal} {etablissement.commune}
                        </div>

                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {getHabitatTypeLabel(etablissement.habitat_type)}
                        </div>

                        {etablissement.capacite_totale && (
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Capacité: {etablissement.capacite_totale}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-gray-400">
                          Créé le {formatDate(etablissement.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/admin/etablissements/${etablissement.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/admin/etablissements/${etablissement.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}