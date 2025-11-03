
"use client";
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';

type ModificationDataType = {
  telephone: string;
  email: string;
  site_web: string;
  adresse_l1: string;
  adresse_l2: string;
  code_postal: string;
  commune: string;
  departement: string;
  habitat_type: string;
  sous_categories: string[];
  nouvelle_photo_data: { url: string; file: File } | null;
  logements_types: LogementType[];
  restauration: {
    kitchenette: boolean;
    resto_collectif_midi: boolean;
    resto_collectif: boolean;
    portage_repas: boolean;
  };
  services: string[];
  tarifications: TarificationType[];
  avp_infos?: {
    statut: 'intention' | 'en_projet' | 'ouvert';
    date_intention?: string;
    date_en_projet?: string;
    date_ouverture?: string;
    pvsp_fondamentaux?: {
      objectifs?: string;
      animation_vie_sociale?: string;
      gouvernance_partagee?: string;
      ouverture_au_quartier?: string;
      prevention_isolement?: string;
      participation_habitants?: string;
    };
    public_accueilli?: string;
    modalites_admission?: string;
    partenaires_principaux?: Array<{ nom: string; type?: string; description?: string }>;
    intervenants?: Array<{ nom: string; specialite?: string; contact?: string }>;
    heures_animation_semaine?: number;
    infos_complementaires?: string;
  };
};

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from '@/components/ImageUpload';
import DepartmentAutocomplete from '@/components/DepartmentAutocomplete';

interface LogementType {
  id?: string;
  libelle: string;
  surface_min: number | '';
  surface_max: number | '';
  meuble: boolean;
  pmr: boolean;
  domotique: boolean;
  plain_pied: boolean;
  nb_unites: number | '';
}
interface TarificationType {
  id?: string;
  periode: string;
  fourchette_prix: string;
  prix_min: number | '';
  prix_max: number | '';
  loyer_base: number | '';
  charges: number | '';
}
interface EtablissementData {
  id: string;
  nom: string;
  habitat_type: string;
  eligibilite_statut?: 'avp_eligible' | 'non_eligible' | 'a_verifier';
  telephone?: string;
  email?: string;
  site_web?: string;
  adresse_l1?: string;
  adresse_l2?: string;
  code_postal?: string;
  commune?: string;
  departement?: string;
  geom?: { coordinates: [number, number] };
  logements_types?: LogementType[];
  restaurations?: unknown[];
  services?: string[];
  tarifications?: TarificationType[];
  sous_categories?: string[];
  avp_infos?: unknown[];
}

interface ServiceOption {
  id: string;
  libelle: string;
}

interface SousCategorieOption {
  id: string;
  libelle: string;
}

