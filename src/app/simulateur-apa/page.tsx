import type { Metadata } from "next";
import SimulateurApaClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur APA - Estimation participation et reste à charge | Habitat Intermédiaire",
  description:
    "Calculez votre participation APA et votre reste à charge avec notre simulateur officiel. Estimation personnalisée selon vos revenus et votre GIR.",
  keywords: [
    "simulateur APA",
    "calcul participation APA",
    "reste à charge APA",
    "aide domicile",
    "allocation personnalisée autonomie",
    "GIR",
    "grille AGGIR",
    "estimation droits APA",
    "coût aide domicile",
    "participation financière",
    "perte autonomie",
    "seniors aides"
  ],
  alternates: { canonical: "/simulateur-apa" },
  openGraph: {
    title: "Simulateur APA - Estimation participation et reste à charge",
    description:
      "Calculez votre participation APA et découvrez votre reste à charge selon vos revenus et votre niveau d'autonomie.",
    url: "https://habitat-intermediaire.fr/simulateur-apa",
    type: "website",
    images: [
      {
        url: "https://habitat-intermediaire.fr/public/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur APA - Estimation participation"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulateur APA - Estimation participation et reste à charge",
    description: "Calculez votre participation APA et votre reste à charge avec notre simulateur personnalisé.",
    images: ["https://habitat-intermediaire.fr/public/banner_1920x200.webp"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  }
};

export default function SimulateurApaPage() {
  return <SimulateurApaClient />;
}