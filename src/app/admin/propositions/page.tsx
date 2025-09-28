"use client";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

// Types

export type Proposition = Database["public"]["Tables"]["propositions"]["Row"] & { profiles?: ProfileType | null };
export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

// Type for payload field in Proposition
export type PropositionPayload = {
  nom?: string;
  habitat_type?: string;
  ville?: string;
  proposeur?: {
    nom?: string;
    email?: string;
    telephone?: string;
  };
  modifications?: {
    nouvelle_photo_base64?: string;
    nouvelle_photo_filename?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

// Type for profiles field
export type ProfileType = {
  prenom?: string;
  nom?: string;
  email?: string;
  organisation?: string;
};

export default function PropositionsModerationPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    async function fetchPropositions() {
      setLoading(true);
      
      try {
        // D'abord récupérer les propositions
        const { data: propositionsData, error: proposError } = await supabase
          .from("propositions")
          .select("*")
          .eq("statut", "en_attente")
          .order("created_at", { ascending: false });
          
        if (proposError) {
          console.error('Erreur propositions:', proposError);
          setError("Erreur lors du chargement des propositions.");
          setLoading(false);
          return;
        }

        // Ensuite récupérer les profils des créateurs
        const propositionsWithProfiles = [];
        
        for (const prop of propositionsData || []) {
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
          
          propositionsWithProfiles.push({
            ...prop,
            profiles: profileData
          });
        }

        console.log('✅ Propositions chargées avec succès:', propositionsWithProfiles.length);
        setPropositions(propositionsWithProfiles);
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement:', err);
        setError("Erreur lors du chargement des propositions.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPropositions();
  }, []);

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propositions à modérer</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          🚪 Se déconnecter
        </button>
      </div>
      {propositions.length === 0 ? (
        <div className="text-gray-600">Aucune proposition en attente.</div>
      ) : (
        <ul className="space-y-6">
          {propositions.map((p) => (
            <li key={p.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.action === 'create' ? 
                      `Création d'établissement${(p.payload as PropositionPayload)?.nom ? ` - ${(p.payload as PropositionPayload).nom}` : ''}` : 
                      p.action === 'update' ? 
                      `Modification d'établissement${(p.payload as PropositionPayload)?.nom ? ` - ${(p.payload as PropositionPayload).nom}` : ''}` :
                      p.type_cible
                    }
                  </h3>
                  <p className="text-sm text-gray-500">
                    Créée le {new Date(p.created_at).toLocaleDateString('fr-FR')} à {new Date(p.created_at).toLocaleTimeString('fr-FR')}
                    {(p.profiles as ProfileType) && ` par ${(p.profiles as ProfileType).prenom} ${(p.profiles as ProfileType).nom}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    p.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                    p.statut === 'approuvee' ? 'bg-green-100 text-green-800' :
                    p.statut === 'rejetee' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {p.statut}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.source === 'public' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {p.source}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="font-semibold text-gray-700">Action:</span>
                  <p className="text-gray-600">
                    {p.action === 'create' ? '🆕 Création' : 
                     p.action === 'update' ? '✏️ Modification' : p.action}
                  </p>
                </div>
                {(p.payload as PropositionPayload)?.habitat_type && (
                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <p className="text-gray-600">{(p.payload as PropositionPayload).habitat_type}</p>
                  </div>
                )}
                {(p.payload as PropositionPayload)?.ville && (
                  <div>
                    <span className="font-semibold text-gray-700">Ville:</span>
                    <p className="text-gray-600">{(p.payload as PropositionPayload).ville}</p>
                  </div>
                )}
              </div>

              {/* Afficher le payload s'il contient des informations */}
              {p.payload && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Détails de la proposition:</h4>
                  
                  {/* Informations du créateur */}
                  {(p.profiles as ProfileType) && (
                    <div className="bg-blue-50 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">👤 Créateur</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Nom:</span> {(p.profiles as ProfileType).prenom} {(p.profiles as ProfileType).nom}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {(p.profiles as ProfileType).email}
                        </div>
                        {(p.profiles as ProfileType).organisation && (
                          <div>
                            <span className="font-medium">Organisation:</span> {(p.profiles as ProfileType).organisation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations du proposeur (si différent) */}
                  {(p.payload as PropositionPayload).proposeur && (
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">📝 Proposeur (contact pour modifications)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Nom:</span> {(p.payload as PropositionPayload).proposeur?.nom || ''}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {(p.payload as PropositionPayload).proposeur?.email || ''}
                        </div>
                        {(p.payload as PropositionPayload).proposeur?.telephone && (
                          <div>
                            <span className="font-medium">Téléphone:</span> {(p.payload as PropositionPayload).proposeur?.telephone || ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photo proposée */}
                  {(p.payload as PropositionPayload).modifications?.nouvelle_photo_base64 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">📷 Photo proposée</h5>
                      <div className="flex items-start space-x-4">
                        <Image
                          src={(p.payload as PropositionPayload).modifications?.nouvelle_photo_base64 || ''}
                          alt="Photo proposée"
                          width={128}
                          height={96}
                          style={{objectFit:'cover',borderRadius:'0.5rem',border:'1px solid #e5e7eb'}}
                        />
                        <div className="text-sm text-blue-800">
                          <p><strong>Nom du fichier:</strong> {(p.payload as PropositionPayload).modifications?.nouvelle_photo_filename || 'Non spécifié'}</p>
                          <p className="mt-1">Proposition de nouvelle photo pour l&apos;établissement</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Autres modifications */}
                  {typeof (p.payload as PropositionPayload).modifications === 'object' &&
                    (p.payload as PropositionPayload).modifications &&
                    Object.keys((p.payload as PropositionPayload).modifications ?? {}).filter(k => !k.startsWith('nouvelle_photo')).length > 0 && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Autres modifications</h5>
                      <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries((p.payload as PropositionPayload).modifications ?? {}).filter(([k]) => !k.startsWith('nouvelle_photo'))
                            ), 
                            null, 2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link 
                  href={`/admin/propositions/${p.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  → Examiner en détail
                </Link>
                
                <div className="flex space-x-2">
                  {p.statut === 'en_attente' && (
                    <>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                        Approuver
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                        Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
