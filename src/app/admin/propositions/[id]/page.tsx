"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"] & { profiles?: { prenom?: string; nom?: string; email?: string; organisation?: string } };
export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

// export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

export default function PropositionModerationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [items, setItems] = useState<PropositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // D'abord récupérer la proposition
      const { data: prop, error: propError } = await supabase
        .from("propositions")
        .select("*")
        .eq("id", id)
        .single();
        
      if (propError || !prop) {
        setError("Proposition introuvable");
        setLoading(false);
        return;
      }
      
      // Ensuite récupérer le profil du créateur si created_by existe
      let profileData = null;
      if (prop.created_by) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", prop.created_by)
          .single();
          
        if (!profileError && profile) {
          profileData = profile;
        }
      }
      
      // Combiner les données
      const propositionWithProfile = {
        ...prop,
        profiles: profileData
      };
      
      setProposition(propositionWithProfile);
      
      // Récupérer les items
      const { data: itemsData, error: itemsError } = await supabase
        .from("proposition_items")
        .select("*")
        .eq("proposition_id", id);
        
      if (itemsError) {
        setError("Erreur lors du chargement des items");
        setLoading(false);
        return;
      }
      
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  async function handleModerate(statut: "approuvee" | "rejetee") {
    if (!proposition) return;
    setActionLoading(true);
    setError(null);

    console.log('🚀 handleModerate appelé, statut:', statut);
    console.log('🚀 Proposition:', proposition);

    // Si approbation, appliquer les modifications sur la table cible
    if (statut === "approuvee" && proposition.type_cible === "etablissement") {
      console.log('✅ Condition approbation + établissement validée');
      try {
        if (proposition.action === 'create') {
          console.log('✅ Action = create, début création établissement');
          // Création d'un nouvel établissement
          console.log('🏗️ Création d\'un nouvel établissement avec payload:', proposition.payload);
          
          // Préparer les données pour l'insertion
          const payload = proposition.payload as Record<string, unknown>;
          const etablissementData: Record<string, unknown> = {};
          
          // Liste des champs valides dans etablissements (à copier depuis le payload)
          const validFields = [
            'nom', 'presentation', 'adresse_l1', 'adresse_l2', 'code_postal', 
            'commune', 'code_insee', 'departement', 'region', 'pays',
            'statut_editorial', 'eligibilite_statut', 'public_cible',
            'source', 'url_source', 'date_observation', 'date_verification',
            'confiance_score', 'telephone', 'email', 'site_web', 
            'gestionnaire', 'habitat_type', 'image_path'
          ];
          
          // Copier uniquement les champs valides
          for (const field of validFields) {
            if (payload[field] !== undefined && payload[field] !== null) {
              etablissementData[field] = payload[field];
            }
          }
          
          // Mapper description -> presentation si description existe
          if (payload.description && !etablissementData.presentation) {
            etablissementData.presentation = payload.description;
          }
          
          // Mapper ville -> commune si ville existe mais pas commune
          if (payload.ville && !etablissementData.commune) {
            etablissementData.commune = payload.ville;
          }
          
          // Mapper adresse -> adresse_l1 si adresse existe mais pas adresse_l1
          if (payload.adresse && !etablissementData.adresse_l1) {
            etablissementData.adresse_l1 = payload.adresse;
          }
          
          // Mapper le nom de l'organisation vers gestionnaire (text)
          // Le payload contient maintenant directement le nom de l'organisation
          if (!etablissementData.gestionnaire && payload.gestionnaire) {
            etablissementData.gestionnaire = String(payload.gestionnaire);
          }
          
          // Construire la géométrie PostGIS à partir de latitude/longitude
          if (payload.latitude && payload.longitude) {
            // Format PostGIS: POINT(longitude latitude)
            etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
          }
          
          // Ajouter des champs par défaut si nécessaires
          if (!etablissementData.statut_editorial) {
            etablissementData.statut_editorial = 'publie'; // Approuvé = publié
          }
          if (!etablissementData.eligibilite_statut && payload.eligibilite_statut) {
            etablissementData.eligibilite_statut = payload.eligibilite_statut;
          }
          
          console.log('📦 Données nettoyées pour insertion:', etablissementData);
          
          const { data: newEtab, error: createError } = await supabase
            .from("etablissements")
            .insert([etablissementData])
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Erreur création établissement:', createError);
            console.error('   Message:', createError.message);
            console.error('   Code:', createError.code);
            console.error('   Details:', createError.details);
            console.error('   Hint:', createError.hint);
            console.error('   Stringified:', JSON.stringify(createError, null, 2));
            throw createError;
          }
          
          console.log('✅ Nouvel établissement créé:', newEtab);
          
          // Traiter les sous-catégories si présentes dans le payload
          if (Array.isArray(payload.sous_categories) && payload.sous_categories.length > 0) {
            console.log('🏷️ Traitement des sous-catégories:', payload.sous_categories);
            
            // Récupérer toutes les sous-catégories de la base pour normaliser
            const { data: allSousCategories, error: scError } = await supabase
              .from('sous_categories')
              .select('id, libelle, slug')
              .not('slug', 'is', null); // Uniquement celles avec un slug
            
            if (scError) {
              console.error('❌ Erreur récupération sous-catégories:', scError);
            } else if (allSousCategories) {
              // Fonction de normalisation pour comparer les strings
              const normalize = (str: string): string => {
                return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[_\s-]+/g, '_');
              };
              
              // Mapper les clés front-end vers les UUIDs de la base
              const sousCategoriesData: { etablissement_id: string; sous_categorie_id: string }[] = [];
              
              for (const scKey of payload.sous_categories as string[]) {
                const normalizedKey = normalize(scKey);
                
                // Rechercher d'abord par slug (méthode préférée)
                let matchingSc = allSousCategories.find(sc => normalize(sc.slug || '') === normalizedKey);
                
                // Si pas trouvé par slug, essayer par libellé
                if (!matchingSc) {
                  matchingSc = allSousCategories.find(sc => {
                    const normalizedLibelle = normalize(sc.libelle);
                    return normalizedLibelle === normalizedKey || 
                           normalizedLibelle.includes(normalizedKey) ||
                           normalizedKey.includes(normalizedLibelle);
                  });
                }
                
                if (matchingSc) {
                  sousCategoriesData.push({
                    etablissement_id: newEtab.id,
                    sous_categorie_id: matchingSc.id
                  });
                  console.log(`  ✅ Mappé "${scKey}" → "${matchingSc.libelle}" [slug: ${matchingSc.slug}] (${matchingSc.id})`);
                } else {
                  console.warn(`  ⚠️ Sous-catégorie non trouvée: "${scKey}"`);
                }
              }
              
              // Insérer les liens dans etablissement_sous_categorie
              if (sousCategoriesData.length > 0) {
                const { error: linkError } = await supabase
                  .from('etablissement_sous_categorie')
                  .insert(sousCategoriesData);
                
                if (linkError) {
                  console.error('❌ Erreur création liens sous-catégories:', linkError);
                } else {
                  console.log(`✅ ${sousCategoriesData.length} sous-catégorie(s) liée(s) à l'établissement`);
                }
              }
            }
          }
          
          // Mettre à jour la proposition avec l'ID du nouvel établissement
          await supabase
            .from("propositions")
            .update({ etablissement_id: newEtab.id })
            .eq("id", proposition.id);
            
        } else if (proposition.action === 'update' && proposition.etablissement_id) {
          // Modification d'un établissement existant
          console.log('✏️ Modification établissement existant:', proposition.etablissement_id);
          
          const { error: updateEtabError } = await supabase
            .from("etablissements")
            .update(proposition.payload)
            .eq("id", proposition.etablissement_id);
            
          if (updateEtabError) {
            console.error('❌ Erreur modification établissement:', updateEtabError);
            throw updateEtabError;
          }
          
          console.log('✅ Établissement modifié avec succès');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'application:', error);
        setError(`Erreur lors de l'application des modifications: ${(error as Error).message}`);
        setActionLoading(false);
        return;
      }
    }

    // Met à jour le statut de la proposition
    const { error: updateError } = await supabase
      .from("propositions")
      .update({ statut })
      .eq("id", proposition.id);
      
    setActionLoading(false);
    
    if (updateError) {
      setError("Erreur lors de la mise à jour du statut.");
      return;
    }
    
    alert(`Proposition ${statut === 'approuvee' ? 'approuvée' : 'rejetée'} avec succès.`);
    
    // Recharger les données pour voir les changements
    window.location.reload();
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto py-8">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la proposition...</p>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="max-w-2xl mx-auto py-8">
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h2 className="text-red-800 font-semibold mb-2">Erreur</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <Link href="/admin/propositions" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </main>
    );
  }
  
  if (!proposition) {
    return (
      <main className="max-w-2xl mx-auto py-8">
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h2 className="text-yellow-800 font-semibold mb-2">Proposition non trouvée</h2>
            <p className="text-yellow-600">Aucune proposition trouvée avec cet ID.</p>
          </div>
          <Link href="/admin/propositions" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </main>
    );
  }

  // Debug - afficher les données dans la console
  console.log('🔍 Proposition data:', proposition);
  console.log('🔍 Payload:', proposition.payload);
  console.log('🔍 Profile:', proposition.profiles);
  console.log('🔍 Items count:', items.length);
  console.log('🔍 Loading state:', loading);
  console.log('🔍 Error state:', error);

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/propositions" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          ← Retour aux propositions
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header avec titre et statut */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">
            {proposition.action === 'create' ? '🆕 Création d&apos;établissement' : 
             proposition.action === 'update' ? '✏️ Modification d&apos;établissement' : 
             'Proposition'}
          </h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              proposition.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
              proposition.statut === 'approuvee' ? 'bg-green-100 text-green-800' :
              proposition.statut === 'rejetee' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {proposition.statut}
            </span>
            <span className={`px-2 py-1 rounded text-sm ${
              proposition.source === 'public' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {proposition.source}
            </span>
            <span className="text-blue-100 text-sm">
              Créé le {new Date(proposition.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          </div>

        <div className="p-6 space-y-6">
          {/* Informations du créateur - EN PREMIER */}
          {proposition.profiles && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Créateur de la proposition</h2>
                  <p className="text-green-700">Personne responsable de cette demande</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <span className="font-medium text-gray-700 block text-sm mb-1">Nom complet</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {proposition.profiles?.prenom ?? ''} {proposition.profiles?.nom ?? ''}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <span className="font-medium text-gray-700 block text-sm mb-1">Email</span>
                  <p className="text-lg text-gray-900">{proposition.profiles?.email ?? ''}</p>
                </div>
                {proposition.profiles?.organisation && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Organisation</span>
                    <p className="text-lg text-gray-900">{proposition.profiles?.organisation ?? ''}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Détails de l'établissement */}
          {proposition.payload && (() => {
            const payload = proposition.payload as Record<string, unknown>;
            return (
              <div className="space-y-4">
                {/* Informations principales */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h2 className="text-xl font-bold text-blue-900 mb-4">🏢 Informations principales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payload.nom && typeof payload.nom === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Nom</span>
                        <p className="text-lg font-semibold text-gray-900">{payload.nom}</p>
                      </div>
                    ) : null}
                    {payload.habitat_type && typeof payload.habitat_type === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Type d&apos;habitat</span>
                        <p className="text-lg text-gray-900">{payload.habitat_type}</p>
                      </div>
                    ) : null}
                    {(payload.presentation || payload.description) ? (
                      <div className="bg-white rounded-lg p-4 md:col-span-2">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Présentation</span>
                        <p className="text-gray-900">{String(payload.presentation || payload.description)}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Adresse */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h2 className="text-xl font-bold text-purple-900 mb-4">📍 Adresse</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payload.adresse_l1 && typeof payload.adresse_l1 === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Adresse ligne 1</span>
                        <p className="text-gray-900">{payload.adresse_l1}</p>
                      </div>
                    ) : null}
                    {payload.adresse_l2 && typeof payload.adresse_l2 === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Adresse ligne 2</span>
                        <p className="text-gray-900">{payload.adresse_l2}</p>
                      </div>
                    ) : null}
                    {payload.code_postal && typeof payload.code_postal === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Code postal</span>
                        <p className="text-gray-900">{payload.code_postal}</p>
                      </div>
                    ) : null}
                    {payload.commune && typeof payload.commune === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Commune</span>
                        <p className="text-gray-900">{payload.commune}</p>
                      </div>
                    ) : null}
                    {payload.departement && typeof payload.departement === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Département</span>
                        <p className="text-gray-900">{payload.departement}</p>
                      </div>
                    ) : null}
                    {payload.region && typeof payload.region === 'string' ? (
                      <div className="bg-white rounded-lg p-4">
                        <span className="font-medium text-gray-700 block text-sm mb-1">Région</span>
                        <p className="text-gray-900">{payload.region}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Contact */}
                {(payload.telephone || payload.email || payload.site_web) ? (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                    <h2 className="text-xl font-bold text-orange-900 mb-4">📞 Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {payload.telephone && typeof payload.telephone === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Téléphone</span>
                          <p className="text-gray-900">{payload.telephone}</p>
                        </div>
                      ) : null}
                      {payload.email && typeof payload.email === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Email</span>
                          <p className="text-gray-900">{payload.email}</p>
                        </div>
                      ) : null}
                      {payload.site_web && typeof payload.site_web === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Site web</span>
                          <a href={payload.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {payload.site_web}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Autres informations */}
                {(payload.gestionnaire || payload.public_cible || payload.eligibilite_statut) ? (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
                    <h2 className="text-xl font-bold text-teal-900 mb-4">ℹ️ Autres informations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payload.gestionnaire && typeof payload.gestionnaire === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Gestionnaire</span>
                          <p className="text-gray-900">{payload.gestionnaire}</p>
                        </div>
                      ) : null}
                      {payload.public_cible && typeof payload.public_cible === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Public cible</span>
                          <p className="text-gray-900">{payload.public_cible}</p>
                        </div>
                      ) : null}
                      {payload.eligibilite_statut && typeof payload.eligibilite_statut === 'string' ? (
                        <div className="bg-white rounded-lg p-4">
                          <span className="font-medium text-gray-700 block text-sm mb-1">Éligibilité</span>
                          <p className="text-gray-900">{payload.eligibilite_statut}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}

      {/* Boutons d'action */}
      {proposition.statut === 'en_attente' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleModerate("approuvee")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={actionLoading}
            >
              {actionLoading ? 'Traitement...' : '✅ Approuver'}
            </button>
            <button
              onClick={() => handleModerate("rejetee")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={actionLoading}
            >
              {actionLoading ? 'Traitement...' : '❌ Rejeter'}
            </button>
          </div>
          {actionLoading && (
            <div className="mt-4 text-sm text-gray-600">
              ⏳ Traitement en cours, veuillez patienter...
            </div>
          )}
        </div>
      )}

      {/* Items de proposition (si ils existent) */}
      {items.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Détails des modifications ({items.length})</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded p-4 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Champ :</span>
                    <p className="text-gray-900">{item.column_name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Ancienne valeur :</span>
                    <p className="text-gray-900">{String(item.old_value)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Nouvelle valeur :</span>
                    <p className="text-gray-900">{String(item.new_value)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div> {/* fermeture du div .bg-white rounded-lg shadow-lg overflow-hidden */}
      </div> {/* fermeture du div .mb-6 */}
    </main>
  );
}