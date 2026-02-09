"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getSupabaseImageUrl } from '@/lib/imageUtils';

interface Service {
  id: string;
  libelle: string;
}

export default function EditEtablissement() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [userOrganisation, setUserOrganisation] = useState('');

  // Données établissement
  const [etablissement, setEtablissement] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '',
    presentation: '',
    adresse_l1: '',
    adresse_l2: '',
    commune: '',
    code_postal: '',
    departement: '',
    telephone: '',
    site_web: '',
    email: '',
    eligibilite_statut: null as 'eligible' | 'non_eligible' | null
  });

  // Services
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Tarification
  const [tarification, setTarification] = useState({
    prix_min: 0,
    prix_max: 0,
    fourchette_prix: null as 'euro' | 'deux_euros' | 'trois_euros' | null
  });

  // Restauration
  const [restauration, setRestauration] = useState({
    kitchenette: false,
    resto_collectif: false,
    resto_collectif_midi: false,
    portage_repas: false
  });

  // AVP (Projet de Vie Sociale Partagé)
  const [avpInfos, setAvpInfos] = useState({
    statut: 'intention' as 'intention' | 'en_projet' | 'ouvert',
    pvsp_objectifs: '',
    pvsp_animation_vie_sociale: '',
    pvsp_gouvernance_partagee: '',
    pvsp_ouverture_au_quartier: '',
    public_accueilli: '',
    heures_animation_semaine: 0
  });

  // Types de logements
  const [logements, setLogements] = useState<any[]>([]);
  const [editingLogement, setEditingLogement] = useState<any | null>(null);
  const [newLogement, setNewLogement] = useState({
    libelle: '',
    surface_min: null as number | null,
    surface_max: null as number | null,
    meuble: false,
    pmr: false,
    domotique: false,
    plain_pied: false,
    nb_unites: null as number | null
  });

  // Photo principale
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/gestionnaire/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organisation')
        .eq('id', authUser.id)
        .single();

      if (profile?.role !== 'gestionnaire') {
        router.push('/gestionnaire/login');
        return;
      }

      setUser({ id: authUser.id });
      setUserOrganisation(profile.organisation || '');

      if (!id) {
        router.push('/gestionnaire/dashboard');
        return;
      }

      // Load etablissement
      await loadEtablissement(id, profile.organisation || '');
      await loadServices();
      
      setLoading(false);
    };

    init();
  }, [id, router]);

  const loadEtablissement = async (etabId: string, organisation: string) => {
    // Load basic info
    const { data: etab } = await supabase
      .from('etablissements')
      .select('*')
      .eq('id', etabId)
      .single();

    if (!etab) {
      alert('Établissement non trouvé');
      router.push('/gestionnaire/dashboard');
      return;
    }

    // Check access: either via gestionnaire field OR via proprietaires table
    const isOwnedByOrganisation = etab.gestionnaire === organisation;
    
    // Check if user is a proprietaire (via claimed property)
    let isProprietaire = false;
    if (user?.id) {
      const { data: proprietaire } = await supabase
        .from('etablissement_proprietaires')
        .select('user_id')
        .eq('etablissement_id', etabId)
        .eq('user_id', user.id)
        .single();
      
      isProprietaire = !!proprietaire;
    }

    // Grant access if either condition is met
    if (!isOwnedByOrganisation && !isProprietaire) {
      alert('Établissement non trouvé ou accès non autorisé');
      router.push('/gestionnaire/dashboard');
      return;
    }

    setEtablissement(etab);
    setFormData({
      nom: etab.nom || '',
      presentation: etab.presentation || '',
      adresse_l1: etab.adresse_l1 || '',
      adresse_l2: etab.adresse_l2 || '',
      commune: etab.commune || '',
      code_postal: etab.code_postal || '',
      departement: etab.departement || '',
      telephone: etab.telephone || '',
      site_web: etab.site_web || '',
      email: etab.email || '',
      eligibilite_statut: etab.eligibilite_statut || null
    });

    // Load services
    const { data: etabServices } = await supabase
      .from('etablissement_service')
      .select('service_id')
      .eq('etablissement_id', etabId);

    if (etabServices) {
      setSelectedServices(etabServices.map(s => s.service_id));
    }

    // Load tarification
    const { data: tarif } = await supabase
      .from('tarifications')
      .select('*')
      .eq('etablissement_id', etabId)
      .single();

    if (tarif) {
      setTarification({
        prix_min: tarif.prix_min || 0,
        prix_max: tarif.prix_max || 0,
        fourchette_prix: tarif.fourchette_prix || null
      });
    }

    // Load restauration
    const { data: resto } = await supabase
      .from('restaurations')
      .select('*')
      .eq('etablissement_id', etabId)
      .single();

    if (resto) {
      setRestauration({
        kitchenette: resto.kitchenette || false,
        resto_collectif: resto.resto_collectif || false,
        resto_collectif_midi: resto.resto_collectif_midi || false,
        portage_repas: resto.portage_repas || false
      });
    }

    // Load AVP
    const { data: avp } = await supabase
      .from('avp_infos')
      .select('*')
      .eq('etablissement_id', etabId)
      .single();

    if (avp) {
      const pvsp = avp.pvsp_fondamentaux || {};
      setAvpInfos({
        statut: avp.statut || 'intention',
        pvsp_objectifs: pvsp.objectifs || '',
        pvsp_animation_vie_sociale: pvsp.animation_vie_sociale || '',
        pvsp_gouvernance_partagee: pvsp.gouvernance_partagee || '',
        pvsp_ouverture_au_quartier: pvsp.ouverture_au_quartier || '',
        public_accueilli: avp.public_accueilli || '',
        heures_animation_semaine: avp.heures_animation_semaine || 0
      });
    }

    // Load photo principale
    const { data: medias } = await supabase
      .from('medias')
      .select('*')
      .eq('etablissement_id', etabId)
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (medias) {
      setMainImage(medias.storage_path);
    }

    // Load types de logements
    const { data: logts } = await supabase
      .from('logements_types')
      .select('*')
      .eq('etablissement_id', etabId);

    if (logts) {
      setLogements(logts);
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('libelle');

    if (error) {
      console.error('Error loading services:', error);
      return;
    }

    if (data) {
      setAvailableServices(data);
    }
  };

  const handleSave = async () => {
    if (!etablissement || !user) return;

    setSaving(true);

    try {
      // Update etablissement
      const { error: etabError } = await supabase
        .from('etablissements')
        .update(formData)
        .eq('id', etablissement.id);

      if (etabError) throw etabError;

      // Update services
      await supabase
        .from('etablissement_service')
        .delete()
        .eq('etablissement_id', etablissement.id);

      if (selectedServices.length > 0) {
        const serviceInserts = selectedServices.map(serviceId => ({
          etablissement_id: etablissement.id,
          service_id: serviceId
        }));

        await supabase
          .from('etablissement_service')
          .insert(serviceInserts);
      }

      // Upsert tarification
      const { data: existingTarif } = await supabase
        .from('tarifications')
        .select('id')
        .eq('etablissement_id', etablissement.id)
        .single();

      if (existingTarif) {
        await supabase
          .from('tarifications')
          .update(tarification)
          .eq('id', existingTarif.id);
      } else {
        await supabase
          .from('tarifications')
          .insert({ ...tarification, etablissement_id: etablissement.id });
      }

      // Upsert restauration
      const { data: existingResto } = await supabase
        .from('restaurations')
        .select('id')
        .eq('etablissement_id', etablissement.id)
        .single();

      if (existingResto) {
        await supabase
          .from('restaurations')
          .update(restauration)
          .eq('id', existingResto.id);
      } else {
        await supabase
          .from('restaurations')
          .insert({ ...restauration, etablissement_id: etablissement.id });
      }

      // Upsert AVP
      const { data: existingAvp } = await supabase
        .from('avp_infos')
        .select('id')
        .eq('etablissement_id', etablissement.id)
        .single();

      const avpData = {
        statut: avpInfos.statut,
        pvsp_fondamentaux: {
          objectifs: avpInfos.pvsp_objectifs,
          animation_vie_sociale: avpInfos.pvsp_animation_vie_sociale,
          gouvernance_partagee: avpInfos.pvsp_gouvernance_partagee,
          ouverture_au_quartier: avpInfos.pvsp_ouverture_au_quartier,
          prevention_isolement: '',
          participation_habitants: ''
        },
        public_accueilli: avpInfos.public_accueilli,
        heures_animation_semaine: avpInfos.heures_animation_semaine
      };

      if (existingAvp) {
        await supabase
          .from('avp_infos')
          .update(avpData)
          .eq('id', existingAvp.id);
      } else {
        await supabase
          .from('avp_infos')
          .insert({ ...avpData, etablissement_id: etablissement.id });
      }

      alert('Modifications enregistrées avec succès !');
      router.push('/gestionnaire/dashboard');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLogement = async () => {
    if (!etablissement) return;

    const { data, error } = await supabase
      .from('logements_types')
      .insert({
        ...newLogement,
        etablissement_id: etablissement.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding logement:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert('Erreur lors de l\'ajout du logement: ' + (error.message || 'Erreur inconnue'));
      return;
    }

    setLogements([...logements, data]);
    setNewLogement({
      libelle: '',
      surface_min: null,
      surface_max: null,
      meuble: false,
      pmr: false,
      domotique: false,
      plain_pied: false,
      nb_unites: null
    });
  };

  const handleUpdateLogement = async (logement: any) => {
    const { error } = await supabase
      .from('logements_types')
      .update({
        libelle: logement.libelle,
        surface_min: logement.surface_min,
        surface_max: logement.surface_max,
        meuble: logement.meuble,
        pmr: logement.pmr,
        domotique: logement.domotique,
        plain_pied: logement.plain_pied,
        nb_unites: logement.nb_unites
      })
      .eq('id', logement.id);

    if (error) {
      console.error('Error updating logement:', error);
      alert('Erreur lors de la modification');
      return;
    }

    setLogements(logements.map(l => l.id === logement.id ? logement : l));
    setEditingLogement(null);
  };

  const handleDeleteLogement = async (id: string) => {
    if (!confirm('Supprimer ce type de logement ?')) return;

    const { error } = await supabase
      .from('logements_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting logement:', error);
      alert('Erreur lors de la suppression');
      return;
    }

    setLogements(logements.filter(l => l.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !etablissement) return;

    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      // Upload via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('etablissementId', etablissement.id);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Supprimer l'ancienne photo si elle existe
        const { data: existingMedia } = await supabase
          .from('medias')
          .select('id')
          .eq('etablissement_id', etablissement.id)
          .single();

        if (existingMedia) {
          await supabase
            .from('medias')
            .delete()
            .eq('id', existingMedia.id);
        }

        // Insérer la nouvelle photo
        const { data: newMedia, error } = await supabase
          .from('medias')
          .insert({
            etablissement_id: etablissement.id,
            storage_path: result.path,
            priority: 1
          })
          .select()
          .single();

        if (error) throw error;

        setMainImage(newMedia.storage_path);
        alert('Photo mise à jour avec succès !');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
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

  if (!etablissement) {
    return null;
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
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>
            Modifier l'établissement
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1rem' }}>
            {etablissement.nom}
          </p>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
        {/* Form */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          padding: '2rem'
        }}>
          {/* Informations de base */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Informations de base
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Adresse ligne 1
                </label>
                <input
                  type="text"
                  value={formData.adresse_l1}
                  onChange={(e) => setFormData({ ...formData, adresse_l1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Adresse ligne 2 (complément)
                </label>
                <input
                  type="text"
                  value={formData.adresse_l2}
                  onChange={(e) => setFormData({ ...formData, adresse_l2: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.code_postal}
                  onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Commune
                </label>
                <input
                  type="text"
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Présentation
                </label>
                <textarea
                  value={formData.presentation}
                  onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Téléphone
                </label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.site_web}
                  onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </section>

          {/* Éligibilité AVP */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Éligibilité Habitat Accompagné Partagé
            </h2>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                Statut d'éligibilité AVP
              </label>
              <select
                value={formData.eligibilite_statut || ''}
                onChange={(e) => setFormData({ ...formData, eligibilite_statut: e.target.value ? e.target.value as any : null })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: '1rem'
                }}
              >
                <option value="">Non défini</option>
                <option value="eligible">Éligible</option>
                <option value="non_eligible">Non éligible</option>
              </select>
            </div>
          </section>

          {/* Services */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Services proposés
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {availableServices.map(service => (
                <label
                  key={service.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: selectedServices.includes(service.id) ? '2px solid #667eea' : '1px solid #d1d5db',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selectedServices.includes(service.id) ? '#ede9fe' : '#fff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, service.id]);
                      } else {
                        setSelectedServices(selectedServices.filter(id => id !== service.id));
                      }
                    }}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: '#374151' }}>{service.libelle}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Tarification */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Tarification
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Prix minimum (€/mois)
                </label>
                <input
                  type="number"
                  value={tarification.prix_min}
                  onChange={(e) => setTarification({ ...tarification, prix_min: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Prix maximum (€/mois)
                </label>
                <input
                  type="number"
                  value={tarification.prix_max}
                  onChange={(e) => setTarification({ ...tarification, prix_max: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Fourchette de prix (optionnel)
                </label>
                <select
                  value={tarification.fourchette_prix || ''}
                  onChange={(e) => setTarification({ ...tarification, fourchette_prix: e.target.value ? e.target.value as any : null })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                >
                  <option value="">-- Aucune --</option>
                  <option value="euro">€ - Moins de 750€/mois</option>
                  <option value="deux_euros">€€ - Entre 750€ et 1500€/mois</option>
                  <option value="trois_euros">€€€ - Plus de 1500€/mois</option>
                </select>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  Logement + charges + services (hors restauration et services individualisables, sans déduction de l'APA)
                </p>
              </div>
            </div>
          </section>

          {/* Restauration */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Restauration
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restauration.kitchenette}
                  onChange={(e) => setRestauration({ ...restauration, kitchenette: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#374151' }}>Kitchenette</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restauration.resto_collectif}
                  onChange={(e) => setRestauration({ ...restauration, resto_collectif: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#374151' }}>Restauration collective</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restauration.resto_collectif_midi}
                  onChange={(e) => setRestauration({ ...restauration, resto_collectif_midi: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#374151' }}>Restauration collective midi</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restauration.portage_repas}
                  onChange={(e) => setRestauration({ ...restauration, portage_repas: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#374151' }}>Portage de repas</span>
              </label>
            </div>
          </section>

          {/* AVP - Projet de Vie Sociale Partagé (seulement si éligible) */}
          {formData.eligibilite_statut === 'eligible' && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Habitat Accompagné Partagé (AVP)
            </h2>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  Statut du projet
                </label>
                <select
                  value={avpInfos.statut}
                  onChange={(e) => setAvpInfos({ ...avpInfos, statut: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                >
                  <option value="intention">Intention</option>
                  <option value="en_projet">En projet</option>
                  <option value="ouvert">Ouvert</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  PVSP - Objectifs
                </label>
                <textarea
                  value={avpInfos.pvsp_objectifs}
                  onChange={(e) => setAvpInfos({ ...avpInfos, pvsp_objectifs: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  PVSP - Animation de la vie sociale
                </label>
                <textarea
                  value={avpInfos.pvsp_animation_vie_sociale}
                  onChange={(e) => setAvpInfos({ ...avpInfos, pvsp_animation_vie_sociale: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  PVSP - Gouvernance partagée
                </label>
                <textarea
                  value={avpInfos.pvsp_gouvernance_partagee}
                  onChange={(e) => setAvpInfos({ ...avpInfos, pvsp_gouvernance_partagee: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                  PVSP - Ouverture au quartier
                </label>
                <textarea
                  value={avpInfos.pvsp_ouverture_au_quartier}
                  onChange={(e) => setAvpInfos({ ...avpInfos, pvsp_ouverture_au_quartier: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                    Public accueilli
                  </label>
                  <input
                    type="text"
                    value={avpInfos.public_accueilli}
                    onChange={(e) => setAvpInfos({ ...avpInfos, public_accueilli: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                    Heures d'animation par semaine
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={avpInfos.heures_animation_semaine}
                    onChange={(e) => setAvpInfos({ ...avpInfos, heures_animation_semaine: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
          )}

          {/* Types de logements */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Types de logements
            </h2>

            {/* Liste des logements existants */}
            {logements.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {logements.map((logement) => (
                  <div key={logement.id} style={{
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#f9fafb'
                  }}>
                    {editingLogement?.id === logement.id ? (
                      // Mode édition
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Libellé</label>
                            <input
                              type="text"
                              value={editingLogement.libelle}
                              onChange={(e) => setEditingLogement({ ...editingLogement, libelle: e.target.value })}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Nombre d'unités</label>
                            <input
                              type="number"
                              value={editingLogement.nb_unites}
                              onChange={(e) => setEditingLogement({ ...editingLogement, nb_unites: Number(e.target.value) })}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Surface min (m²)</label>
                            <input
                              type="number"
                              value={editingLogement.surface_min}
                              onChange={(e) => setEditingLogement({ ...editingLogement, surface_min: Number(e.target.value) })}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Surface max (m²)</label>
                            <input
                              type="number"
                              value={editingLogement.surface_max}
                              onChange={(e) => setEditingLogement({ ...editingLogement, surface_max: Number(e.target.value) })}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={editingLogement.meuble}
                              onChange={(e) => setEditingLogement({ ...editingLogement, meuble: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.9rem' }}>Meublé</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={editingLogement.pmr}
                              onChange={(e) => setEditingLogement({ ...editingLogement, pmr: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.9rem' }}>PMR</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={editingLogement.domotique}
                              onChange={(e) => setEditingLogement({ ...editingLogement, domotique: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.9rem' }}>Domotique</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={editingLogement.plain_pied}
                              onChange={(e) => setEditingLogement({ ...editingLogement, plain_pied: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.9rem' }}>Plain-pied</span>
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateLogement(editingLogement)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#667eea',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={() => setEditingLogement(null)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#e5e7eb',
                              color: '#374151',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode lecture
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <strong style={{ color: '#374151', fontSize: '0.85rem' }}>Libellé:</strong>
                            <p style={{ margin: '0.25rem 0 0', color: '#1f2937' }}>{logement.libelle || 'Non défini'}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#374151', fontSize: '0.85rem' }}>Surface:</strong>
                            <p style={{ margin: '0.25rem 0 0', color: '#1f2937' }}>
                              {logement.surface_min && logement.surface_max 
                                ? `${logement.surface_min}m² - ${logement.surface_max}m²`
                                : logement.surface_min 
                                ? `${logement.surface_min}m²`
                                : logement.surface_max
                                ? `${logement.surface_max}m²`
                                : 'Non définie'}
                            </p>
                          </div>
                          <div>
                            <strong style={{ color: '#374151', fontSize: '0.85rem' }}>Nombre d'unités:</strong>
                            <p style={{ margin: '0.25rem 0 0', color: '#1f2937' }}>{logement.nb_unites || 0}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          {logement.meuble && <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: '0.8rem' }}>Meublé</span>}
                          {logement.pmr && <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: '0.8rem' }}>PMR</span>}
                          {logement.domotique && <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: '0.8rem' }}>Domotique</span>}
                          {logement.plain_pied && <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: '0.8rem' }}>Plain-pied</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingLogement(logement)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#667eea',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteLogement(logement.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire d'ajout */}
            <div style={{ padding: '1.25rem', border: '2px dashed #d1d5db', borderRadius: 8, background: '#f9fafb' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#374151' }}>Ajouter un type de logement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Libellé</label>
                  <input
                    type="text"
                    value={newLogement.libelle}
                    onChange={(e) => setNewLogement({ ...newLogement, libelle: e.target.value })}
                    placeholder="Ex: T1, Studio, F2..."
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Nombre d'unités</label>
                  <input
                    type="number"
                    value={newLogement.nb_unites || ''}
                    onChange={(e) => setNewLogement({ ...newLogement, nb_unites: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Surface min (m²)</label>
                  <input
                    type="number"
                    value={newLogement.surface_min || ''}
                    onChange={(e) => setNewLogement({ ...newLogement, surface_min: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Surface max (m²)</label>
                  <input
                    type="number"
                    value={newLogement.surface_max || ''}
                    onChange={(e) => setNewLogement({ ...newLogement, surface_max: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newLogement.meuble}
                    onChange={(e) => setNewLogement({ ...newLogement, meuble: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.9rem' }}>Meublé</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newLogement.pmr}
                    onChange={(e) => setNewLogement({ ...newLogement, pmr: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.9rem' }}>PMR</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newLogement.domotique}
                    onChange={(e) => setNewLogement({ ...newLogement, domotique: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.9rem' }}>Domotique</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newLogement.plain_pied}
                    onChange={(e) => setNewLogement({ ...newLogement, plain_pied: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.9rem' }}>Plain-pied</span>
                </label>
              </div>
              <button
                onClick={handleAddLogement}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                + Ajouter ce type de logement
              </button>
            </div>
          </section>

          {/* Photo principale */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #667eea'
            }}>
              Photo principale
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              {mainImage ? (
                <div style={{
                  position: 'relative',
                  maxWidth: 400,
                  aspectRatio: '4/3',
                  border: '2px solid #d1d5db',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#f3f4f6'
                }}>
                  <Image
                    src={getSupabaseImageUrl(mainImage)}
                    alt="Photo principale"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{
                  maxWidth: 400,
                  aspectRatio: '4/3',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  background: '#f9fafb'
                }}>
                  Aucune photo
                </div>
              )}
            </div>

            {/* Upload button */}
            <div>
              <label style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: '#fff',
                borderRadius: 8,
                cursor: uploadingImage ? 'wait' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}>
                {uploadingImage ? 'Upload en cours...' : mainImage ? 'Remplacer la photo' : 'Ajouter une photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ margin: '0.75rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
                L'upload multiple de photos sera disponible dans la version premium
              </p>
            </div>
          </section>

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => router.push('/gestionnaire/dashboard')}
              disabled={saving}
              style={{
                padding: '0.875rem 2rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: 8,
                color: '#374151',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: saving ? 'wait' : 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.875rem 2rem',
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
