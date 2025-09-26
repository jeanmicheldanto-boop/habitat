import type { ReactNode } from "react";
import type { Metadata } from "next";
import SecondaryMenu from "../../components/SecondaryMenu";

export const metadata: Metadata = {
  title: "Plateforme de recherche - Habitat Intermédiaire | Trouvez votre logement senior",
  description: "Recherchez et comparez les meilleures solutions d'habitat intermédiaire pour seniors en France : résidences autonomie, résidences services, béguinages, MARPA. Filtrez par département, services et tarifs.",
  keywords: [
    "plateforme logement seniors",
    "recherche résidence autonomie", 
    "comparateur habitat intermédiaire",
    "trouver logement seniors France",
    "résidence services seniors",
    "béguinage France",
    "MARPA par département",
    "habitat inclusif seniors",
    "alternative EHPAD France"
  ],
  openGraph: {
    title: "Plateforme de recherche - Habitat Intermédiaire",
    description: "Trouvez le logement senior idéal près de chez vous. Comparez résidences autonomie, services seniors, béguinages et MARPA en France.",
    images: [
      {
        url: '/hero_habitat.png',
        width: 1920,
        height: 1080,
        alt: 'Plateforme de recherche Habitat Intermédiaire',
      }
    ],
  },
  twitter: {
    title: "Plateforme de recherche - Habitat Intermédiaire", 
    description: "Comparez les meilleurs logements seniors : résidences autonomie, services, béguinages. Trouvez près de chez vous !",
  },
  alternates: {
    canonical: 'https://habitat-intermediaire.fr/plateforme',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function PlateformeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      {children}
    </>
  );
}
