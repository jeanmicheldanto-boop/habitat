# Guide des filtres SQL pour la vue v_liste_publication

## Vue principale : `v_liste_publication`

Cette vue contient **tous les établissements publiés** avec des données enrichies.

---

## Colonnes disponibles

### Identification & localisation
- `etab_id` : UUID unique de l'établissement
- `nom` : Nom de l'établissement
- `commune` : Ville (ex: "Paris", "Lyon", "Tarbes")
- `departement` : Département (ex: "Hauts-de-Seine", "Finistère", "Hautes-Pyrénées")
- `region` : Région (ex: "Île-de-France", "Bretagne", "Occitanie")
- `code_postal` : Code postal (ex: "75001", "65000")
- `pays` : Pays (généralement "France")
- `geom` : Géolocalisation (latitude/longitude PostGIS)
- `geocode_precision` : Précision géolocalisée ("adresse_exacte", "commune", etc.)

### Contact
- `telephone` : Numéro de téléphone
- `email` : Email de contact
- `site_web` : URL du site web

### Classification
- `habitat_type` : Type d'habitat (valeurs: "beguinage", "residence", "colocation", "inclusif", etc.)
- `sous_categories` : **ARRAY de texte** (ex: ["Béguinage", "Habitat inclusif", "Colocation seniors"])
  - Valeurs possibles : "Béguinage", "Habitat inclusif", "Colocation seniors", "MARPA", "Résidence autonomie", "Résidence services seniors", "Village seniors", "Accueil familial", "Habitat intergénérationnel", etc.

### Public & services
- `public_cible` : **ARRAY de texte** (ex: ["personnes âgées", "adultes isolés"])
  - Valeurs : "familles", "jeunes", "personnes âgées", "personnes en situation de handicap", "adultes isolés", "public mixte", "autre"
- `services` : **ARRAY de texte** (ex: ["Animation", "Aide à domicile", "Restauration collective"])
  - Services courants : "Animation", "Aide à domicile", "Restauration collective", "Portage de repas", "Blanchisserie", "Coiffure", "Soins", "Animations culturelles", etc.

### Tarifs
- `fourchette_prix` : Enum ("euro", "deux_euros", "trois_euros")
  - `"euro"` : < 750€/mois
  - `"deux_euros"` : 750€ – 1500€/mois
  - `"trois_euros"` : > 1500€/mois
- `prix_min` : Prix minimum en euros (INTEGER)
- `prix_max` : Prix maximum en euros (INTEGER)

### Disponibilité
- `statut_disponibilite` : Enum ("disponible", "liste_attente", "complet", "sur_demande")
- `nb_unites_dispo` : Nombre d'unités disponibles (INTEGER)

### AVP (Allocation Vie Partagée)
- `eligibilite_statut` : Enum ("avp_eligible", "a_verifier", "non_eligible")
  - **Important** : `eligibilite_statut = 'avp_eligible'` signifie habitat inclusif avec AVP
