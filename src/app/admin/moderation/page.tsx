"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEtablissementFromProposition as helperCreateEtablissement } from '@/lib/create-etablissement-helper';

interface Proposition {
  id: string;
  type_cible: string;
  action: string;
  statut: 'en_attente' | 'approuvee' | 'rejetee';
  etablissement_id?: string;
  source?: string;
  payload: Record<string, unknown>; // Type sûr pour les objets génériques
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
  created_by?: string;
  profiles?: {
    nom: string;
    prenom: string;
    email: string;
    organisation?: string;
  } | null;
  etablissement?: {
    id: string;
    nom: string;
  } | null;
}

interface ReclamationPropriete {
  id: string;
  etablissement_id: string;
  user_id?: string;
  statut: 'en_attente' | 'approuvee' | 'rejetee';
  justificatifs?: string[];
  commentaire?: string;
  note_moderation?: string;
  created_at: string;
  created_by?: string;
  etablissement?: {
    nom: string;
    commune?: string;
  } | null;
  profiles?: {
    nom: string;
    prenom: string;
    email: string;
    organisation?: string;
  } | null;
}

export default function ModerationDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [reclamations, setReclamations] = useState<ReclamationPropriete[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'propositions' | 'reclamations'>('propositions');
  const [selectedItem, setSelectedItem] = useState<
    (Proposition & { type: 'proposition' }) | (ReclamationPropriete & { type: 'reclamation' }) | null
  >(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [etablissementName, setEtablissementName] = useState<string>('');
  const [etablissementData, setEtablissementData] = useState<Record<string, unknown> | null>(null);
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
      await loadData();
    };

    checkAuth();
  }, [router]);

  // Logger quand selectedItem change et charger le nom de l'établissement
  useEffect(() => {
    if (selectedItem) {
      console.log('🔍 Modal ouvert - selectedItem:', JSON.stringify(selectedItem, null, 2));
      console.log('🔍 Modal - type:', selectedItem.type);
      if (selectedItem.type === 'proposition') {
        console.log('🔍 Modal - action:', selectedItem.action);
        console.log('🔍 Modal - payload:', selectedItem.payload);
        console.log('🔍 Modal - etablissement_id:', selectedItem.etablissement_id);
        
        // Charger les données complètes de l'établissement si c'est une modification
        if (selectedItem.action === 'update' && selectedItem.etablissement_id) {
          const fetchEtablissementData = async () => {
            // Charger les données de base de l'établissement
            const { data, error } = await supabase
              .from('etablissements')
              .select('*')
              .eq('id', selectedItem.etablissement_id)
              .single();
            
            if (data && !error) {
              // Charger les services liés
              const { data: servicesData } = await supabase
                .from('etablissement_service')
                .select('service_id')
                .eq('etablissement_id', selectedItem.etablissement_id);
              
              // Charger les sous-catégories liées
              const { data: sousCategoriesData } = await supabase
                .from('etablissement_sous_categorie')
                .select('sous_categorie_id')
                .eq('etablissement_id', selectedItem.etablissement_id);
              
              // Charger la restauration
              const { data: restaurationData } = await supabase
                .from('restaurations')
                .select('*')
                .eq('etablissement_id', selectedItem.etablissement_id)
                .single();
              
              // Charger les tarifications
              const { data: tarificationsData } = await supabase
                .from('tarifications')
                .select('*')
                .eq('etablissement_id', selectedItem.etablissement_id);
              
              // Charger les types de logements
              const { data: logementsData } = await supabase
                .from('logements_types')
                .select('*')
                .eq('etablissement_id', selectedItem.etablissement_id);
              
              // Charger la photo principale (priorité la plus haute)
              const { data: photoData } = await supabase
                .from('medias')
                .select('storage_path')
                .eq('etablissement_id', selectedItem.etablissement_id)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              // Enrichir les données avec toutes les tables liées
              const enrichedData = {
                ...data,
                services: servicesData?.map(s => s.service_id) || [],
                sous_categories: sousCategoriesData?.map(sc => sc.sous_categorie_id) || [],
                restauration: restaurationData || null,
                tarifications: tarificationsData || [],
                logements_types: logementsData || [],
                photo_actuelle: photoData?.storage_path || null
              };
              
              setEtablissementName(data.nom);
              setEtablissementData(enrichedData);
              console.log('📊 Données établissement chargées:', enrichedData);
              console.log('🔧 Services actuels:', enrichedData.services);
              console.log('🏷️ Sous-catégories actuelles:', enrichedData.sous_categories);
              console.log('🍽️ Restauration actuelle:', enrichedData.restauration);
              console.log('💰 Tarifications actuelles:', enrichedData.tarifications);
              console.log('🏠 Logements actuels:', enrichedData.logements_types);
            } else {
              setEtablissementName('Établissement inconnu');
              setEtablissementData(null);
            }
          };
          fetchEtablissementData();
        } else {
          setEtablissementName('');
          setEtablissementData(null);
        }
      }
    } else {
      setEtablissementName('');
      setEtablissementData(null);
    }
  }, [selectedItem]);

  const loadData = async () => {
    try {
      console.log('🔄 Chargement des données de modération...');
      
      // Charger les propositions
      const { data: proposDataSimple, error: proposErrorSimple } = await supabase
        .from('propositions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📋 Propositions:', proposDataSimple?.length || 0, 'Erreur:', proposErrorSimple);

      if (proposDataSimple && proposDataSimple.length > 0) {
        // Récupérer les IDs uniques de created_by qui ne sont pas null
        const userIds = [...new Set(
          proposDataSimple
            .map(p => p.created_by)
            .filter(id => id !== null)
        )];

        console.log('👥 Chargement des profils pour les IDs:', userIds);

        // Récupérer les IDs uniques d'établissements pour les propositions UPDATE
        const proposEtabIds = [...new Set(
          proposDataSimple
            .filter(p => p.action === 'update' && p.etablissement_id)
            .map(p => p.etablissement_id)
            .filter(id => id !== null)
        )];

        console.log('🏢 Chargement des établissements pour propositions:', proposEtabIds);

        // Charger les profils correspondants
        const profilesMap: Record<string, { nom: string; prenom: string; email: string; organisation?: string }> = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nom, prenom, email, organisation')
            .in('id', userIds);

          console.log('� Profils chargés:', profilesData?.length || 0, 'Erreur:', profilesError);

          if (profilesData) {
            // Créer un map id -> profile
            Object.assign(profilesMap, Object.fromEntries(
              profilesData.map(p => [p.id, p])
            ));
          }
        }

        // Charger les noms des établissements pour les propositions UPDATE
        const proposEtabMap: Record<string, { nom: string }> = {};
        if (proposEtabIds.length > 0) {
          const { data: etabData } = await supabase
            .from('etablissements')
            .select('id, nom')
            .in('id', proposEtabIds);

          console.log('🏢 Établissements chargés:', etabData?.length || 0);

          if (etabData) {
            Object.assign(proposEtabMap, Object.fromEntries(
              etabData.map(e => [e.id, e])
            ));
          }
        }

        // Enrichir les propositions avec les profils et noms d'établissements
        const enrichedPropositions = proposDataSimple.map(prop => ({
          ...prop,
          profiles: prop.created_by ? profilesMap[prop.created_by] || null : null,
          etablissement: prop.etablissement_id ? proposEtabMap[prop.etablissement_id] || null : null
        }));

        console.log('✅ Propositions enrichies avec profils et établissements');
        setPropositions(enrichedPropositions);
      } else {
        setPropositions([]);
      }

      // Charger les réclamations
      const { data: reclamData, error: reclamError } = await supabase
        .from('reclamations_propriete')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🏢 Réclamations trouvées:', reclamData?.length || 0, 'Erreur:', reclamError);
      
      if (reclamData && reclamData.length > 0) {
        // Récupérer les IDs uniques des utilisateurs et des établissements
        const reclamUserIds = [...new Set(
          reclamData.map(r => r.user_id).filter(id => id !== null)
        )];
        const etablissementIds = [...new Set(
          reclamData.map(r => r.etablissement_id).filter(id => id !== null)
        )];

        console.log('� Chargement des profils pour réclamations:', reclamUserIds);
        console.log('🏢 Chargement des établissements:', etablissementIds);

        // Charger les profils
        const reclamProfilesMap: Record<string, { nom: string; prenom: string; email: string; organisation?: string }> = {};
        if (reclamUserIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, nom, prenom, email, organisation')
            .in('id', reclamUserIds);

          if (profilesData) {
            Object.assign(reclamProfilesMap, Object.fromEntries(
              profilesData.map(p => [p.id, p])
            ));
          }
        }

        // Charger les établissements
        const etablissementsMap: Record<string, { nom: string; commune?: string }> = {};
        if (etablissementIds.length > 0) {
          const { data: etabData } = await supabase
            .from('etablissements')
            .select('id, nom, commune')
            .in('id', etablissementIds);

          if (etabData) {
            Object.assign(etablissementsMap, Object.fromEntries(
              etabData.map(e => [e.id, e])
            ));
          }
        }

        // Enrichir les réclamations
        const enrichedReclamations = reclamData.map(reclam => ({
          ...reclam,
          profiles: reclam.user_id ? reclamProfilesMap[reclam.user_id] || null : null,
          etablissement: reclam.etablissement_id ? etablissementsMap[reclam.etablissement_id] || null : null
        }));

        console.log('✅ Réclamations enrichies avec profils et établissements');
        setReclamations(enrichedReclamations);
      } else {
        setReclamations([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (itemId: string, action: 'approuvee' | 'rejetee', type: 'proposition' | 'reclamation') => {
    setActionLoading(true);
    try {
      console.log('🔍 Action reçue:', action);
      console.log('🔍 Type:', typeof action);
      
      const updateData = {
        statut: action,
        review_note: reviewNote || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null
      };
      
      console.log('📤 Données à envoyer:', updateData);

      if (type === 'proposition') {
        const { error } = await supabase
          .from('propositions')
          .update(updateData)
          .eq('id', itemId);

        if (error) throw error;

        // Si approuvée et action=create, créer l'établissement
        if (action === 'approuvee') {
          const proposition = propositions.find(p => p.id === itemId);
          if (proposition?.action === 'create') {
            await createEtablissementFromProposition(proposition);
          } else if (proposition?.action === 'update') {
            await updateEtablissementFromProposition(proposition);
          }
        }
      } else {
        // Pour les réclamations, utiliser les colonnes correctes
        const reclamationUpdateData = {
          statut: action,
          note_moderation: reviewNote || null
        };
        
        const { error } = await supabase
          .from('reclamations_propriete')
          .update(reclamationUpdateData)
          .eq('id', itemId);

        if (error) throw error;
      }

      // Recharger les données
      await loadData();
      setSelectedItem(null);
      setReviewNote('');
    } catch (error) {
      console.error('❌ Erreur complète lors de la modération:', error);
      console.error('❌ Type d\'erreur:', typeof error);
      console.error('❌ Détails:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Meilleure gestion de l'affichage de l'erreur
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Si c'est un objet Supabase error
        const supabaseError = error as { message?: string; details?: string; hint?: string; code?: string };
        errorMessage = supabaseError.message || JSON.stringify(error);
        if (supabaseError.details) errorMessage += `\nDétails: ${supabaseError.details}`;
        if (supabaseError.hint) errorMessage += `\nSuggestion: ${supabaseError.hint}`;
        if (supabaseError.code) errorMessage += `\nCode: ${supabaseError.code}`;
      }
      
      alert('Erreur lors de la mise à jour:\n' + errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const createEtablissementFromProposition = async (proposition: Proposition) => {
    try {
      // ✅ Utiliser le helper centralisé qui gère:
      // - image_path (photo principale)
      // - Création automatique dans medias
      // - Sous-catégories avec UUIDs
      // - Géolocalisation PostGIS
      // - Tous les champs normalisés
      const result = await helperCreateEtablissement(
        proposition.payload as Record<string, unknown>,
        proposition.created_by,
        supabase as any
      );

      if (!result.success) {
        throw new Error(result.error || 'Erreur création établissement');
      }

      console.log('✅ Établissement créé:', result.etablissement_id);
      console.log('📊 Détails:', result.details);

      // Mettre à jour la proposition avec l'ID de l'établissement créé
      await supabase
        .from('propositions')
        .update({ etablissement_id: result.etablissement_id })
        .eq('id', proposition.id);

    } catch (error) {
      console.error('❌ Erreur création établissement:', error);
      throw error;
    }
  };

  const updateEtablissementFromProposition = async (proposition: Proposition) => {
    try {
      if (!proposition.etablissement_id) {
        throw new Error('ID d\'établissement manquant');
      }

      const modifications = (proposition.payload?.modifications || {}) as Record<string, unknown>;
      console.log('🔄 Application des modifications:', modifications);
      console.log('📝 Établissement ID:', proposition.etablissement_id);

      // 1. Mettre à jour les champs de la table etablissements
      const etablissementUpdates: Record<string, unknown> = {};
      const fieldsToUpdate = ['nom', 'adresse_l1', 'adresse_l2', 'code_postal', 'commune', 
                              'departement', 'telephone', 'email', 'site_web', 'habitat_type',
                              'presentation', 'public_cible', 'gestionnaire'];
      
      fieldsToUpdate.forEach(field => {
        if (modifications[field] !== undefined) {
          etablissementUpdates[field] = modifications[field];
        }
      });

      if (Object.keys(etablissementUpdates).length > 0) {
        console.log('📤 Envoi des mises à jour:', etablissementUpdates);
        const { error: updateError } = await supabase
          .from('etablissements')
          .update(etablissementUpdates)
          .eq('id', proposition.etablissement_id);
        
        if (updateError) {
          console.error('❌ Erreur mise à jour établissement:', updateError);
          throw new Error(`Erreur mise à jour établissement: ${updateError.message}`);
        }
        console.log('✅ Établissement mis à jour:', etablissementUpdates);
      }

      // 2. Mettre à jour les services
      if (modifications.services && Array.isArray(modifications.services)) {
        // Supprimer les anciens services
        await supabase
          .from('etablissement_service')
          .delete()
          .eq('etablissement_id', proposition.etablissement_id);
        
        // Insérer les nouveaux services
        if (modifications.services.length > 0) {
          const servicesData = modifications.services.map((serviceId: string) => ({
            etablissement_id: proposition.etablissement_id,
            service_id: serviceId
          }));
          await supabase
            .from('etablissement_service')
            .insert(servicesData);
        }
        console.log('✅ Services mis à jour:', modifications.services.length);
      }

      // 3. Mettre à jour les sous-catégories
      if (modifications.sous_categories && Array.isArray(modifications.sous_categories)) {
        // Supprimer les anciennes sous-catégories
        await supabase
          .from('etablissement_sous_categorie')
          .delete()
          .eq('etablissement_id', proposition.etablissement_id);
        
        // Insérer les nouvelles sous-catégories
        if (modifications.sous_categories.length > 0) {
          const sousCategoriesData = modifications.sous_categories.map((scId: string) => ({
            etablissement_id: proposition.etablissement_id,
            sous_categorie_id: scId
          }));
          await supabase
            .from('etablissement_sous_categorie')
            .insert(sousCategoriesData);
        }
        console.log('✅ Sous-catégories mises à jour:', modifications.sous_categories.length);
      }

      // 4. Mettre à jour la restauration
      if (modifications.restauration) {
        const { data: existingRestau } = await supabase
          .from('restaurations')
          .select('id')
          .eq('etablissement_id', proposition.etablissement_id)
          .single();
        
        if (existingRestau) {
          // Mise à jour
          await supabase
            .from('restaurations')
            .update(modifications.restauration)
            .eq('etablissement_id', proposition.etablissement_id);
        } else {
          // Création
          await supabase
            .from('restaurations')
            .insert({
              etablissement_id: proposition.etablissement_id,
              ...modifications.restauration
            });
        }
        console.log('✅ Restauration mise à jour');
      }

      // 5. Gérer la nouvelle photo si présente
      if (modifications.nouvelle_photo_base64 && modifications.nouvelle_photo_filename) {
        console.log('📸 Upload de la nouvelle photo...');
        
        const photoBase64 = modifications.nouvelle_photo_base64 as string;
        const photoFilename = modifications.nouvelle_photo_filename as string;
        
        // Convertir base64 en blob
        const base64Data = photoBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        // Générer un nom de fichier unique
        const fileExt = photoFilename.split('.').pop();
        const fileName = `${proposition.etablissement_id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('etablissements-photos')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false
          });
        
        if (uploadError) {
          console.error('❌ Erreur upload photo:', uploadError);
        } else {
          // Créer l'entrée dans la table medias
          const { error: mediaError } = await supabase
            .from('medias')
            .insert({
              etablissement_id: proposition.etablissement_id,
              storage_path: filePath,
              priority: 1000, // Haute priorité pour être la photo principale
              alt_text: `Photo de ${etablissementUpdates.nom || 'l\'établissement'}`
            });
          
          if (mediaError) {
            console.error('❌ Erreur création média:', mediaError);
          } else {
            console.log('✅ Photo uploadée et enregistrée:', filePath);
          }
        }
      }

      console.log('✅ Toutes les modifications ont été appliquées');
    } catch (error) {
      console.error('❌ Erreur complète dans updateEtablissementFromProposition:', error);
      console.error('❌ Type d\'erreur:', typeof error);
      console.error('❌ Erreur stringifiée:', JSON.stringify(error, null, 2));
      throw error;
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

  // Fonction pour formater une valeur de manière lisible
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '(vide)';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (Array.isArray(value)) return `${value.length} élément(s)`;
    if (typeof value === 'object') {
      // Pour les objets de restauration, afficher toutes les options avec leur statut
      const objValue = value as Record<string, unknown>;
      if ('kitchenette' in objValue || 'resto_collectif' in objValue) {
        const labels: Record<string, string> = {
          kitchenette: 'Kitchenette',
          resto_collectif: 'Resto collectif',
          resto_collectif_midi: 'Resto collectif midi',
          portage_repas: 'Portage repas'
        };
        const options = Object.entries(objValue)
          .filter(([key]) => key in labels)
          .map(([key, val]) => `${labels[key]}: ${val ? '✓' : '✗'}`)
          .join(', ');
        return options || 'Aucune donnée';
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Fonction pour obtenir le libellé français d'un champ
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      nom: 'Nom',
      adresse_l1: 'Adresse ligne 1',
      adresse_l2: 'Adresse ligne 2',
      code_postal: 'Code postal',
      commune: 'Commune',
      departement: 'Département',
      telephone: 'Téléphone',
      email: 'Email',
      site_web: 'Site web',
      habitat_type: 'Type d\'habitat',
      services: 'Services',
      sous_categories: 'Sous-catégories',
      restauration: 'Restauration',
      tarifications: 'Tarifications',
      logements_types: 'Types de logements',
      presentation: 'Présentation',
      public_cible: 'Public cible',
      gestionnaire: 'Gestionnaire'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatutBadge = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approuvee: 'bg-green-100 text-green-800 border-green-200',
      rejetee: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      en_attente: 'En attente',
      approuvee: 'Approuvée',
      rejetee: 'Rejetée'
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
                      {propositions.filter(p => p.statut === 'approuvee').length}
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
              Propositions d&apos;établissements ({propositions.length})
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
                <p className="mt-1 text-sm text-gray-500">Aucune proposition d&apos;établissement en attente.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {propositions.map((proposition) => {
                  // Déterminer si c'est une proposition CREATE ou UPDATE
                  const isUpdate = proposition.action === 'update';
                  const proposeur = proposition.payload?.proposeur as Record<string, unknown> | undefined;
                  const data = (isUpdate ? proposition.payload?.modifications : proposition.payload) as Record<string, unknown> | undefined;
                  
                  return (
                  <div key={proposition.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {isUpdate ? (
                                <>Modification : {proposition.etablissement?.nom || proposition.etablissement_id || 'Établissement'}</>
                              ) : (
                                typeof data?.nom === 'string' ? data.nom : 'Établissement sans nom'
                              )}
                            </h3>
                            {getStatutBadge(proposition.statut)}
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              isUpdate ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {isUpdate ? 'Modification' : 'Création'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              {!isUpdate && (
                                <>
                                  <p className="text-sm text-gray-600">
                                    <strong>Adresse:</strong> {typeof data?.adresse === 'string' ? data.adresse : ''}, {typeof data?.code_postal === 'string' ? data.code_postal : ''} {typeof data?.ville === 'string' ? data.ville : ''}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Type:</strong> {typeof data?.habitat_type === 'string' ? data.habitat_type.replace('_', ' ') : ''}
                                  </p>
                                </>
                              )}
                              <p className="text-sm text-gray-600">
                                <strong>Action:</strong> {proposition.action}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Source:</strong> {proposition.source}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Demandeur:</strong> {
                                  (proposeur?.nom as string) || 
                                  (proposition.profiles ? `${proposition.profiles.prenom || ''} ${proposition.profiles.nom || ''}`.trim() : '') ||
                                  'Anonyme'
                                }
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {(proposeur?.email as string) || proposition.profiles?.email || 'Non renseigné'}
                              </p>
                              {(proposeur?.telephone || proposition.profiles?.organisation) && (
                                <p className="text-sm text-gray-600">
                                  <strong>{proposeur?.telephone ? 'Téléphone' : 'Organisation'}:</strong> {(proposeur?.telephone as string) || proposition.profiles?.organisation}
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
                )})}
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
                                <strong>Commune:</strong> {reclamation.etablissement?.commune}
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

                          {reclamation.note_moderation && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md border">
                              <p className="text-sm text-gray-700">
                                <strong>Note de modération:</strong> {reclamation.note_moderation}
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
            {/* Fond gris semi-transparent */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setSelectedItem(null)}
              aria-hidden="true"
            ></div>

            {/* Espacement pour centrer */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Contenu du modal - doit être au-dessus du fond */}
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 z-10">
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
                        ? selectedItem.action === 'update'
                          ? `Proposition de modification pour: ${etablissementName || 'Chargement...'}`
                          : `Proposition de création: ${((selectedItem.payload as Record<string, unknown>)?.nom as string) || 'Établissement sans nom'}`
                        : `Réclamation pour: ${selectedItem.etablissement?.nom || 'Établissement'}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de la proposition/réclamation */}
              {selectedItem.type === 'proposition' && (
                <div className="mt-4 space-y-4">
                  {/* Informations générales */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Informations générales</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Action:</strong> {selectedItem.action === 'create' ? 'Création' : 'Modification'}</p>
                      <p><strong>Source:</strong> {String((selectedItem as Proposition).source || 'Non renseigné')}</p>
                      <p><strong>Date:</strong> {formatDate(selectedItem.created_at)}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(selectedItem.payload as any)?.proposeur && (
                        <>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <p><strong>Proposeur:</strong> {String((selectedItem.payload as any).proposeur.nom || 'Anonyme')}</p>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <p><strong>Email:</strong> {String((selectedItem.payload as any).proposeur.email || 'Non renseigné')}</p>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(selectedItem.payload as any).proposeur.telephone && (
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            <p><strong>Téléphone:</strong> {String((selectedItem.payload as any).proposeur.telephone)}</p>
                          )}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(selectedItem.payload as any).proposeur.description && (
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            <p><strong>Description:</strong> {String((selectedItem.payload as any).proposeur.description)}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Photos (si une nouvelle photo est proposée ou s'il y a une photo actuelle) */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(((selectedItem.payload as any)?.nouvelle_photo_base64 as string | undefined) || etablissementData?.photo_actuelle) && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-purple-900 mb-3">Photos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Photo actuelle */}
                        {etablissementData?.photo_actuelle && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Photo actuelle</p>
                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/etablissements-photos/${etablissementData.photo_actuelle}`}
                                alt="Photo actuelle"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Nouvelle photo proposée */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any)?.nouvelle_photo_base64 && (
                          <div>
                            <p className="text-sm font-semibold text-green-700 mb-2">
                              Nouvelle photo proposée
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(selectedItem.payload as any)?.nouvelle_photo_filename && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  ({String((selectedItem.payload as any).nouvelle_photo_filename)})
                                </span>
                              )}
                            </p>
                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-green-500">
                              <img
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                src={String((selectedItem.payload as any).nouvelle_photo_base64)}
                                alt="Nouvelle photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Message si pas de photo actuelle */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {!etablissementData?.photo_actuelle && ((selectedItem.payload as any)?.nouvelle_photo_base64 as string | undefined) && (
                          <div className="flex items-center justify-center aspect-video bg-gray-100 rounded-lg">
                            <p className="text-gray-500 text-sm">Aucune photo actuellement</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Modifications proposées (pour les UPDATE) */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {selectedItem.action === 'update' && (selectedItem.payload as any)?.modifications && (
                    <div className="bg-blue-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">
                        {etablissementData ? 'Comparaison avant/après' : 'Modifications proposées (chargement...)'}
                      </h4>
                      <div className="space-y-3 text-sm">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Object.entries((selectedItem.payload as any).modifications as Record<string, unknown>).map(([key, newValue]) => {
                          // Ignorer les champs techniques ou vides
                          if (key.includes('nouvelle_photo') || key === 'avp_infos') return null;
                          
                          // Valeur actuelle de l'établissement
                          const currentValue = etablissementData ? (etablissementData as Record<string, unknown>)[key] : null;
                          
                          // Vérifier si la valeur a vraiment changé
                          const hasChanged = etablissementData && JSON.stringify(currentValue) !== JSON.stringify(newValue);
                          
                          return (
                            <div key={key} className={`border-l-4 ${hasChanged ? 'border-orange-400 bg-orange-50' : 'border-blue-200'} pl-3 py-2`}>
                              <p className="font-semibold text-gray-900">
                                {getFieldLabel(key)}
                              </p>
                              
                              {etablissementData && (
                                <div className="mt-1 space-y-1">
                                  {/* Valeur actuelle */}
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-600 font-medium min-w-[60px]">Avant:</span>
                                    <span className="text-gray-700 line-through">
                                      {String(formatValue(currentValue))}
                                    </span>
                                  </div>
                                  
                                  {/* Nouvelle valeur */}
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-medium min-w-[60px]">Après:</span>
                                    <span className="text-gray-900 font-medium">
                                      {String(formatValue(newValue))}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {!etablissementData && (
                                <p className="text-gray-700 mt-1">
                                  {String(formatValue(newValue))}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Données de création (pour les CREATE) */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {selectedItem.action === 'create' && (selectedItem.payload as any) && (
                    <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <h4 className="text-sm font-semibold text-green-900 mb-3">Données de l&apos;établissement</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any).nom && <p><strong>Nom:</strong> {String((selectedItem.payload as any).nom)}</p>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any).adresse && <p><strong>Adresse:</strong> {String((selectedItem.payload as any).adresse)}</p>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any).code_postal && <p><strong>Code postal:</strong> {String((selectedItem.payload as any).code_postal)}</p>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any).ville && <p><strong>Ville:</strong> {String((selectedItem.payload as any).ville)}</p>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(selectedItem.payload as any).habitat_type && <p><strong>Type:</strong> {String((selectedItem.payload as any).habitat_type)}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  onClick={() => handleAction(selectedItem.id, 'approuvee', selectedItem.type)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:bg-gray-400"
                >
                  {actionLoading ? 'En cours...' : 'Approuver'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedItem.id, 'rejetee', selectedItem.type)}
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