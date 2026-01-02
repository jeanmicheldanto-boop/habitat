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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  async function handleQuickModerate(propositionId: string, statut: 'approuvee' | 'rejetee') {
    setActionLoading(propositionId);
    try {
      // Récupérer la proposition
      const proposition = propositions.find(p => p.id === propositionId);
      if (!proposition) throw new Error('Proposition non trouvée');

      // Si approbation, créer l'établissement
      if (statut === 'approuvee' && proposition.type_cible === 'etablissement' && proposition.action === 'create') {
        const payload = proposition.payload as Record<string, unknown>;
        const etablissementData: Record<string, unknown> = {};
        
        const validFields = [
          'nom', 'presentation', 'adresse_l1', 'adresse_l2', 'code_postal', 
          'commune', 'code_insee', 'departement', 'region', 'pays',
          'statut_editorial', 'eligibilite_statut', 'public_cible',
          'source', 'url_source', 'date_observation', 'date_verification',
          'confiance_score', 'telephone', 'email', 'site_web', 
          'gestionnaire', 'habitat_type', 'image_path'
        ];
        
        for (const field of validFields) {
          if (payload[field] !== undefined && payload[field] !== null) {
            etablissementData[field] = payload[field];
          }
        }
        
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
        
        if (payload.latitude && payload.longitude) {
          etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
        }
        
        if (!etablissementData.statut_editorial) {
          etablissementData.statut_editorial = 'publie';
        }
        
        const { data: newEtab, error: createError } = await supabase
          .from("etablissements")
          .insert([etablissementData])
          .select()
          .single();
          
        if (createError) {
          console.error('Erreur création établissement:', createError);
          throw createError;
        }
        
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
        
        // Traiter la photo si elle existe dans un dossier temporaire
        if (payload.temp_etablissement_id && payload.image_path) {
          console.log('📸 Déplacement de la photo depuis le dossier temporaire');
          const tempId = payload.temp_etablissement_id as string;
          
          try {
            // Lister les fichiers dans le dossier temporaire
            const { data: tempFiles, error: listError } = await supabase.storage
              .from('etablissements')
              .list(tempId);
            
            if (!listError && tempFiles && tempFiles.length > 0) {
              const mainFile = tempFiles.find(f => f.name.startsWith('main.'));
              
              if (mainFile) {
                const oldPath = `${tempId}/${mainFile.name}`;
                const newPath = `${newEtab.id}/${mainFile.name}`;
                
                // Télécharger le fichier depuis le temp
                const { data: fileData, error: downloadError } = await supabase.storage
                  .from('etablissements')
                  .download(oldPath);
                
                if (!downloadError && fileData) {
                  // Uploader dans le nouveau dossier
                  const { error: uploadError } = await supabase.storage
                    .from('etablissements')
                    .upload(newPath, fileData, { upsert: true });
                  
                  if (!uploadError) {
                    // Mettre à jour image_path dans l'établissement
                    await supabase
                      .from('etablissements')
                      .update({ image_path: newPath })
                      .eq('id', newEtab.id);
                    
                    // Supprimer l'ancien fichier
                    await supabase.storage
                      .from('etablissements')
                      .remove([oldPath]);
                    
                    console.log('✅ Photo déplacée avec succès');
                  }
                }
              }
            }
          } catch (photoError) {
            console.error('⚠️ Erreur traitement photo:', photoError);
            // Ne pas bloquer l'approbation
          }
        }
        
        // Mettre à jour la proposition avec l'ID
        await supabase
          .from("propositions")
          .update({ etablissement_id: newEtab.id })
          .eq("id", propositionId);
      }

      // Mettre à jour le statut
      const { error } = await supabase
        .from('propositions')
        .update({ statut })
        .eq('id', propositionId);
      
      if (error) throw error;
      
      // Retirer la proposition de la liste
      setPropositions(prev => prev.filter(p => p.id !== propositionId));
    } catch (err) {
      console.error('Erreur lors de la modération:', err);
      alert(`Erreur lors de la modération: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setActionLoading(null);
    }
  }

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
                      <button 
                        onClick={() => handleQuickModerate(p.id, 'approuvee')}
                        disabled={actionLoading === p.id}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === p.id ? '...' : 'Approuver'}
                      </button>
                      <button 
                        onClick={() => handleQuickModerate(p.id, 'rejetee')}
                        disabled={actionLoading === p.id}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === p.id ? '...' : 'Rejeter'}
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
