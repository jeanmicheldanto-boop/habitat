"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"];
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
      
      // D'abord récupérer la proposition
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
        profiles: profileData
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
          // Création d'un nouvel établissement
          console.log('🏗️ Création d\'un nouvel établissement avec payload:', proposition.payload);
          
          // Préparer les données pour l'insertion
          const etablissementData = { ...(proposition.payload as any) };
          
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
  console.log('🔍 Profile:', (proposition as any).profiles);
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
            {proposition.action === 'create' ? '🆕 Création d\'établissement' : 
             proposition.action === 'update' ? '✏️ Modification d\'établissement' : 
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
          {(proposition as any).profiles && (
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
                    {(proposition as any).profiles.prenom} {(proposition as any).profiles.nom}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <span className="font-medium text-gray-700 block text-sm mb-1">Email</span>
                  <p className="text-lg text-gray-900">{(proposition as any).profiles.email}</p>
                </div>
                {(proposition as any).profiles.organisation && (
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-medium text-gray-700 block text-sm mb-1">Organisation</span>
                    <p className="text-lg text-gray-900">{(proposition as any).profiles.organisation}</p>
                  </div>
                )}
              </div>
            </div>
          )}      {/* Boutons d'action */}
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