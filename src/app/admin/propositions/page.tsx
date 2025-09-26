"use client";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"];
export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

export default function PropositionsModerationPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPropositions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("propositions")
        .select("*")
        .eq("statut", "en_attente")
        .order("created_at", { ascending: false });
      if (error) {
        setError("Erreur lors du chargement des propositions.");
        setLoading(false);
        return;
      }
      setPropositions(data || []);
      setLoading(false);
    }
    fetchPropositions();
  }, []);

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Propositions à modérer</h1>
      {propositions.length === 0 ? (
        <div className="text-gray-600">Aucune proposition en attente.</div>
      ) : (
        <ul className="space-y-6">
          {propositions.map((p) => (
            <li key={p.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.type_cible === 'etablissement' ? 'Modification d\'établissement' : p.type_cible}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Créée le {new Date(p.created_at).toLocaleDateString('fr-FR')} à {new Date(p.created_at).toLocaleTimeString('fr-FR')}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-semibold text-gray-700">Établissement ID:</span>
                  <p className="text-gray-600 font-mono text-sm">{p.etablissement_id}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Action:</span>
                  <p className="text-gray-600">{p.action}</p>
                </div>
              </div>

              {/* Afficher le payload s'il contient des informations */}
              {p.payload && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Détails de la proposition:</h4>
                  
                  {/* Informations du proposeur */}
                  {(p.payload as any).proposeur && (
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Proposeur</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Nom:</span> {(p.payload as any).proposeur.nom}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {(p.payload as any).proposeur.email}
                        </div>
                        {(p.payload as any).proposeur.telephone && (
                          <div>
                            <span className="font-medium">Téléphone:</span> {(p.payload as any).proposeur.telephone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photo proposée */}
                  {(p.payload as any).modifications?.nouvelle_photo_base64 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">📷 Photo proposée</h5>
                      <div className="flex items-start space-x-4">
                        <img 
                          src={(p.payload as any).modifications.nouvelle_photo_base64}
                          alt="Photo proposée"
                          className="w-32 h-24 object-cover rounded border border-gray-200"
                        />
                        <div className="text-sm text-blue-800">
                          <p><strong>Nom du fichier:</strong> {(p.payload as any).modifications.nouvelle_photo_filename || 'Non spécifié'}</p>
                          <p className="mt-1">Proposition de nouvelle photo pour l'établissement</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Autres modifications */}
                  {(p.payload as any).modifications && Object.keys((p.payload as any).modifications).filter(k => !k.startsWith('nouvelle_photo')).length > 0 && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Autres modifications</h5>
                      <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries((p.payload as any).modifications).filter(([k]) => !k.startsWith('nouvelle_photo'))
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
