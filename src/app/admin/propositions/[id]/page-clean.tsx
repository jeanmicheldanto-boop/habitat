"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"] & { profiles?: { prenom?: string; nom?: string; email?: string; organisation?: string } };

interface EtablissementPayload {
  nom?: string;
  habitat_type?: string;
  ville?: string;
  adresse?: string;
  capacite?: number;
  telephone?: string;
  email?: string;
  description?: string;
}

export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

export default function PropositionModerationPage({ params }: { params: { id: string } }) {
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [items, setItems] = useState<PropositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // D&#39;abord récupérer la proposition
      const { data: prop, error: propError } = await supabase
        .from("propositions")
        .select("*")
        .eq("id", params.id)
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
        profiles: profileData as Record<string, unknown>
      };
      
      setProposition(propositionWithProfile);
      
      // Récupérer les items
      const { data: itemsData, error: itemsError } = await supabase
        .from("proposition_items")
        .select("*")
        .eq("proposition_id", params.id);
        
      if (itemsError) {
        setError("Erreur lors du chargement des items");
        setLoading(false);
        return;
      }
      
      setItems(itemsData || []);
      setLoading(false);
    }

    fetchData();
  }, [params.id]);

  async function handleModerate(statut: "approuvee" | "rejetee") {
    if (!proposition) return;
    setActionLoading(true);
    setError(null);

    // Si approbation, appliquer les modifications sur la table cible
    if (statut === "approuvee" && proposition.type_cible === "etablissement") {
      try {
        if (proposition.action === 'create') {
          // Création d&#39;un nouvel établissement
          console.log(&#39;🏗️ Création d\&#39;un nouvel établissement avec payload:', proposition.payload);
          
          // Préparer les données pour l&#39;insertion
          const etablissementData = { ...(proposition.payload as Record<string, unknown>) };
          
          // Supprimer les champs qui ne doivent pas être dans etablissements
          delete etablissementData.proposeur;
          delete etablissementData.modifications;
          
          // Ajouter des champs par défaut si nécessaires
          if (!etablissementData.statut_ouverture) {
            etablissementData.statut_ouverture = 'ouvert';
          }
          if (!etablissementData.eligibilite_statut) {
            etablissementData.eligibilite_statut = 'a-verifier';
          }
          
          const { data: newEtab, error: createError } = await supabase
            .from("etablissements")
            .insert([etablissementData])
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Erreur création établissement:', createError);
            throw createError;
          }
          
          console.log('✅ Nouvel établissement créé:', newEtab);
          
          // Mettre à jour la proposition avec l'ID du nouvel établissement
          await supabase
            .from("propositions")
            .update({ etablissement_id: newEtab.id })
            .eq("id", proposition.id);
            
        } else if (proposition.action === 'update' && proposition.etablissement_id) {
          // Modification d&#39;un établissement existant
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
        console.error('❌ Erreur lors de l\&#39;application:', error);
        setError(`Erreur lors de l&#39;application des modifications: ${(error as Error).message}`);
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
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la proposition...</p>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/admin/propositions" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </main>
    );
  }
  
  if (!proposition) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold mb-2">Proposition non trouvée</h2>
          <p className="text-yellow-600">Aucune proposition trouvée avec cet ID.</p>
          <Link href="/admin/propositions" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </main>
    );
  }

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
          {(proposition as Proposition).profiles && (
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

          {/* Détails de l&#39;établissement */}
          {proposition.payload && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    {(proposition.payload as Record<string, unknown>)?.nom as string || 'Établissement proposé'}
                  </h2>
                  <p className="text-blue-700">Détails de l&#39;établissement</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(proposition.payload as EtablissementPayload)?.habitat_type && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Type d&#39;habitat</span>
                    <p className="text-lg font-semibold text-gray-900">{(proposition.payload as EtablissementPayload).habitat_type}</p>
                  </div>
                )}
                {(proposition.payload as EtablissementPayload)?.ville && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Ville</span>
                    <p className="text-lg font-semibold text-gray-900">{(proposition.payload as EtablissementPayload).ville}</p>
                  </div>
                )}
                {(proposition.payload as EtablissementPayload)?.adresse && (
                  <div className="bg-white rounded-lg p-4 md:col-span-2 lg:col-span-1">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Adresse</span>
                    <p className="text-lg text-gray-900">{(proposition.payload as EtablissementPayload).adresse}</p>
                  </div>
                )}
                {(proposition.payload as EtablissementPayload)?.capacite && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Capacité</span>
                    <p className="text-lg font-semibold text-gray-900">{(proposition.payload as EtablissementPayload).capacite} places</p>
                  </div>
                )}
                {(proposition.payload as EtablissementPayload)?.telephone && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Téléphone</span>
                    <p className="text-lg text-gray-900">{(proposition.payload as EtablissementPayload).telephone}</p>
                  </div>
                )}
                {(proposition.payload as EtablissementPayload)?.email && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Email</span>
                    <p className="text-lg text-gray-900">{(proposition.payload as EtablissementPayload).email}</p>
                  </div>
                )}
              </div>
              {(proposition.payload as EtablissementPayload)?.description && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <span className="font-medium text-gray-700 block text-sm mb-2">Description</span>
                  <p className="text-gray-900 leading-relaxed">{(proposition.payload as EtablissementPayload).description?.replace(/'/g, "&#39;")}</p>
                </div>
              )}
            </div>
          )}

          {/* Items de modification détaillés (si ils existent) */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900">Modifications détaillées ({items.length})</h2>
                  <p className="text-amber-700">Changements proposés champ par champ</p>
                </div>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium text-gray-700 block text-sm mb-1">Champ</span>
                        <p className="text-gray-900 font-semibold">{item.column_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block text-sm mb-1">Ancienne valeur</span>
                        <p className="text-gray-600 bg-gray-50 px-2 py-1 rounded">{String(item.old_value) || 'Vide'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block text-sm mb-1">Nouvelle valeur</span>
                        <p className="text-gray-900 bg-blue-50 px-2 py-1 rounded">{String(item.new_value)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d&#39;action */}
          {proposition.statut === 'en_attente' && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Actions de modération</h2>
                  <p className="text-gray-700">Approuver ou rejeter cette proposition</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleModerate("approuvee")}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  disabled={actionLoading}
                >
                  <span className="text-xl">✅</span>
                  {actionLoading ? 'Traitement...' : 'Approuver'}
                </button>
                <button
                  onClick={() => handleModerate("rejetee")}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  disabled={actionLoading}
                >
                  <span className="text-xl">❌</span>
                  {actionLoading ? 'Traitement...' : 'Rejeter'}
                </button>
              </div>
              {actionLoading && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Traitement en cours, veuillez patienter...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}