import { supabase } from './supabaseClient';

/**
 * Fonction whitelistée : Rechercher des établissements avec filtres
 */
export async function recherche_etablissements(params: {
  commune?: string;
  departement?: string;
  region?: string;
  sous_categorie?: string;
  habitat_type?: string;
  fourchette_prix?: 'euro' | 'deux_euros' | 'trois_euros';
  prix_max?: number;
  services?: string[];
  public_cible?: string[];
  avp_eligible?: boolean;
  limit?: number;
}) {
  const {
    commune,
    departement,
    region,
    sous_categorie,
    habitat_type,
    fourchette_prix,
    prix_max,
    services,
    public_cible,
    avp_eligible,
    limit = 10,
  } = params;

  let query = supabase
    .from('v_liste_publication')
    .select('etab_id, nom, commune, departement, region, sous_categories, fourchette_prix, prix_min, prix_max, services, public_cible, eligibilite_statut, telephone, email, site_web, presentation, image_path');

  // Filtres texte avec ILIKE
  if (commune) {
    query = query.ilike('commune', `%${commune}%`);
  }
  if (departement) {
    query = query.ilike('departement', `%${departement}%`);
  }
  if (region) {
    query = query.ilike('region', `%${region}%`);
  }
  if (habitat_type) {
    query = query.ilike('habitat_type', `%${habitat_type}%`);
  }

  // Filtre sous-catégorie (array contains)
  if (sous_categorie) {
    query = query.contains('sous_categories', [sous_categorie]);
  }

  // Filtre prix
  if (fourchette_prix) {
    query = query.eq('fourchette_prix', fourchette_prix);
  }
  if (prix_max && typeof prix_max === 'number') {
    query = query.lte('prix_max', prix_max);
  }

  // Filtre services (array intersection)
  if (services && services.length > 0) {
    query = query.contains('services', services);
  }

  // Filtre public cible (array intersection)
  if (public_cible && public_cible.length > 0) {
    query = query.contains('public_cible', public_cible);
  }

  // Filtre AVP éligible
  if (avp_eligible === true) {
    query = query.eq('eligibilite_statut', 'avp_eligible');
  }

  // Limite
  const finalLimit = Math.min(limit, 20); // Max 20
  query = query.limit(finalLimit);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erreur recherche: ${error.message}`);
  }

  return data || [];
}

/**
 * Fonction whitelistée : Compter les établissements avec filtres
 */
export async function compter_etablissements(params: {
  commune?: string;
  departement?: string;
  region?: string;
  sous_categorie?: string;
  habitat_type?: string;
  fourchette_prix?: 'euro' | 'deux_euros' | 'trois_euros';
  prix_max?: number;
  services?: string[];
  public_cible?: string[];
  avp_eligible?: boolean;
}) {
  const {
    commune,
    departement,
    region,
    sous_categorie,
    habitat_type,
    fourchette_prix,
    prix_max,
    services,
    public_cible,
    avp_eligible,
  } = params;

  let query = supabase
    .from('v_liste_publication')
    .select('*', { count: 'exact', head: true });

  // Filtres identiques à recherche_etablissements
  if (commune) {
    query = query.ilike('commune', `%${commune}%`);
  }
  if (departement) {
    query = query.ilike('departement', `%${departement}%`);
  }
  if (region) {
    query = query.ilike('region', `%${region}%`);
  }
  if (habitat_type) {
    query = query.ilike('habitat_type', `%${habitat_type}%`);
  }
  if (sous_categorie) {
    query = query.contains('sous_categories', [sous_categorie]);
  }
  if (fourchette_prix) {
    query = query.eq('fourchette_prix', fourchette_prix);
  }
  if (prix_max && typeof prix_max === 'number') {
    query = query.lte('prix_max', prix_max);
  }
  if (services && services.length > 0) {
    query = query.contains('services', services);
  }
  if (public_cible && public_cible.length > 0) {
    query = query.contains('public_cible', public_cible);
  }
  if (avp_eligible === true) {
    query = query.eq('eligibilite_statut', 'avp_eligible');
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Erreur comptage: ${error.message}`);
  }

  return { count: count || 0 };
}

/**
 * Fonction whitelistée : Obtenir le détail complet d'un établissement
 */
export async function obtenir_detail_etablissement(etab_id: string) {
  const { data, error } = await supabase
    .from('v_liste_publication')
    .select('*')
    .eq('etab_id', etab_id)
    .single();

  if (error) {
    throw new Error(`Erreur détail établissement: ${error.message}`);
  }

  return data;
}
