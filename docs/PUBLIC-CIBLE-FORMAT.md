---
title: Guide - Format de public_cible dans les propositions
---

# Format de public_cible dans les Propositions

## 📋 Vue d'ensemble

Le champ `public_cible` définit le ou les publics auxquels s'adresse un établissement d'habitat. Cela peut être des personnes âgées, des personnes handicapées, ou des publics mixtes.

## 🗄️ Format dans la base de données

Dans la table `etablissements`, le champ `public_cible` est de type `TEXT` et contient une liste de valeurs séparées par des virgules.

### Exemple :
```
"personnes_agees,habitatinclusif"
"mixtes"
"personnes_handicapees,intergenerationnel"
```

## 📝 Format du payload dans les propositions

Lors de la création ou modification d'un établissement via une proposition, le champ `public_cible` doit être inclus dans `payload.modifications` comme **un tableau de chaînes de caractères**.

### Exemple complet du payload :
```json
{
  "proposeur": {
    "nom": "Patrick Danto",
    "email": "patrick@example.com",
    "telephone": "06 12 34 56 78",
    "description": "Modification complète des données de l'établissement"
  },
  "modifications": {
    "nom": "Maison Mochez",
    "public_cible": [
      "personnes_agees",
      "habitat_inclusif"
    ],
    "presentation": "Une présentation...",
    "habitat_type": "habitat_partage",
    "sous_categories": ["residence_autonomie"],
    ...autres champs
  }
}
```

### Options de public_cible disponibles :

| Clé | Label | Description |
|-----|-------|-------------|
| `personnes_agees` | Personnes âgées | Pour les résidences et habitats accueillant des seniors |
| `personnes_handicapees` | Handicap | Pour les habitats accessibles aux personnes handicapées |
| `mixtes` | Mixte | Pour les établissements accueillant un public mixte |
| `intergenerationnel` | Intergénérationnel | Pour les habitats regroupant plusieurs générations |
| `alzheimer_accessible` | Alzheimer | Pour les établissements spécialisés Alzheimer |

## 🔄 Conversion automatique

Lorsqu'une proposition est approuvée par un administrateur :

1. Le système extrait `payload.modifications.public_cible` (tableau)
2. Convertit le tableau en chaîne séparée par des virgules
3. Sauvegarde la chaîne dans `etablissements.public_cible`

### Exemple de conversion :
```typescript
// Depuis le payload (tableau)
modifications: { public_cible: ["personnes_agees", "habitat_inclusif"] }

// Vers la base de données (texte virgule-séparé)
etablissements.public_cible = "personnes_agees,habitat_inclusif"
```

## 👤 Format pour les utilisateurs

Depuis la page https://www.habitat-intermediaire.fr/suggestion-correction/modifier?etablissement={id},  les utilisateurs peuvent sélectionner les publics cibles via des cases à cocher.

Le système gère automatiquement la conversion entre le format tableau (UI) et le format texte (base de données).

## ✅ Validation

- **Requis** : Non (champ optionnel)
- **Type** : Tableau de chaînes ou chaîne sépaée par des virgules
- **Longueur** : Jusqu'à 255 caractères dans la base de données
- **Valeurs** : Doivent correspondre aux clés définies ci-dessus

## 🐛 Dépannage

**Q: Mon changement de public_cible n'apparaît pas ?**
A: Vérifiez que :
1. La proposition a bien un statut `'approuvee'`
2. Le champ `public_cible` est inclus dans `payload.modifications[]`
3. Les valeurs correspondent aux clés autorisées

**Q: Comment modifier public_cible via l'admin ?**
A: C'est actuellement disponible via la page de modification de propositions. Le champ est éditable lors de l'approbation.

**Q: Peut-on avoir plusieurs publics cibles ?**
A: Oui ! Sélectionnez plusieurs cases à cocher. Exemple : `["personnes_agees", "mixtes"]`

## 📚 Références

- [Interface de modification des propositions](/suggestion-correction/modifier)
- [Page admin des propositions](/admin/propositions)
- Champs associés : `habitat_type`, `sous_categories`
