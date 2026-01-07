"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import ImageUpload from '@/components/ImageUpload';
import DepartmentAutocomplete from '@/components/DepartmentAutocomplete';
import { HABITAT_TAXONOMY } from '@/lib/habitatTaxonomy';

interface FormData {
  nom: string;
  presentation: string;
  adresse: string;
  ville: string;
  code_postal: string;
  departement: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  site_web?: string;
  habitat_type: string; // Utilise les clés de HABITAT_TAXONOMY
  sous_categories: string[];
  capacite_totale?: number;
  prix_min?: number;
  prix_max?: number;
  equipements: string[];
  services: string[];
  photo_file?: File;
  photo_url?: string;
  eligibilite_statut?: 'avp_eligible' | 'non_eligible' | 'a_verifier';
}

export default function CreateEtablissement() {
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    presentation: '',
    adresse: '',
    ville: '',
    code_postal: '',
    departement: '',
    habitat_type: HABITAT_TAXONOMY[0].key,
    sous_categories: [],
    equipements: [],
    services: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<unknown>(null);
  const [userOrganisation, setUserOrganisation] = useState<string>('');
  // Removed unused state variables: sousCategories, equipementsList, servicesList
  const router = useRouter();

  // Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/gestionnaire/login');
        return;
      }

      // Vérifier le rôle et récupérer l'organisation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, organisation')
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
      setUserOrganisation(profile?.organisation || '');
    };

    checkAuth();
  }, [router]);

  // Charger les options de sélection
  useEffect(() => {
    const loadOptions = async () => {
      // Removed loading of sous-catégories, équipements, and services (unused)
    };

    loadOptions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si on change le type d'habitat, réinitialiser les sous-catégories
    // pour garantir la cohérence (une sous-catégorie ne peut appartenir qu'à un seul habitat_type)
    if (name === 'habitat_type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        sous_categories: [] // Réinitialisation automatique
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadPhotoIfExists = async (etablissementId: string): Promise<string | null> => {
    if (!formData.photo_file) {
      console.log('ℹ️ Aucune photo à uploader');
      return null;
    }
    
    try {
      console.log('📤 Upload de la photo via API...');
      console.log('   Fichier:', formData.photo_file.name);
      console.log('   Taille:', (formData.photo_file.size / 1024).toFixed(2), 'KB');
      console.log('   Type:', formData.photo_file.type);

      // Créer FormData pour l'API
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.photo_file);
      uploadFormData.append('tempId', etablissementId);

      // Upload via route API (qui utilise service_role key)
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ Erreur upload:', result.error);
        return null;
      }

      console.log('✅ Photo uploadée avec succès:', result.path);
      return result.path;
      
    } catch (error) {
      console.error('❌ Exception lors de l\'upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ VALIDATION : Vérifier que les coordonnées GPS sont présentes
      if (!formData.latitude || !formData.longitude) {
        setError('⚠️ Veuillez sélectionner une adresse dans la liste d\'autocomplétion pour obtenir la géolocalisation. Tapez votre adresse et choisissez-la dans la liste qui apparaît.');
        setLoading(false);
        return;
      }

      // Générer un ID temporaire pour l'établissement (pour l'upload photo)
      const tempId = crypto.randomUUID();
      
      // Uploader la photo si elle existe
      let imagePath = null;
      console.log('🔍 Vérification photo_file:', !!formData.photo_file);
      if (formData.photo_file) {
        console.log('📸 Nom fichier:', formData.photo_file.name);
        console.log('📸 Taille:', formData.photo_file.size, 'bytes');
        console.log('📸 Type:', formData.photo_file.type);
        console.log('📸 Début upload vers:', tempId);
        imagePath = await uploadPhotoIfExists(tempId);
        
        if (!imagePath) {
          // Avertir l'utilisateur mais continuer la soumission
          console.warn('⚠️ L\'image n\'a pas pu être uploadée, mais la proposition sera créée sans image');
          setError('⚠️ Attention: L\'image n\'a pas pu être uploadée. La proposition sera créée sans image.');
          // Attendre 3 secondes pour que l'utilisateur voie le message
          await new Promise(resolve => setTimeout(resolve, 3000));
          setError(''); // Effacer l'erreur pour continuer
        } else {
          console.log('✅ Photo uploadée:', imagePath);
        }
      } else {
        console.log('ℹ️ Aucune photo sélectionnée (facultatif)');
      }

      // Préparer les données pour la proposition
      const propositionData = {
        type_cible: 'etablissement',
        action: 'create',
        statut: 'en_attente',
        source: 'gestionnaire',
        created_by: (user as { id: string }).id,
        payload: {
          ...formData,
          // Mapper les champs pour la base de données
          commune: formData.ville,  // ville -> commune
          adresse_l1: formData.adresse,  // adresse -> adresse_l1
          // Passer le nom de l'organisation (pas l'UUID) pour le champ gestionnaire
          gestionnaire: userOrganisation,
          // ✅ NOUVEAU : Inclure le chemin de l'image pour établissements.image_path
          image_path: imagePath,
          // Retirer les données de la photo du payload (fichier binaire)
          photo_file: undefined,
          photo_url: undefined,
          // Ajouter l'ID temporaire pour le référencement
          temp_etablissement_id: tempId
        }
      };

      const { error } = await supabase
        .from('propositions')
        .insert([propositionData])
        .select()
        .single();

      if (error) throw error;

      router.push('/gestionnaire/dashboard?success=creation');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message?: string }).message || 'Une erreur est survenue');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Créer un établissement</h1>
            <p className="mt-2 text-sm text-gray-600">
              Remplissez ce formulaire pour soumettre une demande de création d&#39;établissement. 
              Votre demande sera examinée par nos équipes avant publication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom de l&#39;établissement *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    id="nom"
                    required
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="habitat_type" className="block text-sm font-medium text-gray-700">
                    Type d&#39;habitat *
                  </label>
                  <select
                    name="habitat_type"
                    id="habitat_type"
                    required
                    value={formData.habitat_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {HABITAT_TAXONOMY.map(category => (
                      <option key={category.key} value={category.key}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Éligibilité AVP */}
                <div>
                  <label htmlFor="eligibilite_statut" className="block text-sm font-medium text-gray-700">
                    🏡 Éligibilité Appartement de Coordination (AVP)
                  </label>
                  <select
                    name="eligibilite_statut"
                    id="eligibilite_statut"
                    value={formData.eligibilite_statut || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Non renseigné</option>
                    <option value="avp_eligible">Éligible AVP</option>
                    <option value="non_eligible">Non éligible</option>
                    <option value="a_verifier">À vérifier</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Les Appartements de Coordination sont des habitats inclusifs avec animation de la vie sociale.
                  </p>
                </div>

                {/* Sous-catégories - Affichage conditionnel selon la catégorie sélectionnée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégories
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                    {(() => {
                      const selectedCategory = HABITAT_TAXONOMY.find(cat => cat.key === formData.habitat_type);
                      return selectedCategory?.sousCategories.map(sousCategorie => (
                        <label key={sousCategorie.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.sous_categories.includes(sousCategorie.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  sous_categories: [...prev.sous_categories, sousCategorie.key]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  sous_categories: prev.sous_categories.filter(sc => sc !== sousCategorie.key)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{sousCategorie.label}</span>
                        </label>
                      )) || <p className="text-sm text-gray-500">Sélectionnez d&#39;abord un type d&#39;habitat</p>;
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="presentation" className="block text-sm font-medium text-gray-700">
                  Présentation *
                </label>
                <textarea
                  name="presentation"
                  id="presentation"
                  rows={4}
                  required
                  value={formData.presentation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez votre établissement, ses spécificités, son environnement..."
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
              
              <AddressAutocomplete
                value={formData.adresse}
                onChange={handleAddressChange}
                codePostal={formData.code_postal}
                ville={formData.ville}
                latitude={formData.latitude}
                longitude={formData.longitude}
                required={true}
                placeholder="Commencez à taper votre adresse..."
              />

              {/* Département */}
              <div className="mt-6">
                <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-2">
                  Département
                </label>
                <DepartmentAutocomplete
                  value={formData.departement}
                  onChange={(value) => handleAddressChange('departement', value)}
                  placeholder="Sélectionnez un département..."
                  required={true}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    id="telephone"
                    value={formData.telephone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="site_web" className="block text-sm font-medium text-gray-700">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="site_web"
                    id="site_web"
                    value={formData.site_web || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Sous-catégories section removed (unused) */}

            {/* Photo de l'établissement */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📷 Photo de l&#39;établissement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez une photo représentative de votre établissement (optionnel). Vous pourrez ajouter d&#39;autres photos une fois l&#39;établissement validé.
              </p>
              <ImageUpload
                onImageSelected={(url, file) => setFormData({
                  ...formData,
                  photo_url: url,
                  photo_file: file
                })}
                maxSizeMB={5}
                className="max-w-md"
              />
            </div>

            {/* Information sur la suite */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Après validation de votre demande</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <strong>Accès complet à la gestion :</strong> Vous pourrez compléter toutes les informations détaillées de votre établissement :
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Types de logements avec surfaces, équipements et tarifs détaillés</li>
                      <li>Services de restauration (kitchenette, restaurant collectif, portage repas)</li>
                      <li>Services et équipements complets</li>
                      <li>Photos supplémentaires</li>
                      <li>Disponibilités et planning</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
                      <p className="font-medium text-blue-900 mb-1">Import en masse</p>
                      <p className="text-blue-700">
                        Vous gérez plusieurs établissements ? Nous pouvons vous accompagner pour des imports en masse à partir de fichiers CSV.{' '}
                        <Link 
                          href="/contact" 
                          className="font-semibold underline hover:no-underline"
                        >
                          Contactez-nous
                        </Link>{' '}
                        pour en savoir plus.
                      </p>
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

            <div className="flex justify-between pt-6">
              <Link
                href="/gestionnaire/dashboard"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}