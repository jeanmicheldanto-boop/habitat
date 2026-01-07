/**
 * Helper pour la création d'établissements depuis les propositions
 * Gère la normalisation des données et la conversion des sous-catégories
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://minwoumfgutampcgrcbr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface PropositionPayload {
  nom?: string;
  description?: string;
  presentation?: string;
  adresse?: string;
  adresse_l1?: string;
  adresse_l2?: string;
  ville?: string;
  commune?: string;
  code_postal?: string;
  departement?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  site_web?: string;
  habitat_type?: string;
  gestionnaire?: string;
  sous_categories?: string[];
  equipements?: string[];
  services?: string[];
  image_path?: string;
  photo_url?: string;
  [key: string]: unknown;
}

export interface CreateEtablissementResult {
  success: boolean;
  etablissement_id?: string;
  error?: string;
  details?: {
    sous_categories_created?: number;
    services_created?: number;
    equipements_created?: number;
  };
}

/**
 * Convertit les clés de sous-catégories (frontend) en UUIDs (base de données)
 */
export async function convertSousCategoriesToUUIDs(
  sousCategories: string[],
  supabaseClient?: ReturnType<typeof createClient>
): Promise<string[]> {
  const supabase = supabaseClient || createClient(supabaseUrl, supabaseKey);
  
  if (!sousCategories || sousCategories.length === 0) {
    return [];
  }

  // Récupérer toutes les sous-catégories de la base
  const { data: allSousCategories, error } = await supabase
    .from('sous_categories')
    .select('id, slug');

  if (error || !allSousCategories) {
    console.error('❌ Erreur récupération sous-catégories:', error);
    return [];
  }

  // Créer un map clé → UUID (utilise slug au lieu de libelle)
  const keyToUuidMap = new Map<string, string>();
  (allSousCategories as Array<{ id: string; slug: string | null }>).forEach(sc => {
    if (sc.slug) {
      keyToUuidMap.set(sc.slug.toLowerCase().trim(), sc.id);
    }
  });

  // Convertir les clés en UUIDs
  const uuids: string[] = [];
  const notFound: string[] = [];

  for (const key of sousCategories) {
    const normalizedKey = key.toLowerCase().trim();
    const uuid = keyToUuidMap.get(normalizedKey);
    
    if (uuid) {
      uuids.push(uuid);
    } else {
      notFound.push(key);
    }
  }

  if (notFound.length > 0) {
    console.warn('⚠️ Sous-catégories non trouvées:', notFound);
  }

  return uuids;
}

/**
 * Crée un établissement à partir d'un payload de proposition
 */
export async function createEtablissementFromProposition(
  payload: PropositionPayload,
  createdBy?: string,
  supabaseClient?: ReturnType<typeof createClient>
): Promise<CreateEtablissementResult> {
  const supabase = supabaseClient || createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Préparer les données de l'établissement
    const etablissementData: Record<string, unknown> = {
      nom: payload.nom,
      presentation: payload.description || payload.presentation || null,
      adresse_l1: payload.adresse_l1 || payload.adresse,
      adresse_l2: payload.adresse_l2 || null,
      code_postal: payload.code_postal,
      commune: payload.commune || payload.ville,
      departement: payload.departement,
      telephone: payload.telephone,
      email: payload.email,
      site_web: payload.site_web || null,
      habitat_type: payload.habitat_type,
      statut_editorial: 'publie',
      eligibilite_statut: 'a_verifier',
      image_path: payload.image_path || null  // ✅ NOUVEAU : Photo principale
    };

    // Géolocalisation
    if (payload.latitude && payload.longitude) {
      etablissementData.geom = `POINT(${payload.longitude} ${payload.latitude})`;
    }

    // Gestionnaire
    if (payload.gestionnaire) {
      const { data: gestionnaires } = await supabase
        .from('gestionnaires')
        .select('id, nom')
        .ilike('nom', payload.gestionnaire)
        .limit(1);
      
      if (gestionnaires && gestionnaires.length > 0) {
        etablissementData.gestionnaire = (gestionnaires[0] as { id: string; nom: string }).id;
      }
    }

    // 2. Créer l'établissement
    const { data: newEtab, error: createError } = await (supabase as any)
      .from('etablissements')
      .insert([etablissementData])
      .select()
      .single();

    if (createError || !newEtab) {
      return {
        success: false,
        error: createError?.message || 'Erreur création établissement'
      };
    }

    const result: CreateEtablissementResult = {
      success: true,
      etablissement_id: (newEtab as { id: string }).id,
      details: {}
    };

    // 3. Créer une entrée dans medias si image_path existe (pour cohérence future multi-images)
    if (payload.image_path) {
      const { error: mediaError } = await (supabase as any)
        .from('medias')
        .insert([{
          etablissement_id: (newEtab as { id: string }).id,
          storage_path: payload.image_path,
          priority: 1000, // Haute priorité = photo principale
          alt_text: `Photo de ${payload.nom}`
        }]);
      
      if (mediaError) {
        console.warn('⚠️ Erreur création media (non bloquant):', mediaError);
      }
    }

    // 4. Traiter les sous-catégories
    if (Array.isArray(payload.sous_categories) && payload.sous_categories.length > 0) {
      const sousCategoriesUUIDs = await convertSousCategoriesToUUIDs(
        payload.sous_categories,
        supabase
      );

      if (sousCategoriesUUIDs.length > 0) {
        const links = sousCategoriesUUIDs.map(uuid => ({
          etablissement_id: (newEtab as { id: string }).id,
          sous_categorie_id: uuid
        }));

        const { error: linkError } = await (supabase as any)
          .from('etablissement_sous_categorie')
          .insert(links);

        if (!linkError) {
          result.details!.sous_categories_created = links.length;
        }
      }
    }

    // 4. TODO: Traiter les services et équipements si nécessaire

    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Récupère le mapping complet des sous-catégories
 */
export async function getSousCategoriesMap(
  supabaseClient?: ReturnType<typeof createClient>
): Promise<Map<string, string>> {
  const supabase = supabaseClient || createClient(supabaseUrl, supabaseKey);
  
  const { data: sousCategories } = await supabase
    .from('sous_categories')
    .select('id, libelle');

  const map = new Map<string, string>();
  
  if (sousCategories) {
    sousCategories.forEach((sc: { id: string; libelle: string }) => {
      map.set(sc.libelle.toLowerCase().trim(), sc.id);
    });
  }

  return map;
}