function ModifierEtablissementPageContent() {
  const router = useRouter();
  
  // Récupération directe de l'URL parameter avec useSearchParams
  const searchParams = useSearchParams();
  const etablissementId = searchParams.get('etablissement') || '';
  
  const [etablissement, setEtablissement] = useState<EtablissementData | null>(null);
  const [servicesOptions, setServicesOptions] = useState<ServiceOption[]>([]);
  const [sousCategories, setSousCategories] = useState<SousCategorieOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('contact');
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    description: 'Modification complète des données de l&#39;établissement'
  });

  // Données de modification
  const [modificationData, setModificationData] = useState<ModificationDataType>({
    telephone: '',
    email: '',
    site_web: '',
    adresse_l1: '',
    adresse_l2: '',
    code_postal: '',
    commune: '',
    departement: '',
    habitat_type: '',
    sous_categories: [],
    nouvelle_photo_data: null,
    logements_types: [],
    restauration: {
      kitchenette: false,
      resto_collectif_midi: false,
      resto_collectif: false,
      portage_repas: false
    },
    services: [],
    tarifications: [],
    avp_infos: {
      statut: 'intention',
      pvsp_fondamentaux: {},
      partenaires_principaux: [],
      intervenants: []
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper pour mettre à jour les données AVP de manière type-safe
  const updateAvpInfos = (updates: Partial<NonNullable<ModificationDataType['avp_infos']>>) => {
    setModificationData(prev => ({
      ...prev,
      avp_infos: {
        statut: 'intention',
        pvsp_fondamentaux: {},
        partenaires_principaux: [],
        intervenants: [],
        ...prev.avp_infos,
        ...updates
      }
    }));
  };

  // Helper pour mettre à jour les PVSP
  const updatePvsp = (field: string, value: string) => {
    setModificationData(prev => ({
      ...prev,
      avp_infos: {
        statut: 'intention',
        partenaires_principaux: [],
        intervenants: [],
        ...prev.avp_infos,
        pvsp_fondamentaux: {
          ...prev.avp_infos?.pvsp_fondamentaux,
          [field]: value
        }
      }
    }));
  };

  // Charger les options (services et sous-catégories) au montage
  useEffect(() => {
    const loadOptionsData = async () => {
      try {
        console.log('🔄 Début du chargement des options...');
        setLoadingOptions(true);
        setOptionsError('');
        
        // Charger les services
        console.log('📡 Requête services: SELECT id, libelle FROM services ORDER BY libelle');
        const { data: servicesData, error: servicesError, count: servicesCount } = await supabase
          .from('services')
          .select('id, libelle', { count: 'exact' })
          .order('libelle');

        console.log('📋 Services - Count:', servicesCount, 'Data:', servicesData, 'Erreur:', servicesError);
        if (servicesError) {
          console.error('❌ Erreur services:', servicesError);
          setOptionsError(`Erreur services: ${servicesError.message}`);
        } else if (servicesData) {
          console.log('✅ Services chargés:', servicesData.slice(0, 3));
          setServicesOptions(servicesData);
        }

        // Charger les sous-catégories
        console.log('📡 Requête sous_categories: SELECT id, libelle FROM sous_categories ORDER BY libelle');
        const { data: sousCategoriesData, error: sousCategoriesError, count: scCount } = await supabase
          .from('sous_categories')
          .select('id, libelle', { count: 'exact' })
          .order('libelle');

        console.log('📋 Sous-catégories - Count:', scCount, 'Data:', sousCategoriesData, 'Erreur:', sousCategoriesError);
        if (sousCategoriesError) {
          console.error('❌ Erreur sous-catégories:', sousCategoriesError);
          setOptionsError(`Erreur sous-catégories: ${sousCategoriesError.message}`);
        } else if (sousCategoriesData) {
          console.log('✅ Sous-catégories chargées:', sousCategoriesData.slice(0, 3));
          setSousCategories(sousCategoriesData);
        }

        console.log('✅ Chargement des options terminé');
        setLoadingOptions(false);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des options:', error);
        setOptionsError(error instanceof Error ? error.message : 'Erreur inconnue');
        setLoadingOptions(false);
      }
    };

    loadOptionsData();
  }, []); // Seulement au montage du composant

  const loadEtablissementData = useCallback(async () => {
      console.log('Début chargement des données, etablissementId:', etablissementId);
    try {
        console.log('Connexion à Supabase...');
      
      // Requête principale pour l'établissement
      const { data: etab, error } = await supabase
        .from('etablissements')
        .select(`
          *,
          logements_types (*),
          restaurations (*),
          tarifications (*),
          avp_infos (*)
        `)
        .eq('id', etablissementId)
        .single();
        
      console.log('Résultat requête Supabase (établissement):', { etab, error });

      if (error) throw error;

      // Requêtes séparées pour les tables de jonction many-to-many
      const { data: servicesData, error: servicesError } = await supabase
        .from('etablissement_service')
        .select('service_id, services(id, libelle)')
        .eq('etablissement_id', etablissementId);
        
      console.log('Résultat requête services liés:', { servicesData, servicesError });

      const { data: sousCategoriesData, error: sousCategoriesError } = await supabase
        .from('etablissement_sous_categorie')
        .select('sous_categorie_id, sous_categories(id, libelle)')
        .eq('etablissement_id', etablissementId);
        
      console.log('Résultat requête sous-catégories liées:', { sousCategoriesData, sousCategoriesError });

      // Ajouter les données many-to-many à l'objet établissement
      etab.etablissement_service = servicesData || [];
      etab.etablissement_sous_categorie = sousCategoriesData || [];

      setEtablissement(etab);
      console.log('✅ Établissement chargé:', etab.nom);
      
      // Debug: afficher les services et sous-catégories liés
      const servicesLies = servicesData?.map((es: { service_id: string }) => es.service_id) || [];
      const sousCategoriesLiees = sousCategoriesData?.map((sc: { sous_categorie_id: string }) => sc.sous_categorie_id) || [];
      
      console.log('🔗 Services liés à l\'établissement:', servicesLies);
      console.log('🔗 Services complets:', servicesData);
      console.log('🔗 Sous-catégories liées:', sousCategoriesLiees);
      console.log('🔗 Sous-catégories complètes:', sousCategoriesData);
      
      // Pré-remplir les données de modification avec les valeurs actuelles
      setModificationData({
        telephone: etab.telephone || '',
        email: etab.email || '',
        site_web: etab.site_web || '',
        adresse_l1: etab.adresse_l1 || '',
        adresse_l2: etab.adresse_l2 || '',
        code_postal: etab.code_postal || '',
        commune: etab.commune || '',
        departement: etab.departement || '',
        habitat_type: etab.habitat_type || '',
        sous_categories: sousCategoriesLiees,
        nouvelle_photo_data: null, // Pas de pré-remplissage pour les nouvelles photos
        logements_types: etab.logements_types || [],
        restauration: etab.restaurations?.[0] || {
          kitchenette: false,
          resto_collectif_midi: false,
          resto_collectif: false,
          portage_repas: false
        },
        services: servicesLies,
        tarifications: etab.tarifications || [],
        avp_infos: etab.avp_infos?.[0] || {
          statut: 'intention',
          pvsp_fondamentaux: {},
          partenaires_principaux: [],
          intervenants: []
        }
      });
      
      console.log('📝 ModificationData.services défini à:', servicesLies);
      console.log('📝 ModificationData.sous_categories défini à:', sousCategoriesLiees);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Impossible de charger les données de l&#39;établissement');
    } finally {
      setLoading(false);
    }
  }, [etablissementId]);

  const addLogementType = () => {
    setModificationData((prev: ModificationDataType) => ({
      ...prev,
      logements_types: [
        ...prev.logements_types,
        {
          libelle: '',
          surface_min: '',
          surface_max: '',
          meuble: false,
          pmr: false,
          domotique: false,
          plain_pied: false,
          nb_unites: ''
        }
      ]
    }));
  };
  const removeLogementType = (index: number) => {
  setModificationData((prev: ModificationDataType) => ({
      ...prev,
      logements_types: prev.logements_types.filter((_: LogementType, i: number) => i !== index)
    }));
  };

  const updateLogementType = (index: number, field: string, value: string | number | boolean) => {
  setModificationData((prev: ModificationDataType) => ({
      ...prev,
      logements_types: prev.logements_types.map((item: LogementType, i: number) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addTarification = () => {
  setModificationData((prev: ModificationDataType) => ({
      ...prev,
      tarifications: [...prev.tarifications, {
        periode: '',
        fourchette_prix: '',
        prix_min: '',
        prix_max: '',
        loyer_base: '',
        charges: ''
      }]
    }));
  };

  const removeTarification = (index: number) => {
  setModificationData((prev: ModificationDataType) => ({
      ...prev,
      tarifications: prev.tarifications.filter((_: TarificationType, i: number) => i !== index)
    }));
  };

  const updateTarification = (index: number, field: string, value: string | number) => {
  setModificationData((prev: ModificationDataType) => ({
      ...prev,
      tarifications: prev.tarifications.map((item: TarificationType, i: number) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur de lecture du fichier'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convertir l&#39;image en base64 si elle existe
      let imageBase64 = null;
      if (modificationData.nouvelle_photo_data?.file) {
        imageBase64 = await convertImageToBase64(modificationData.nouvelle_photo_data.file);
      }

      // Utiliser la table propositions existante
      const { error: submitError } = await supabase
        .from('propositions')
        .insert([{
          etablissement_id: etablissementId,
          cible_id: etablissementId,
          type_cible: 'etablissement',
          action: 'update',
          source: 'public', // Proposition venant du public
          created_by: null, // Utilisateur non-authentifié
          payload: {
            // Informations du proposeur
            proposeur: {
              nom: formData.nom,
              email: formData.email,
              telephone: formData.telephone,
              description: formData.description
            },
            // Toutes les modifications structurées
            modifications: {
              ...modificationData,
              // Inclure l&#39;image en base64 si elle existe
              nouvelle_photo_base64: imageBase64,
              nouvelle_photo_filename: modificationData.nouvelle_photo_data?.file.name || null
            }
          },
          statut: 'en_attente'
        }]);

      if (submitError) {
        throw submitError;
      }

      setIsSubmitted(true);
  } catch (err) {
      console.error('Erreur lors de l&#39;envoi:', err);
  setError('Une erreur est survenue lors de l&#39;envoi de votre proposition. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'adresse', label: 'Adresse', icon: '📍' },
    { id: 'photo', label: 'Photo', icon: '📷' },
    { id: 'type', label: 'Type & Catégorie', icon: '🏠' },
    { id: 'logements', label: 'Logements', icon: '🛏️' },
    { id: 'restauration', label: 'Restauration', icon: '🍽️' },
    { id: 'services', label: 'Services', icon: '🔧' },
    { id: 'tarifs', label: 'Tarifs', icon: '💰' },
    ...(etablissement?.eligibilite_statut === 'avp_eligible' ? [{ id: 'avp', label: 'AVP', icon: '🏡' }] : [])
  ];

  useEffect(() => {
    console.log('🎯 useEffect établissement déclenché avec etablissementId:', etablissementId);
    if (etablissementId) {
      console.log('📞 Appel de loadEtablissementData');
      loadEtablissementData();
    } else {
      console.log('⚠️ Pas d\'etablissementId');
    }
  }, [etablissementId, loadEtablissementData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Établissement non trouvé</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Proposition envoyée !</h2>
          <p className="text-gray-600 mb-6">
            Votre proposition de modification a été transmise à notre équipe de modération. 
            Nous l&#39;examinerons dans les plus brefs délais.
          </p>
          <button 
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à la fiche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier l&#39;établissement
          </h1>
          <p className="text-lg text-gray-600">
            {etablissement.nom}
          </p>
          <p className="text-sm text-gray-500">
            Proposez des modifications pour cet établissement. Toutes les modifications passent par modération.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation des sections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations du proposeur */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos coordonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section Contact */}
              {activeSection === 'contact' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Informations de contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={modificationData.telephone}
                        onChange={(e) => setModificationData({...modificationData, telephone: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={etablissement.telephone || 'Non renseign&eacute;'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={modificationData.email}
                        onChange={(e) => setModificationData({...modificationData, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={etablissement.email || 'Non renseign&eacute;'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={modificationData.site_web}
                        onChange={(e) => setModificationData({...modificationData, site_web: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={etablissement.site_web || 'Non renseign&eacute;'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section Adresse */}
              {activeSection === 'adresse' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Adresse et localisation</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse ligne 1
                        </label>
                        <input
                          type="text"
                          value={modificationData.adresse_l1}
                          onChange={(e) => setModificationData({...modificationData, adresse_l1: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={etablissement.adresse_l1 || 'Non renseign&eacute;'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse ligne 2
                        </label>
                        <input
                          type="text"
                          value={modificationData.adresse_l2}
                          onChange={(e) => setModificationData({...modificationData, adresse_l2: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={etablissement.adresse_l2 || 'Non renseign&eacute;'}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          value={modificationData.code_postal}
                          onChange={(e) => setModificationData({...modificationData, code_postal: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={etablissement.code_postal || 'Non renseign&eacute;'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commune
                        </label>
                        <input
                          type="text"
                          value={modificationData.commune}
                          onChange={(e) => setModificationData({...modificationData, commune: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={etablissement.commune || 'Non renseign&eacute;'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Département
                        </label>
                        <DepartmentAutocomplete
                          value={modificationData.departement}
                          onChange={(value) => setModificationData({...modificationData, departement: value})}
                          placeholder={etablissement.departement || 'Non renseign&eacute;'}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Photo */}
              {activeSection === 'photo' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📷 Photo de l&#39;établissement</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposer une nouvelle photo
                      </label>
                      <p className="text-sm text-gray-500 mb-4">
                        Vous pouvez proposer une nouvelle photo pour remplacer ou compléter la photo actuelle de l&#39;établissement.
                      </p>
                      <ImageUpload
                        onImageSelected={(url, file) => setModificationData({
                          ...modificationData, 
                          nouvelle_photo_data: { url, file }
                        })}
                        maxSizeMB={5}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start space-x-2">
                        <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Informations importantes</h4>
                          <div className="mt-1 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Formats acceptés : JPG, PNG, WebP</li>
                              <li>Taille maximum : 5 MB</li>
                              <li>Privilégiez les photos de qualité et représentatives de l&#39;établissement</li>
                              <li>La photo proposée sera examinée avant validation</li>
                              <li>L&#39;image sera stockée temporairement avec votre proposition</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Type & Catégorie */}
              {activeSection === 'type' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Type d&#39;habitat et sous-catégorie</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d&#39;habitat
                      </label>
                      <select
                        value={modificationData.habitat_type}
                        onChange={(e) => setModificationData({...modificationData, habitat_type: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="logement_independant">Logement ind&eacute;pendant</option>
                        <option value="residence">Résidence</option>
                        <option value="habitat_partage">Habitat partag&eacute;</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Actuel : {etablissement.habitat_type || 'Non renseign&eacute;'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sous-catégories
                      </label>
                      {optionsError && (
                        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                          Erreur: {optionsError}
                        </div>
                      )}
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {loadingOptions ? (
                          <p className="text-sm text-gray-500 p-2">Chargement des sous-catégories...</p>
                        ) : sousCategories.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">Aucune sous-catégorie disponible</p>
                        ) : (
                          sousCategories.map(sc => (
                            <label key={sc.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={modificationData.sous_categories.includes(sc.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setModificationData({
                                      ...modificationData,
                                      sous_categories: [...modificationData.sous_categories, sc.id]
                                    });
                                  } else {
                                    setModificationData({
                                      ...modificationData,
                                      sous_categories: modificationData.sous_categories.filter(id => id !== sc.id)
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{sc.libelle}</span>
                            </label>
                          ))
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {modificationData.sous_categories.length} catégorie(s) sélectionnée(s)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Logements */}
              {activeSection === 'logements' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">🛏️ Types de logements</h3>
                    <button
                      type="button"
                      onClick={addLogementType}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                    >
                      + Ajouter un type
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {modificationData.logements_types.map((logement, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Type de logement #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeLogementType(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Libellé *
                            </label>
                            <input
                              type="text"
                              required
                              value={logement.libelle}
                              onChange={(e) => updateLogementType(index, 'libelle', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Studio, T2, T3..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Surface min (m²)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={logement.surface_min}
                              onChange={(e) => updateLogementType(index, 'surface_min', parseInt(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Surface max (m²)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={logement.surface_max}
                              onChange={(e) => updateLogementType(index, 'surface_max', parseInt(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre d&#39;unit&eacute;s
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={logement.nb_unites}
                              onChange={(e) => updateLogementType(index, 'nb_unites', parseInt(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Caractéristiques
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'meuble', label: 'Meublé' },
                                { key: 'pmr', label: 'PMR' },
                                { key: 'domotique', label: 'Domotique' },
                                { key: 'plain_pied', label: 'Plain-pied' }
                              ].map(char => (
                                <label key={char.key} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={logement[char.key as keyof typeof logement] as boolean}
                                    onChange={(e) => updateLogementType(index, char.key, e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm">{char.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {modificationData.logements_types.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        Aucun type de logement configur&eacute;. Cliquez sur &quot;Ajouter un type&quot; pour commencer.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section Restauration */}
              {activeSection === 'restauration' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Services de restauration</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'kitchenette', label: 'Kitchenette' },
                      { key: 'resto_collectif_midi', label: 'Restaurant collectif (midi)' },
                      { key: 'resto_collectif', label: 'Restaurant collectif (soir)' },
                      { key: 'portage_repas', label: 'Portage de repas' }
                    ].map(option => (
                      <label key={option.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={modificationData.restauration[option.key as keyof typeof modificationData.restauration]}
                          onChange={(e) => setModificationData({
                            ...modificationData,
                            restauration: {
                              ...modificationData.restauration,
                              [option.key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Services */}
              {activeSection === 'services' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Services proposés</h3>
                  {optionsError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      Erreur: {optionsError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {loadingOptions ? (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-sm text-gray-500">Chargement des services...</p>
                      </div>
                    ) : servicesOptions.length === 0 ? (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-sm text-gray-500">Aucun service disponible</p>
                      </div>
                    ) : (
                      servicesOptions.map(service => (
                        <label key={service.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={modificationData.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setModificationData({
                                  ...modificationData,
                                  services: [...modificationData.services, service.id]
                                });
                              } else {
                                setModificationData({
                                  ...modificationData,
                                  services: modificationData.services.filter(id => id !== service.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{service.libelle.replace(/'/g, "&#39;").replace(/"/g, "&quot;")}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    {modificationData.services.length} service(s) sélectionné(s)
                  </p>
                </div>
              )}

              {/* Section Tarifs */}
              {activeSection === 'tarifs' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">💰 Tarifications</h3>
                    <button
                      type="button"
                      onClick={addTarification}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                    >
                      + Ajouter un tarif
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {modificationData.tarifications.map((tarif, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Tarif #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTarification(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Période
                            </label>
                            <input
                              type="text"
                              value={tarif.periode}
                              onChange={(e) => updateTarification(index, 'periode', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: mensuel, journalier..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fourchette de prix
                            </label>
                            <select
                              value={tarif.fourchette_prix}
                              onChange={(e) => updateTarification(index, 'fourchette_prix', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Sélectionner</option>
                              <option value="euro">€</option>
                              <option value="deux_euros">€€</option>
                              <option value="trois_euros">€€€</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix minimum (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tarif.prix_min}
                              onChange={(e) => updateTarification(index, 'prix_min', parseFloat(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix maximum (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tarif.prix_max}
                              onChange={(e) => updateTarification(index, 'prix_max', parseFloat(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Loyer de base (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tarif.loyer_base}
                              onChange={(e) => updateTarification(index, 'loyer_base', parseFloat(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Charges (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tarif.charges}
                              onChange={(e) => updateTarification(index, 'charges', parseFloat(e.target.value) || '')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {modificationData.tarifications.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        Aucun tarif configur&eacute;. Cliquez sur &quot;Ajouter un tarif&quot; pour commencer.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section AVP - Appartement de Coordination */}
              {activeSection === 'avp' && etablissement?.eligibilite_statut === 'avp_eligible' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏡 Appartement de Coordination (AVP)</h3>
                  
                  <div className="space-y-6">
                    {/* Statut AVP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut du projet AVP
                      </label>
                      <select
                        value={modificationData.avp_infos?.statut || 'intention'}
                        onChange={(e) => updateAvpInfos({ 
                          statut: e.target.value as 'intention' | 'en_projet' | 'ouvert'
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="intention">Projet en intention</option>
                        <option value="en_projet">Projet en cours</option>
                        <option value="ouvert">Ouvert et fonctionnel</option>
                      </select>
                    </div>

                    {/* Dates importantes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d&apos;intention
                        </label>
                        <input
                          type="date"
                          value={modificationData.avp_infos?.date_intention || ''}
                          onChange={(e) => updateAvpInfos({ date_intention: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de mise en projet
                        </label>
                        <input
                          type="date"
                          value={modificationData.avp_infos?.date_en_projet || ''}
                          onChange={(e) => updateAvpInfos({ date_en_projet: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d&apos;ouverture
                        </label>
                        <input
                          type="date"
                          value={modificationData.avp_infos?.date_ouverture || ''}
                          onChange={(e) => updateAvpInfos({ date_ouverture: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* PVSP - Projet de Vie Sociale Partagée */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Projet de Vie Sociale Partagée (PVSP)</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'objectifs', label: 'Objectifs et finalités' },
                          { key: 'animation_vie_sociale', label: 'Animation de la vie sociale' },
                          { key: 'gouvernance_partagee', label: 'Gouvernance partagée' },
                          { key: 'ouverture_au_quartier', label: 'Ouverture au quartier' },
                          { key: 'prevention_isolement', label: 'Prévention de l&apos;isolement' },
                          { key: 'participation_habitants', label: 'Participation des habitants' }
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                            </label>
                            <textarea
                              rows={3}
                              value={modificationData.avp_infos?.pvsp_fondamentaux?.[field.key as keyof typeof modificationData.avp_infos.pvsp_fondamentaux] || ''}
                              onChange={(e) => updatePvsp(field.key, e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Décrivez ${field.label.toLowerCase()}...`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Public accueilli */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Public accueilli
                      </label>
                      <textarea
                        rows={3}
                        value={modificationData.avp_infos?.public_accueilli || ''}
                        onChange={(e) => updateAvpInfos({ public_accueilli: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez le public cible de l'AVP..."
                      />
                    </div>

                    {/* Modalités d'admission */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modalités d&apos;admission
                      </label>
                      <textarea
                        rows={3}
                        value={modificationData.avp_infos?.modalites_admission || ''}
                        onChange={(e) => updateAvpInfos({ modalites_admission: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez les modalités d&apos;admission..."
                      />
                    </div>

                    {/* Heures d'animation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heures d&apos;animation par semaine
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={modificationData.avp_infos?.heures_animation_semaine || ''}
                        onChange={(e) => updateAvpInfos({ 
                          heures_animation_semaine: parseFloat(e.target.value) || undefined 
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 10.5"
                      />
                    </div>

                    {/* Informations complémentaires */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Informations complémentaires
                      </label>
                      <textarea
                        rows={4}
                        value={modificationData.avp_infos?.infos_complementaires || ''}
                        onChange={(e) => updateAvpInfos({ infos_complementaires: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ajoutez toute information complémentaire sur l&apos;AVP..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons de soumission */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer la proposition'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModifierEtablissementPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ModifierEtablissementPageContent />
    </Suspense>
  );
}