import Script from 'next/script';

interface StructuredDataProps {
  type: 'gir' | 'habitat' | 'apa';
}

export default function StructuredData({ type }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "",
      "description": "",
      "url": "",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "provider": {
        "@type": "Organization",
        "name": "Habitat Intermédiaire",
        "url": "https://habitat-intermediaire.fr"
      },
      "author": {
        "@type": "Organization",
        "name": "Habitat Intermédiaire"
      },
      "inLanguage": "fr-FR",
      "isAccessibleForFree": true,
      "keywords": "",
      "audience": {
        "@type": "Audience",
        "audienceType": "seniors, aidants familiaux, professionnels santé"
      }
    };

    switch (type) {
      case 'gir':
        return {
          ...baseData,
          "name": "Simulateur GIR - Test Autonomie AGGIR",
          "description": "Simulateur gratuit pour évaluer le niveau d'autonomie avec la grille AGGIR officielle. Calcul GIR et droits APA.",
          "url": "https://habitat-intermediaire.fr/simulateur-gir",
          "keywords": "simulateur GIR, grille AGGIR, évaluation autonomie, test dépendance seniors, calcul GIR, droits APA",
          "applicationSubCategory": "Medical Calculator",
          "featureList": [
            "Évaluation AGGIR complète",
            "Calcul GIR automatique", 
            "Conseils personnalisés",
            "Estimation droits APA",
            "Recommandations prévention"
          ]
        };
        
      case 'habitat':
        return {
          ...baseData,
          "name": "Simulateur Habitat Intermédiaire - Logement Seniors",
          "description": "Simulateur gratuit pour trouver la solution d'habitat intermédiaire idéale parmi 12 options : résidence autonomie, MARPA, béguinage...",
          "url": "https://habitat-intermediaire.fr/simulateur-habitat",
          "keywords": "simulateur habitat, logement seniors, résidence autonomie, MARPA, béguinage, colocation seniors, habitat inclusif",
          "applicationSubCategory": "Housing Advisor",
          "featureList": [
            "12 solutions d'habitat analysées",
            "Questionnaire personnalisé",
            "Comparaison détaillée",
            "Conseils orientation",
            "Photos et descriptions complètes"
          ]
        };
        
      case 'apa':
        return {
          ...baseData,
          "name": "Simulateur APA - Calcul Participation et Reste à Charge",
          "description": "Simulateur officiel APA 2025 pour calculer votre participation financière et reste à charge selon vos revenus et niveau GIR.",
          "url": "https://habitat-intermediaire.fr/simulateur-apa",
          "keywords": "simulateur APA, calcul participation APA, reste à charge, allocation personnalisée autonomie, aide financière seniors",
          "applicationSubCategory": "Financial Calculator",
          "featureList": [
            "Calcul participation APA précis",
            "Estimation reste à charge",
            "Barèmes officiels 2025",
            "Simulation par département",
            "Export résultats PDF"
          ]
        };
        
      default:
        return baseData;
    }
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}