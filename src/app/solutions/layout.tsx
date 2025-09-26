import type { ReactNode } from "react";
import type { Metadata } from "next";
import SecondaryMenu from "../../components/SecondaryMenu";
import SolutionsSubnav from "./SolutionsSubnav";

export const metadata: Metadata = {
  title: "Solutions habitat intermédiaire - Types de logements pour seniors",
  description: "Découvrez tous les types d'habitat intermédiaire pour seniors : résidences autonomie, résidences services, béguinages, MARPA, habitat inclusif. Guide complet des solutions de logement.",
  keywords: [
    "types habitat intermédiaire",
    "résidence autonomie définition",
    "résidence services seniors",
    "béguinage senior",
    "MARPA maison accueil rural",
    "habitat inclusif seniors",
    "colocation seniors",
    "village seniors",
    "logement intergénérationnel"
  ],
  openGraph: {
    title: "Solutions habitat intermédiaire - Types de logements seniors",
    description: "Guide des solutions d'habitat intermédiaire : résidences autonomie, services seniors, béguinages, MARPA. Trouvez le logement adapté à vos besoins.",
    images: [
      {
        url: '/hero_habitat.png',
        width: 1920,
        height: 1080,
        alt: 'Solutions habitat intermédiaire pour seniors',
      }
    ],
  },
  twitter: {
    title: "Solutions habitat intermédiaire pour seniors",
    description: "Guide complet : résidences autonomie, services seniors, béguinages, MARPA. Découvrez le logement idéal.",
  },
  alternates: {
    canonical: 'https://habitat-intermediaire.fr/solutions',
  }
};

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      <div style={{ display: "flex" }}>
        <SolutionsSubnav />
        <div style={{ flex: 1, marginLeft: 260 }}>
          {children}
        </div>
      </div>
    </>
  );
}
