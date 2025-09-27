// Mapping des sous-catégories vers les images de fallback
export function getHabitatImage(sous_categories: string[] | null): string {
  if (!sous_categories || sous_categories.length === 0) {
    return "/habitat_alternatif.webp";
  }

  const premiereSousCategorie = sous_categories[0].toLowerCase();
  
  // Mapping basé sur les noms des fichiers images dans public/
  const imageMap: Record<string, string> = {
    // Habitat partagé/communautaire
    'colocation_avec_services': '/colocation_avec_services.webp',
    'habitat_intergenerationnel': '/habitat_intergenerationnel.webp',
    'beguinage': '/beguinage.webp',
    'habitat_regroupe': '/habitat_regroupe.webp',
    'habitat_inclusif': '/habitat_inclusif.webp',
    
    // Résidences avec services
    'residence_services_seniors': '/residence_services_seniors.webp',
    'residence_autonomie': '/residence_autonomie.webp',
    'village_seniors': '/village_seniors.webp',
    
    // Structures spécialisées
    'marpa': '/marpa.webp',
    'accueil_familial': '/accueil_familial.webp',
    'maison_accueil_familial': '/maison_accueil_familial.webp',
    
    // Fallback par défaut
    'habitat_alternatif': '/habitat_alternatif.webp'
  };

  // Recherche exacte d'abord
  if (imageMap[premiereSousCategorie]) {
    return imageMap[premiereSousCategorie];
  }

  // Recherche par mots-clés si pas de correspondance exacte
  if (premiereSousCategorie.includes('colocation')) {
    return '/colocation_avec_services.webp';
  }
  if (premiereSousCategorie.includes('intergenerationnel')) {
    return '/habitat_intergenerationnel.webp';
  }
  if (premiereSousCategorie.includes('beguinage')) {
    return '/beguinage.webp';
  }
  if (premiereSousCategorie.includes('regroupe')) {
    return '/habitat_regroupe.webp';
  }
  if (premiereSousCategorie.includes('inclusif')) {
    return '/habitat_inclusif.webp';
  }
  if (premiereSousCategorie.includes('residence') && premiereSousCategorie.includes('service')) {
    return '/residence_services_seniors.webp';
  }
  if (premiereSousCategorie.includes('residence') && premiereSousCategorie.includes('autonomie')) {
    return '/residence_autonomie.webp';
  }
  if (premiereSousCategorie.includes('village')) {
    return '/village_seniors.webp';
  }
  if (premiereSousCategorie.includes('marpa')) {
    return '/marpa.webp';
  }
  if (premiereSousCategorie.includes('accueil') && premiereSousCategorie.includes('familial')) {
    return '/accueil_familial.webp';
  }
  if (premiereSousCategorie.includes('maison') && premiereSousCategorie.includes('accueil')) {
    return '/maison_accueil_familial.webp';
  }

  // Image par défaut si aucune correspondance
  return '/habitat_alternatif.webp';
}