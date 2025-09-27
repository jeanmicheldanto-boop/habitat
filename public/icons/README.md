# Icônes des Badges

Structure d'organisation des icônes pour les badges de la plateforme habitat intermédiaire.

## 📁 Structure

```
public/icons/
├── avp/              # Badges AVP (certification)
├── services/         # Services établissement  
├── restauration/     # Options restauration
├── tarification/     # Éléments tarifaires
├── public-cible/     # Types de public
└── logement/         # Caractéristiques logement
```

## 🎨 Spécifications techniques

- **Format** : SVG (recommandé) ou WebP
- **Taille** : 16x16px ou 20x20px pour SVG, 32x32px pour WebP
- **Style** : Monochrome par catégorie, ligne claire
- **Nomenclature** : kebab-case (ex: `activites-organisees.svg`)

## 🎯 Intégration

```jsx
<img src="/icons/services/activites-organisees.svg" alt="" className="badge-icon" />
```