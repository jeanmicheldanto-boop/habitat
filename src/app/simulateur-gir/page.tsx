import type { Metadata } from "next";
import SimulateurMenu from "../../components/SimulateurMenu";
import StructuredData from "../../components/StructuredData";
import SimulateurGirClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur GIR Gratuit - Test Autonomie AGGIR en Ligne | Évaluation Dépendance Seniors",
  description:
    "🧮 Simulateur GIR officiel gratuit : évaluez votre niveau d'autonomie avec la grille AGGIR. Calcul GIR 1 à 6, droits APA, conseils personnalisés. Test rapide et confidentiel pour seniors et aidants.",
  keywords: [
    "simulateur GIR gratuit",
    "test autonomie seniors",
    "grille AGGIR en ligne",
    "évaluation dépendance",
    "calcul GIR 1 2 3 4 5 6",
    "droits APA allocation",
    "aide personnes âgées",
    "autonomie domicile",
    "perte indépendance",
    "soutien aidants familiaux",
    "prévention fragilité",
    "maintien autonomie",
    "évaluation gérontologique",
    "aide sociale seniors",
    "conseil départemental APA"
  ],
  alternates: { canonical: "/simulateur-gir" },
  openGraph: {
    title: "Simulateur GIR Gratuit - Évaluez Votre Autonomie | Test AGGIR Officiel",
    description:
      "🎯 Découvrez votre niveau GIR avec notre simulateur gratuit basé sur la grille AGGIR officielle. Conseils personnalisés, droits APA et solutions d'accompagnement selon votre profil.",
    url: "https://habitat-intermediaire.fr/simulateur-gir",
    type: "website",
    siteName: "Habitat Intermédiaire",
    locale: "fr_FR",
    images: [
      {
        url: "https://habitat-intermediaire.fr/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur GIR - Évaluation autonomie seniors avec grille AGGIR"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "🧮 Simulateur GIR Gratuit - Test Autonomie AGGIR",
    description: "Évaluez votre niveau d'autonomie, découvrez vos droits APA et obtenez des conseils personnalisés.",
    images: ["https://habitat-intermediaire.fr/banner_1920x200.webp"],
    creator: "@habitat_inter"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  authors: [{ name: "Habitat Intermédiaire" }],
  creator: "Habitat Intermédiaire",
  publisher: "Habitat Intermédiaire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL("https://habitat-intermediaire.fr"),
  category: "Santé et Social",
  classification: "Outil d'évaluation autonomie seniors",
  other: {
    "application-name": "Simulateur GIR",
    "apple-mobile-web-app-title": "Test GIR",
    "msapplication-tooltip": "Évaluation autonomie seniors",
    "robots": "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
  }
};

export default function SimulateurGirPage() {
  return (
    <>
      <StructuredData type="gir" />
      <SimulateurMenu />
      <SimulateurGirClient />
    </>
  );
}