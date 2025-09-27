'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Proposition {
  id: string;
  type_cible: string;
  action: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  payload: any;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
  created_by: string;
  profiles?: {
    nom: string;
    prenom: string;
    email: string;
    organisation?: string;
  };
}

interface ReclamationPropriete {
  id: string;
  etablissement_id: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  justificatifs: string[];
  commentaire?: string;
  review_note?: string;
  created_at: string;
  created_by: string;
  etablissement?: {
    nom: string;
    ville: string;
  };
  profiles?: {
    nom: string;
    prenom: string;
    email: string;
    organisation?: string;
  };
}

export default function ModerationDashboard() {
  const [user, setUser] = useState<any>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [reclamations, setReclamations] = useState<ReclamationPropriete[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'propositions' | 'reclamations'>('propositions');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('🔍 Debug Auth - User:', user);
      
      if (!user) {
        console.log('❌ Pas d\'utilisateur connecté, redirection vers /admin');
        router.push('/admin');
        return;
      }

      // Vérifier le rôle admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('🔍 Debug Profile:', profile, 'Error:', profileError);

      if (profile?.role !== 'admin') {
        console.log('❌ Utilisateur n\'est pas admin, rôle actuel:', profile?.role);
        // Rediriger les gestionnaires vers les propositions
        router.push('/admin/propositions');
        return; // Sortir complètement de la fonction
      }

      setUser(user);
      loadData();
    };

    checkAuth();
  }, [router]);

  const loadData = async () => {
    // Ne pas charger les données si on n'a pas d'utilisateur authentifié
    if (!user) {
      console.log('⚠️ Pas d\'utilisateur authentifié, arrêt du chargement');
      return;
    }
    
    try {
      console.log('🔄 Chargement des données de modération...');
      
      // Charger d'abord les propositions SANS join pour déboguer
      const { data: proposDataSimple, error: proposErrorSimple } = await supabase
        .from('propositions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📋 Propositions (requête simple):', proposDataSimple?.length || 0, 'Erreur:', proposErrorSimple);
      if (proposDataSimple) {
        console.log('📝 Détail propositions (simple):', proposDataSimple);
      }

      // Ensuite essayer avec le join
      const { data: proposData, error: proposError } = await supabase
        .from('propositions')
        .select(`
          *,
          profiles!created_by(nom, prenom, email, organisation)
        `)
        .order('created_at', { ascending: false });

      console.log('📋 Propositions (avec join):', proposData?.length || 0, 'Erreur:', proposError);
      if (proposData) {
        console.log('📝 Détail propositions (avec join):', proposData);
        setPropositions(proposData);
      } else if (proposDataSimple) {
        // Si le join échoue, utiliser les données simples
        console.log('⚠️ Utilisation des données simples car le join a échoué');
        setPropositions(proposDataSimple);
      }

      // Charger les réclamations avec les établissements et profils
      const { data: reclamData, error: reclamError } = await supabase
        .from('reclamations_propriete')
        .select(`
          *,
          etablissement:etablissements(nom, ville),
          profiles!created_by(nom, prenom, email, organisation)
        `)
        .order('created_at', { ascending: false });

      console.log('🏢 Réclamations trouvées:', reclamData?.length || 0, 'Erreur:', reclamError);
      if (reclamData) {
        console.log('📋 Détail réclamations:', reclamData);
        setReclamations(reclamData);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (itemId: string, action: 'approuve' | 'rejete', type: 'proposition' | 'reclamation') => {
    setActionLoading(true);
    try {
      const updateData = {
        statut: action,
        review_note: reviewNote || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      };

      if (type === 'proposition') {
        const { error } = await supabase
          .from('propositions')
          .update(updateData)
          .eq('id', itemId);

        if (error) throw error;

        // Si approuvée et action=create, créer l'établissement
        if (action === 'approuve') {
          const proposition = propositions.find(p => p.id === itemId);
          if (proposition?.action === 'create') {
            await createEtablissementFromProposition(proposition);
          }
        }
      } else {
        const { error } = await supabase
          .from('reclamations_propriete')
          .update(updateData)
          .eq('id', itemId);

        if (error) throw error;
      }

      // Recharger les données
      await loadData();
      setSelectedItem(null);
      setReviewNote('');
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const createEtablissementFromProposition = async (proposition: Proposition) => {
    try {
      const payload = proposition.payload;
      
      // Créer l'établissement
      const etablissementData = {
        nom: payload.nom,
        description: payload.description,
        adresse: payload.adresse,
        ville: payload.ville,
        code_postal: payload.code_postal,
        latitude: payload.latitude,
        longitude: payload.longitude,
        telephone: payload.telephone,
        email: payload.email,
        site_web: payload.site_web,
        habitat_type: payload.habitat_type,
        capacite_totale: payload.capacite_totale,
        prix_min: payload.prix_min,
        prix_max: payload.prix_max,
        statut: 'publie',
        created_by: proposition.created_by
      };

      const { data: etablissement, error: etablissementError } = await supabase
        .from('etablissements')
        .insert([etablissementData])
        .select()
        .single();

      if (etablissementError) throw etablissementError;

      // Créer les liaisons avec les sous-catégories
      if (payload.sous_categories && payload.sous_categories.length > 0) {
        const sousCategoriesData = payload.sous_categories.map((scId: string) => ({
          etablissement_id: etablissement.id,
          sous_categorie_id: parseInt(scId)
        }));

        await supabase
          .from('etablissement_sous_categories')
          .insert(sousCategoriesData);
      }

      // Créer les liaisons avec les équipements
      if (payload.equipements && payload.equipements.length > 0) {
        const equipementsData = payload.equipements.map((eqId: string) => ({
          etablissement_id: etablissement.id,
          equipement_id: parseInt(eqId)
        }));

        await supabase
          .from('etablissement_equipements')
          .insert(equipementsData);
      }

      // Créer les liaisons avec les services
      if (payload.services && payload.services.length > 0) {
        const servicesData = payload.services.map((sId: string) => ({
          etablissement_id: etablissement.id,
          service_id: parseInt(sId)
        }));

        await supabase
          .from('etablissement_services')
          .insert(servicesData);
      }

    } catch (error) {
      console.error('Erreur création établissement:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutBadge = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approuve: 'bg-green-100 text-green-800 border-green-200',
      rejete: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      en_attente: 'En attente',
      approuve: 'Approuvée',
      rejete: 'Rejetée'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin, afficher un message de redirection
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h1>
          <p className="text-gray-600 mb-4">Cette page est réservée aux administrateurs.</p>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin" className="text-blue-600 hover:text-blue-500 mr-4">
                ← Retour admin
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modération</h1>
                <p className="text-sm text-gray-600">Gérer les demandes des gestionnaires</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Propositions en attente</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {propositions.filter(p => p.statut === 'en_attente').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Propositions approuvées</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {propositions.filter(p => p.statut === 'approuve').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Réclamations en attente</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reclamations.filter(r => r.statut === 'en_attente').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total gestionnaires</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {[...new Set([...propositions.map(p => p.created_by), ...reclamations.map(r => r.created_by)])].length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('propositions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'propositions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Propositions d'établissements ({propositions.length})
            </button>
            <button
              onClick={() => setActiveTab('reclamations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reclamations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Réclamations de propriété ({reclamations.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'propositions' && (
          <div className="space-y-6">
            {propositions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune proposition</h3>
                <p className="mt-1 text-sm text-gray-500">Aucune proposition d'établissement en attente.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {propositions.map((proposition) => (
                  <div key={proposition.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {proposition.payload?.nom || 'Établissement sans nom'}
                            </h3>
                            {getStatutBadge(proposition.statut)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Adresse:</strong> {proposition.payload?.adresse}, {proposition.payload?.code_postal} {proposition.payload?.ville}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Type:</strong> {proposition.payload?.habitat_type?.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Action:</strong> {proposition.action}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Demandeur:</strong> {proposition.profiles?.prenom} {proposition.profiles?.nom}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {proposition.profiles?.email}
                              </p>
                              {proposition.profiles?.organisation && (
                                <p className="text-sm text-gray-600">
                                  <strong>Organisation:</strong> {proposition.profiles.organisation}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mb-4">
                            Demandé le {formatDate(proposition.created_at)}
                          </p>

                          {proposition.review_note && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md border">
                              <p className="text-sm text-gray-700">
                                <strong>Note de révision:</strong> {proposition.review_note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 flex-shrink-0">
                          {proposition.statut === 'en_attente' && (
                            <button
                              onClick={() => setSelectedItem({ ...proposition, type: 'proposition' })}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                              Examiner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reclamations' && (
          <div className="space-y-6">
            {reclamations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réclamation</h3>
                <p className="mt-1 text-sm text-gray-500">Aucune réclamation de propriété en attente.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reclamations.map((reclamation) => (
                  <div key={reclamation.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reclamation.etablissement?.nom || 'Établissement'}
                            </h3>
                            {getStatutBadge(reclamation.statut)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Établissement:</strong> {reclamation.etablissement?.nom}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Ville:</strong> {reclamation.etablissement?.ville}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Justificatifs:</strong> {reclamation.justificatifs?.length || 0} fichier(s)
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Demandeur:</strong> {reclamation.profiles?.prenom} {reclamation.profiles?.nom}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {reclamation.profiles?.email}
                              </p>
                              {reclamation.profiles?.organisation && (
                                <p className="text-sm text-gray-600">
                                  <strong>Organisation:</strong> {reclamation.profiles.organisation}
                                </p>
                              )}
                            </div>
                          </div>

                          {reclamation.commentaire && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-sm text-gray-700">
                                <strong>Commentaire du demandeur:</strong> {reclamation.commentaire}
                              </p>
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mb-4">
                            Réclamé le {formatDate(reclamation.created_at)}
                          </p>

                          {reclamation.review_note && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md border">
                              <p className="text-sm text-gray-700">
                                <strong>Note de révision:</strong> {reclamation.review_note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 flex-shrink-0">
                          {reclamation.statut === 'en_attente' && (
                            <button
                              onClick={() => setSelectedItem({ ...reclamation, type: 'reclamation' })}
                              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-sm font-medium"
                            >
                              Examiner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de révision */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedItem(null)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Examiner {selectedItem.type === 'proposition' ? 'la proposition' : 'la réclamation'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedItem.type === 'proposition' 
                        ? `Proposition de création: ${selectedItem.payload?.nom}`
                        : `Réclamation pour: ${selectedItem.etablissement?.nom}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="review_note" className="block text-sm font-medium text-gray-700">
                  Note de révision (optionnelle)
                </label>
                <textarea
                  id="review_note"
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ajoutez un commentaire pour expliquer votre décision..."
                />
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedItem.id, 'approuve', selectedItem.type)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:bg-gray-400"
                >
                  {actionLoading ? 'En cours...' : 'Approuver'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedItem.id, 'rejete', selectedItem.type)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:bg-gray-400"
                >
                  {actionLoading ? 'En cours...' : 'Rejeter'}
                </button>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}