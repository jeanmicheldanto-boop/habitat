"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Proposition {
  id: string;
  type_cible: string;
  action: string;
  statut: 'en_attente' | 'approuvee' | 'rejetee';
    payload: Record<string, unknown>;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
}

interface ReclamationPropriete {
  id: string;
  etablissement_id: string;
  statut: 'en_attente' | 'verifiee' | 'rejetee';
  justificatifs: string[];
  commentaire?: string;
  review_note?: string;
  created_at: string;
  etablissement?: {
    nom: string;
    ville: string;
  };
}

export default function GestionnaireDashboard() {
  const [user, setUser] = useState<unknown>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [reclamations, setReclamations] = useState<ReclamationPropriete[]>([]);
    const [notifications, setNotifications] = useState<Array<{ id: string; is_read: boolean; title?: string; message?: string; data?: { review_note?: string }; created_at?: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'propositions' | 'reclamations' | 'etablissements'>('propositions');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

    // Déclaration déplacée : loadData
    const loadData = async (userId: string) => {
      try {
        // Charger les propositions
        const { data: proposData } = await supabase
          .from('propositions')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (proposData) setPropositions(proposData);

        // Charger les réclamations de propriété
        const { data: reclamData } = await supabase
          .from('reclamations_propriete')
          .select(`
            *,
            etablissement:etablissements(nom, ville)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (reclamData) setReclamations(reclamData);

        // Charger les notifications
        await loadNotifications(userId);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };


  // Déclaration déplacée : loadData

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

      // Si le profil n'existe pas, vérifier les métadonnées
      if (profileError?.code === 'PGRST116' || !profile) {
        const userData = user.user_metadata;
        if (userData?.role === 'gestionnaire') {
          // Essayer de créer le profil
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
      loadData((user as { id: string }).id);
    };

    checkAuth();

    // Vérifier les paramètres URL pour les messages de succès
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'creation') {
      setSuccessMessage('Votre demande de création d\'établissement a été soumise avec succès !');
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/gestionnaire/dashboard');
    }
    
    // Gérer l'onglet depuis les paramètres URL
    const tab = urlParams.get('tab');
    if (tab === 'reclamations') {
      setActiveTab('reclamations');
    }
  }, [router, loadData]);

  useEffect(() => {
    if (!user) return;

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${(user as { id: string }).id}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [
            {
              id: newNotification.id,
              is_read: newNotification.is_read,
              title: newNotification.title,
              message: newNotification.message,
              data: newNotification.data,
              created_at: newNotification.created_at
            },
            ...prev
          ]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fermer le dropdown de notifications quand on clique à côté
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-notifications-dropdown]')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);


  const loadNotifications = async (userId: string) => {
    const { data: notificationsData, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && notificationsData) {
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.is_read).length);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
  .eq('user_id', (user as { id: string }).id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
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

  const getStatutBadge = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      approuvee: 'bg-green-100 text-green-800',
      verifiee: 'bg-green-100 text-green-800',
      rejetee: 'bg-red-100 text-red-800'
    };

    const labels = {
      en_attente: 'En attente',
      approuvee: 'Approuvée',
      verifiee: 'Vérifiée',
      rejetee: 'Rejetée'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image src="/logoDF.png" alt="Logo" width={32} height={32} style={{ height: '2rem', width: 'auto', marginRight: '1rem' }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord gestionnaire</h1>
                <p className="text-sm text-gray-600">Bienvenue, {(user as { email?: string })?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Bouton de notifications */}
              <div className="relative" data-notifications-dropdown>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 17h5l-3.5-3.5C16.18 12.32 16 11.18 16 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 1.18.18 2.32.5 3.5L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown des notifications */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucune notification
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                {notification.data?.review_note && (
                                  <p className="text-sm text-gray-500 mt-2 italic">
                                    Note: {notification.data.review_note}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.created_at ? new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : ''}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/gestionnaire/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Créer un établissement
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

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage('')}
                  className="inline-flex text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('propositions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'propositions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes demandes ({propositions.length})
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
            <button
              onClick={() => setActiveTab('etablissements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'etablissements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes établissements
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'propositions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Mes demandes de création</h2>
            </div>

            {propositions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première demande d&#39;établissement.</p>
                <div className="mt-6">
                  <Link
                    href="/gestionnaire/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Créer un établissement
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {propositions.map((proposition) => (
                  <div key={proposition.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {typeof proposition.payload === 'object' && proposition.payload !== null && 'nom' in proposition.payload ? (proposition.payload as Record<string, unknown>).nom as string : 'Établissement sans nom'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {typeof proposition.payload === 'object' && proposition.payload !== null && 'ville' in proposition.payload ? (proposition.payload as Record<string, unknown>).ville as string : ''} • Type: {typeof proposition.payload === 'object' && proposition.payload !== null && 'habitat_type' in proposition.payload && typeof (proposition.payload as Record<string, unknown>).habitat_type === 'string' ? ((proposition.payload as Record<string, unknown>).habitat_type as string).replace('_', ' ') : ''}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Demandé le {formatDate(proposition.created_at)}
                          </p>
                          {proposition.review_note && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>Commentaire admin:</strong> {proposition.review_note}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {getStatutBadge(proposition.statut)}
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Réclamations de propriété</h2>
              <Link
                href="/gestionnaire/claim"
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                + Réclamer un établissement
              </Link>
            </div>

            {reclamations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réclamation</h3>
                <p className="mt-1 text-sm text-gray-500">Vous n&#39;avez pas encore réclamé la propriété d&#39;un établissement.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reclamations.map((reclamation) => (
                  <div key={reclamation.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {reclamation.etablissement?.nom || 'Établissement'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {reclamation.etablissement?.ville}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Réclamé le {formatDate(reclamation.created_at)}
                          </p>
                          {reclamation.review_note && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>Commentaire admin:</strong> {reclamation.review_note}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {getStatutBadge(reclamation.statut)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'etablissements' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Mes établissements validés</h2>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Gérez vos établissements</h3>
              <p className="mt-1 text-sm text-gray-500">
                Consultez et gérez vos établissements validés sur une page dédiée.
              </p>
              <div className="mt-6">
                <Link
                  href="/gestionnaire/etablissements"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voir mes établissements
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}