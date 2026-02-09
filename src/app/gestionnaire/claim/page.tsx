"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface Etablissement {
  id: string;
  nom: string;
  presentation: string;
  adresse_l1: string;
  commune: string;
  code_postal: string;
  habitat_type: string;
  statut_editorial: string;
}

interface User { id: string; email?: string; nom?: string; prenom?: string; telephone?: string; organisation?: string; }

export default function ClaimEtablissement() {
  const [user, setUser] = useState<User | null>(null); // À remplacer par le type correct si disponible
  const [searchTerm, setSearchTerm] = useState('');
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [selectedEtablissement, setSelectedEtablissement] = useState<Etablissement | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Formulaire de réclamation
  const [formData, setFormData] = useState({
    domaine: '',
    preuve_urls: [] as string[]
  });

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

      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const searchEtablissements = async () => {
    if (searchTerm.length < 2) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('etablissements')
        .select('id, nom, presentation, adresse_l1, commune, code_postal, habitat_type, statut_editorial')
        .or(`nom.ilike.%${searchTerm}%,commune.ilike.%${searchTerm}%,adresse_l1.ilike.%${searchTerm}%`)
        .eq('statut_editorial', 'publie')
        .limit(10);

      if (error) throw error;
      setEtablissements(data || []);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError('Erreur lors de la recherche : ' + (err as { message: string }).message);
      } else {
        setError('Erreur lors de la recherche');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEtablissements();
  };

  const handleFilesUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, preuve_urls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEtablissement || !user) return;

    setSubmitLoading(true);
    setError('');
    
    try {
      const reclamationData = {
        etablissement_id: selectedEtablissement.id,
        user_id: user?.id,
        statut: 'en_attente',
        domaine: formData.domaine,
        preuve_path: formData.preuve_urls.length > 0 ? formData.preuve_urls[0] : null
      };

      const { error } = await supabase
        .from('reclamations_propriete')
        .insert([reclamationData]);

      if (error) throw error;

      setSuccess('Votre réclamation a été soumise avec succès ! Elle sera examinée par nos équipes.');
      setSelectedEtablissement(null);
      setFormData({ domaine: '', preuve_urls: [] });
      setEtablissements([]);
      setSearchTerm('');
      
      setTimeout(() => {
        router.push('/gestionnaire/dashboard?tab=reclamations');
      }, 2000);

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError('Erreur lors de la soumission : ' + (err as { message: string }).message);
      } else {
        setError('Erreur lors de la soumission');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Réclamer un établissement</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Recherchez un &eacute;tablissement existant pour en revendiquer la propri&eacute;t&eacute;
                </p>
              </div>
              <Link
                href="/gestionnaire/dashboard"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                ← Retour au dashboard
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 1: Recherche d&#39;établissement */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">1. Rechercher l&#39;établissement</h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nom de l&#39;établissement, ville, adresse..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading || searchTerm.length < 2}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </form>

              {/* Résultats de recherche */}
              {etablissements.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-gray-900">Résultats de recherche :</h4>
                  <div className="grid gap-4">
                    {etablissements.map((etablissement) => (
                      <div
                        key={etablissement.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedEtablissement?.id === etablissement.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedEtablissement(etablissement)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{etablissement.nom}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {etablissement.adresse_l1}, {etablissement.code_postal} {etablissement.commune}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Type: {etablissement.habitat_type?.replace('_', ' ')}
                            </p>
                            {etablissement.presentation && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {etablissement.presentation}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            {selectedEtablissement?.id === etablissement.id ? (
                              <div className="flex items-center text-blue-600">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-sm font-medium">Sélectionné</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Cliquer pour s&eacute;lectionner</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchTerm.length >= 2 && etablissements.length === 0 && !searchLoading && (
                <div className="mt-6 text-center py-8 text-gray-500">
                  Aucun &eacute;tablissement trouv&eacute;. Vous pouvez{' '}
                  <Link href="/gestionnaire/create" className="text-blue-600 hover:text-blue-500">
                    cr&eacute;er un nouvel &eacute;tablissement
                  </Link>&#39;.
                </div>
              )}
            </div>

            {/* Étape 2: Formulaire de réclamation */}
            {selectedEtablissement && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2. Justifier votre réclamation
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Établissement sélectionné: <strong>{selectedEtablissement.nom}</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="domaine" className="block text-sm font-medium text-gray-700">
                      Motif de la réclamation *
                    </label>
                    <textarea
                      id="domaine"
                      rows={4}
                      required
                      value={formData.domaine}
                      onChange={(e) => setFormData(prev => ({ ...prev, domaine: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Expliquez pourquoi vous &ecirc;tes le propri&eacute;taire/gestionnaire l&eacute;gitime de cet &eacute;tablissement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justificatifs
                    </label>
                    
                    <FileUpload
                      onFilesUploaded={handleFilesUploaded}
                      maxFiles={5}
                      acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                      className="mb-4"
                    />

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-yellow-800">Documents recommandés</h4>
                          <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Contrat de bail ou acte de propri&eacute;t&eacute;</li>
                              <li>Kbis de l&#39;entreprise gestionnaire</li>
                              <li>Autorisation d&#39;exploitation</li>
                              <li>Factures ou documents officiels</li>
                              <li>Correspondances avec l&#39;&eacute;tablissement</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedEtablissement(null)}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? 'Envoi en cours...' : 'Soumettre la r&eacute;clamation'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}