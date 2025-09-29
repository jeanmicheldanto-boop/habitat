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
    icon: "🏢",
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
    icon: "👥",
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
    icon: "🏠",
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
export const normalizeString = (str: string): string => {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Fonction pour rechercher une sous-catégorie avec tolérance
export const findSousCategorieWithTolerance = (search: string): SousCategorie | undefined => {
  const normalizedSearch = normalizeString(search);
  
  return getAllSousCategories().find(sc => {
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
