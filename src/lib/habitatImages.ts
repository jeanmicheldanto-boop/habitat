import { findSousCategorieWithTolerance, normalizeString } from './habitatTaxonomy';

// Mapping centralisé des sous-catégories vers les images de fallback
export function getHabitatImage(sous_categories: string[] | null): string {
  if (!sous_categories || sous_categories.length === 0) {
    return "/habitat_alternatif.webp";
  }

  const premiereSousCategorie = sous_categories[0];
  
  // Mapping exact basé sur les clés de la taxonomie
  const imageMap: Record<string, string> = {
    // Résidence (bleu)
    'residence_autonomie': '/residence_autonomie.webp',
    'residence_services_seniors': '/residence_services_seniors.webp',
    'marpa': '/marpa.webp',
    
    // Habitat partagé (orange)
    'colocation_avec_services': '/colocation_avec_services.webp',
    'habitat_intergenerationnel': '/habitat_intergenerationnel.webp',
    'habitat_inclusif': '/habitat_inclusif.webp',
    'habitat_alternatif': '/habitat_alternatif.webp',
    'accueil_familial': '/accueil_familial.webp',
    'maison_accueil_familial': '/maison_accueil_familial.webp',
    
    // Logement indépendant (vert)
    'beguinage': '/beguinage.webp',
    'village_seniors': '/village_seniors.webp',
    'logement_adapte': '/habitat_alternatif.webp', // Pas d'image spécifique, fallback
    'habitat_regroupe': '/habitat_regroupe.webp'
  };

  // Recherche exacte par clé d'abord
  if (imageMap[premiereSousCategorie]) {
    return imageMap[premiereSousCategorie];
  }

  // Recherche avec tolérance (normalisation + aliases)
  const foundSousCategorie = findSousCategorieWithTolerance(premiereSousCategorie);
  if (foundSousCategorie && imageMap[foundSousCategorie.key]) {
    return imageMap[foundSousCategorie.key];
  }

  // Recherche par mots-clés dans le nom avec normalisation
  const normalized = normalizeString(premiereSousCategorie);
  
  if (normalized.includes('colocation')) {
    return '/colocation_avec_services.webp';
  }
  if (normalized.includes('intergenerationnel') || normalized.includes('intergénérationnel')) {
    return '/habitat_intergenerationnel.webp';
  }
  if (normalized.includes('beguinage') || normalized.includes('béguinage')) {
    return '/beguinage.webp';
  }
  if (normalized.includes('regroupe') || normalized.includes('regroupé')) {
    return '/habitat_regroupe.webp';
  }
  if (normalized.includes('inclusif')) {
    return '/habitat_inclusif.webp';
  }
  if (normalized.includes('residence') && normalized.includes('service')) {
    return '/residence_services_seniors.webp';
  }
  if (normalized.includes('residence') && normalized.includes('autonomie')) {
    return '/residence_autonomie.webp';
  }
  if (normalized.includes('village')) {
    return '/village_seniors.webp';
  }
  if (normalized.includes('marpa')) {
    return '/marpa.webp';
  }
  if (normalized.includes('accueil') && normalized.includes('familial')) {
    return '/accueil_familial.webp';
  }
  if (normalized.includes('maison') && normalized.includes('accueil')) {
    return '/maison_accueil_familial.webp';
  }
  if (normalized.includes('adapte') || normalized.includes('adapté')) {
    return '/habitat_alternatif.webp';
  }

  // Image par défaut si aucune correspondance
  return '/habitat_alternatif.webp';
}