- `avp_statut` : Statut AVP détaillé (si applicable)
- `avp_date_ouverture` : Date d'ouverture du dispositif AVP
- `avp_pvsp_present` : Boolean (présence d'un PVSP - Projet de Vie Sociale et Partagée)

### Restauration
- `kitchenette` : Boolean (présence d'une kitchenette dans les logements)
- `resto_collectif_midi` : Boolean (restauration collective le midi)
- `resto_collectif` : Boolean (restauration collective en général)
- `portage_repas` : Boolean (service de portage de repas)

### Logements
- `logements_types` : JSON avec détails des types de logements
  - Structure : `[{"libelle": "T1", "surface_min": 25, "surface_max": 35, "meuble": true, "pmr": false, "domotique": false, "nb_unites": 10}, ...]`

### Contenu
- `presentation` : Texte de présentation de l'établissement (peut être long)
- `image_path` : Chemin de l'image principale (storage Supabase)

---

## Exemples de requêtes SQL pour le chatbot

### 1. Recherche par département
```sql
SELECT nom, commune, sous_categories, fourchette_prix
FROM v_liste_publication
WHERE departement ILIKE '%Seine-Maritime%'
LIMIT 10
```

### 2. Habitats inclusifs éligibles AVP
```sql
SELECT nom, commune, departement, sous_categories, prix_min, prix_max
FROM v_liste_publication
WHERE eligibilite_statut = 'avp_eligible'
  AND sous_categories @> ARRAY['Habitat inclusif']
LIMIT 10
```

### 3. Recherche par commune
```sql
SELECT nom, sous_categories, fourchette_prix, telephone, email
FROM v_liste_publication
WHERE commune ILIKE '%Paris%'
LIMIT 10
```

### 4. Filtrage par fourchette de prix
```sql
SELECT nom, commune, departement, prix_min, prix_max
FROM v_liste_publication
WHERE fourchette_prix = 'euro'  -- Moins de 750€
  AND sous_categories && ARRAY['Résidence autonomie', 'MARPA']
LIMIT 10
```

### 5. Recherche avec services spécifiques
```sql
SELECT nom, commune, services, telephone
FROM v_liste_publication
WHERE services @> ARRAY['Animation', 'Aide à domicile']
  AND departement ILIKE '%Hautes-Pyrénées%'
LIMIT 10
```

### 6. Comptage par département
```sql
SELECT COUNT(*) as nb_etablissements
FROM v_liste_publication
WHERE departement ILIKE '%Finistère%'
```

### 7. Recherche multi-critères
```sql
SELECT nom, commune, sous_categories, fourchette_prix, services
FROM v_liste_publication
WHERE departement ILIKE '%Gironde%'
  AND fourchette_prix IN ('euro', 'deux_euros')
  AND public_cible @> ARRAY['personnes âgées']
LIMIT 10
```

---

## Opérateurs PostgreSQL pour les arrays

- `@>` : Contient (ex: `sous_categories @> ARRAY['Béguinage']`)
- `&&` : Intersection (ex: `services && ARRAY['Animation', 'Restauration collective']`)
- `=` : Égalité stricte (rarement utilisé pour arrays)
- `ARRAY[]::text[]` : Array vide

---

## Conseils pour construire les requêtes

1. **TOUJOURS utiliser ILIKE pour les textes** : `departement ILIKE '%Finistère%'`
   - Insensible à la casse
   - Gère les accents automatiquement (PostgreSQL FR)

2. **Limiter les résultats** : Toujours utiliser `LIMIT 10` (ou 20 max)

3. **Typer les arrays** : `ARRAY['Béguinage']::text[]` si nécessaire

4. **Recherche partielle sur nom** : `nom ILIKE '%marpa%'`

5. **Combiner avec AND/OR** : 
   ```sql
   WHERE (departement ILIKE '%Finistère%' OR departement ILIKE '%Côtes%')
     AND fourchette_prix = 'euro'
   ```

6. **Vérifier NULL** : `prix_min IS NOT NULL`

7. **Tri** : `ORDER BY prix_min ASC` ou `ORDER BY nom ASC`

---

## Fonctions SQL whitelistées pour le chatbot

Le chatbot peut uniquement appeler ces fonctions pré-définies (JAMAIS de SQL brut) :

### `recherche_etablissements`
**Paramètres** :
- `commune?: string` (optionnel, ILIKE)
- `departement?: string` (optionnel, ILIKE)
- `region?: string` (optionnel, ILIKE)
- `sous_categorie?: string` (optionnel, filter sur array)
- `habitat_type?: string` (optionnel, ILIKE)
- `fourchette_prix?: "euro" | "deux_euros" | "trois_euros"` (optionnel)
- `prix_max?: number` (optionnel, filtre <= prix_max)
- `services?: string[]` (optionnel, array contains)
- `public_cible?: string[]` (optionnel, array contains)
- `avp_eligible?: boolean` (optionnel, filtre eligibilite_statut = 'avp_eligible')
- `limit?: number` (optionnel, défaut: 10, max: 20)

**Retour** : Array d'établissements avec colonnes principales

### `compter_etablissements`
**Paramètres** : Mêmes que `recherche_etablissements` (sans limit)

**Retour** : `{ count: number }`

### `obtenir_detail_etablissement`
**Paramètres** :
- `etab_id: string` (UUID)

**Retour** : Objet établissement complet avec toutes les colonnes

---

## Exemples d'utilisation côté chatbot

**User** : "Quels habitats inclusifs y a-t-il dans le Finistère ?"

**Chatbot appelle** :
```javascript
{
  "name": "recherche_etablissements",
  "parameters": {
    "departement": "Finistère",
    "sous_categorie": "Habitat inclusif",
    "limit": 10
  }
}
```

**User** : "Combien de résidences autonomie à moins de 750€ en Île-de-France ?"

**Chatbot appelle** :
```javascript
{
  "name": "compter_etablissements",
  "parameters": {
    "region": "Île-de-France",
    "sous_categorie": "Résidence autonomie",
    "fourchette_prix": "euro"
  }
}
```

---

## Notes importantes

- **Performance** : La vue est optimisée avec indexes sur commune, departement, sous_categories
- **Sécurité** : Le chatbot NE PEUT PAS exécuter de SQL brut, uniquement via ces fonctions whitelistées
- **Données** : ~3430 établissements au total (février 2026)
- **Mise à jour** : Les données sont enrichies régulièrement (IA + contributions)
