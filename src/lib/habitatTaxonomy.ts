// Taxonomie des types d'habitat - Mapping centralisé selon les spécifications
export interface HabitatCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  sousCategories: SousCategorie[];
}

export interface SousCategorie {
  key: string;
  label: string;
  aliases?: string[];
}

// MAPPING CENTRAL : chaque habitat_type avec ses sous-catégories exactes
export const HABITAT_TAXONOMY: HabitatCategory[] = [
  {
    key: "residence",
    label: "Résidence",
    icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='4' y='2' width='16' height='20' rx='2'/><path d='M9 22v-4h6v4'/><line x1='8' y1='6' x2='8' y2='6.01'/><line x1='12' y1='6' x2='12' y2='6.01'/><line x1='16' y1='6' x2='16' y2='6.01'/><line x1='8' y1='10' x2='8' y2='10.01'/><line x1='12' y1='10' x2='12' y2='10.01'/><line x1='16' y1='10' x2='16' y2='10.01'/><line x1='8' y1='14' x2='8' y2='14.01'/><line x1='12' y1='14' x2='12' y2='14.01'/><line x1='16' y1='14' x2='16' y2='14.01'/></svg>",
    color: "#0074d9", // Bleu
    sousCategories: [
      {
        key: "residence_autonomie",
        label: "Résidence autonomie",
        aliases: ["ra", "foyer-logement", "résidence autonomie"]
      },
      {
        key: "residence_services_seniors",
        label: "Résidence services seniors",
        aliases: ["résidence services", "résidence services séniors", "résidence service séniors"]
      },
      {
        key: "marpa",
        label: "MARPA",
        aliases: ["marpa"]
      }
    ]
  },
  {
    key: "habitat_partage",
    label: "Habitat partagé",
    icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>",
    color: "#ff851b", // Orange
    sousCategories: [
      {
        key: "colocation_avec_services",
        label: "Colocation avec services",
        aliases: ["colocation"]
      },
      {
        key: "habitat_intergenerationnel",
        label: "Habitat intergénérationnel",
        aliases: ["intergénérationnel", "intergenerationnel"]
      },
      {
        key: "habitat_inclusif",
        label: "Habitat inclusif",
        aliases: ["inclusif"]
      },
      {
        key: "habitat_alternatif",
        label: "Habitat alternatif",
        aliases: ["alternatif", "autre", "maison partagée"]
      },
      {
        key: "accueil_familial",
        label: "Accueil familial",
        aliases: ["accueil"]
      },
      {
        key: "maison_accueil_familial",
        label: "Maison d'accueil familial",
        aliases: ["maf", "maison accueil"]
      }
    ]
  },
  {
    key: "logement_independant",
    label: "Logement indépendant",
    icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>",
    color: "#2e8b57", // Vert
    sousCategories: [
      {
        key: "beguinage",
        label: "Béguinage",
        aliases: ["béguinage"]
      },
      {
        key: "village_seniors",
        label: "Village seniors",
        aliases: ["village senior", "village"]
      },
      {
        key: "logement_adapte",
        label: "Logement adapté",
        aliases: ["logement adapté", "adapte"]
      },
      {
        key: "habitat_regroupe",
        label: "Habitat regroupé",
        aliases: ["habitat regroupé", "regroupe", "regroupé"]
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

// Fonction pour obtenir l'habitat_type à partir d'une sous-catégorie
export const getHabitatTypeFromSousCategorie = (sousCategorieKey: string): string | null => {
  const parentCategory = getParentCategoryBySousCategorie(sousCategorieKey);
  return parentCategory ? parentCategory.key : null;
};

// Fonction pour vérifier si une sous-catégorie appartient à un habitat_type
export const doesSousCategorieMatchHabitatType = (sousCategorieKey: string, habitatType: string): boolean => {
  const parentCategory = getParentCategoryBySousCategorie(sousCategorieKey);
  return parentCategory ? parentCategory.key === habitatType : false;
};

// Fonction pour normaliser les noms (tolérance casse/accents)
export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Fonction pour rechercher une sous-catégorie avec tolérance
export const findSousCategorieWithTolerance = (search: string): SousCategorie | undefined => {
  const normalizedSearch = normalizeString(search);
  
  return getAllSousCategories().find(sc => {
    // Vérifier d'abord par key exact (le plus fiable)
    if (sc.key === search || normalizeString(sc.key) === normalizedSearch) return true;
    
    // Vérifier le label principal
    if (normalizeString(sc.label).includes(normalizedSearch) || normalizedSearch.includes(normalizeString(sc.label))) return true;
    
    // Vérifier les aliases
    if (sc.aliases) {
      return sc.aliases.some(alias => 
        normalizeString(alias).includes(normalizedSearch) || normalizedSearch.includes(normalizeString(alias))
      );
    }
    
    return false;
  });
};

// Obtenir la couleur d'une sous-catégorie selon le mapping centralisé
export const getSousCategorieColor = (sousCategorieKey: string): string => {
  // Utiliser la couleur de la catégorie parent selon le nouveau mapping
  const parentCategory = getParentCategoryBySousCategorie(sousCategorieKey);
  if (parentCategory && parentCategory.color) {
    return parentCategory.color;
  }
  
  // Couleur par défaut (gris)
  return "#888";
};

// Obtenir la couleur d'un habitat_type
export const getHabitatTypeColor = (habitatTypeKey: string): string => {
  const category = getCategoryByKey(habitatTypeKey);
  return category ? category.color : "#888";
};
