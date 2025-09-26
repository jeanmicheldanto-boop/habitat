// src/app/aides/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import SecondaryMenu from "../../components/SecondaryMenu";
import AidesSubnav from "./AidesSubnav";

export const metadata: Metadata = {
  title: "Aides et financements - Habitat Intermédiaire | Subventions logement seniors",
  description: "Découvrez toutes les aides financières pour l'habitat intermédiaire seniors : APA, APL, aides départementales, subventions CNSA. Guide complet des financements disponibles.",
  keywords: [
    "aides logement seniors",
    "financement habitat intermédiaire", 
    "APA allocation personnalisée autonomie",
    "APL aide personnalisée logement",
    "aides départementales seniors",
    "subventions CNSA",
    "financement résidence autonomie",
    "aide habitat inclusif",
    "prix logement seniors",
    "tarif résidence services"
  ],
  openGraph: {
    title: "Aides et financements - Habitat Intermédiaire",
    description: "Guide complet des aides financières pour le logement seniors : APA, APL, aides départementales. Réduisez le coût de votre habitat intermédiaire.",
    images: [
      {
        url: '/hero_habitat.png',
        width: 1920,
        height: 1080,
        alt: 'Aides et financements habitat intermédiaire',
      }
    ],
  },
  twitter: {
    title: "Aides financières habitat intermédiaire",
    description: "APA, APL, aides départementales : découvrez tous les financements pour votre logement senior.",
  },
  alternates: {
    canonical: 'https://habitat-intermediaire.fr/aides',
  }
};

export default function AidesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      <div style={{ display: "flex" }}>
        <AidesSubnav />
        <div style={{ flex: 1, marginLeft: 260 }}>
          {children}
        </div>
      </div>
    </>
  );
}
