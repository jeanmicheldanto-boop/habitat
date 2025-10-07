import type { Metadata } from "next";
import SimulateurGirClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur GIR - Évaluation de l'autonomie | Habitat Intermédiaire",
  description:
    "Évaluez votre niveau d'autonomie avec notre simulateur GIR interactif. Obtenez une estimation indicative de votre GIR et des conseils personnalisés pour préserver votre autonomie au quotidien.",
  keywords: [
    "simulateur GIR",
    "évaluation autonomie",
    "grille AGGIR",
    "APA",
    "perte autonomie",
    "aide domicile",
    "seniors autonomie",
    "estimation GIR",
    "prévention dépendance",
    "aide personnes âgées"
  ],
  alternates: { canonical: "/simulateur-gir" },
  openGraph: {
    title: "Simulateur GIR - Évaluation de l'autonomie | Habitat Intermédiaire",
    description:
      "Évaluez votre niveau d'autonomie et découvrez vos droits aux aides. Simulation rapide et conseils personnalisés.",
    url: "https://habitat-intermediaire.fr/simulateur-gir",
    type: "website",
    images: [
      {
        url: "https://habitat-intermediaire.fr/public/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur GIR - Évaluation de l'autonomie"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulateur GIR - Évaluation de l'autonomie",
    description: "Évaluez votre autonomie, découvrez votre GIR estimé et vos droits aux aides.",
    images: ["https://habitat-intermediaire.fr/public/banner_1920x200.webp"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  }
};

export default function SimulateurGirPage() {
  return <SimulateurGirClient />;
}