// Nouvelle taxonomie des types d'habitat
export interface HabitatCategory {
  key: string;
  label: string;
  icon: string;
  sousCategories: SousCategorie[];
}

export interface SousCategorie {
  key: string;
  label: string;
  aliases?: string[];
}

export const HABITAT_TAXONOMY: HabitatCategory[] = [
  {
    key: "habitat_individuel",
    label: "Habitat individuel",
    icon: "🏠",
    sousCategories: [
      {
        key: "beguinage",
        label: "Béguinage"
      },
      {
        key: "habitat_regroupe",
        label: "Habitat regroupé"
      },
      {
        key: "village_seniors",
        label: "Village seniors"
      }
    ]
  },
  {
    key: "habitat_partage",
    label: "Habitat partagé", 
    icon: "👥",
    sousCategories: [
      {
        key: "accueil_familial",
        label: "Accueil familial"
      },
      {
        key: "colocation_avec_services",
        label: "Colocation avec services"
      },
      {
        key: "habitat_alternatif",
        label: "Habitat alternatif"
      },
      {
        key: "habitat_inclusif",
        label: "Habitat inclusif"
      },
      {
        key: "habitat_intergenerationnel",
        label: "Habitat intergénérationnel",
        aliases: ["intergénérationnel"]
      },
      {
        key: "maison_accueil_familial",
        label: "Maison d'accueil familial"
      }
    ]
  },
  {
    key: "logement_individuel_en_residence", 
    label: "Logement individuel en résidence",
    icon: "🏢",
    sousCategories: [
      {
        key: "marpa",
        label: "MARPA"
      },
      {
        key: "residence_autonomie",
        label: "Résidence autonomie",
        aliases: ["ra", "foyer-logement"]
      },
      {
        key: "residence_services_seniors",
        label: "Résidence services seniors",
        aliases: ["résidence services"]
      }
    ]
  }
];

// Fonctions utilitaires pour la taxonomie

// Obtenir toutes les sous-catégories aplaties
export const getAllSousCategories = (): SousCategorie[] => {
  return HABITAT_TAXONOMY.flatMap(cat => cat.sousCategories);
};

// Obtenir une catégorie par sa clé
export const getCategoryByKey = (key: string): HabitatCategory | undefined => {
  return HABITAT_TAXONOMY.find(cat => cat.key === key);
};

// Obtenir une sous-catégorie par sa clé
export const getSousCategorieByKey = (key: string): SousCategorie | undefined => {
  return getAllSousCategories().find(sc => sc.key === key);
};

// Obtenir la catégorie parent d'une sous-catégorie
export const getParentCategoryBySousCategorie = (sousCategorieKey: string): HabitatCategory | undefined => {
  return HABITAT_TAXONOMY.find(cat => 
    cat.sousCategories.some(sc => sc.key === sousCategorieKey)
  );
};

// Rechercher une sous-catégorie par label ou alias
export const findSousCategorieByLabelOrAlias = (search: string): SousCategorie | undefined => {
  const normalizedSearch = search.toLowerCase().trim();
  
  return getAllSousCategories().find(sc => {
    // Vérifier le label principal
    if (sc.label.toLowerCase() === normalizedSearch) return true;
    
    // Vérifier les aliases
    if (sc.aliases) {
      return sc.aliases.some(alias => alias.toLowerCase() === normalizedSearch);
    }
    
    return false;
  });
};

// Mapper les anciennes valeurs vers les nouvelles clés
export const MIGRATION_MAP: Record<string, string> = {
  // Anciens habitat_type vers nouvelles catégories
  "logement_independant": "habitat_individuel",
  "residence": "logement_individuel_en_residence", 
  "habitat_partage": "habitat_partage",
  
  // Anciennes sous-catégories vers nouvelles clés
  "résidence autonomie": "residence_autonomie",
  "résidence services": "residence_services_seniors",
  "résidence service séniors": "residence_services_seniors",
  "colocation": "colocation_avec_services",
  "maison partagée": "habitat_alternatif",
  "béguinage": "beguinage",
  "ehpad": "residence_autonomie", // À revoir selon le contexte
  "foyer logement": "residence_autonomie",
  "habitat inclusif": "habitat_inclusif",
  "accueil familial": "accueil_familial",
  "logement accompagné": "habitat_inclusif",
  "autre": "habitat_alternatif"
};

// Couleurs pour l'affichage des catégories et sous-catégories
export const CATEGORY_COLORS: Record<string, string> = {
  // Catégories principales
  "habitat_individuel": "#2b7fa8",
  "habitat_partage": "#2ba85b", 
  "logement_individuel_en_residence": "#a85b2b",
  
  // Sous-catégories spécifiques (optionnel, hérite de la catégorie parent sinon)
  "beguinage": "#2b7fa8", // Maintenant couleur habitat_individuel
  "residence_autonomie": "#a85b2b",
  "residence_services_seniors": "#2b7fa8",
  "marpa": "#a85b2b",
  "habitat_inclusif": "#2ba8a8",
  "accueil_familial": "#8b4513",
  "habitat_intergenerationnel": "#9932cc",
};

// Obtenir la couleur d'une sous-catégorie
export const getSousCategorieColor = (sousCategorieKey: string): string => {
  // Vérifier d'abord si la sous-catégorie a une couleur spécifique
  if (CATEGORY_COLORS[sousCategorieKey]) {
    return CATEGORY_COLORS[sousCategorieKey];
  }
  
  // Sinon, utiliser la couleur de la catégorie parent
  const parentCategory = getParentCategoryBySousCategorie(sousCategorieKey);
  if (parentCategory && CATEGORY_COLORS[parentCategory.key]) {
    return CATEGORY_COLORS[parentCategory.key];
  }
  
  // Couleur par défaut
  return "#888";
};