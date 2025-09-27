// src/app/aides/page.tsx
import type { Metadata } from "next";
import AidesSubnav from "./AidesSubnav";
import AidesClient from "./AidesClient";

export const metadata: Metadata = {
  title: "Aides à l'autonomie et au logement senior | Habitat Intermédiaire",
  description:
    "Guide complet des aides à l'autonomie pour seniors : APA, GIR, conseils pratiques, simulateurs, repères sur les coûts et démarches pour bien vieillir chez soi ou en habitat intermédiaire.",
  keywords: [
    "aides autonomie",
    "APA",
    "GIR",
    "simulateur APA",
    "simulateur GIR",
    "aides financières seniors",
    "logement personnes âgées",
    "repères aides senior",
    "prévention dépendance",
    "coût logement senior",
    "conseils aidants",
    "plateforme logement autonomie"
  ],
  alternates: { canonical: "/aides" },
  openGraph: {
    title: "Aides à l'autonomie et au logement senior | Habitat Intermédiaire",
    description:
      "Tous les repères pour comprendre et obtenir les aides à l’autonomie, simuler ses droits, et choisir la meilleure solution de logement.",
    url: "https://habitat-intermediaire.fr/aides",
    type: "website",
    images: [
      {
        url: "https://habitat-intermediaire.fr/public/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Aides à l'autonomie et au logement senior"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Aides à l'autonomie et au logement senior",
    description: "Simulateurs, conseils et repères pour bien vieillir chez soi ou en habitat intermédiaire.",
    images: ["https://habitat-intermediaire.fr/public/banner_1920x200.webp"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  }
};

export default function AidesPage() {
  return (
    <>
      <AidesSubnav />
      <AidesClient />
    </>
  );
}
