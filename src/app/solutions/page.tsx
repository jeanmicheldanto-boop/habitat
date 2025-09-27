import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Solutions d'habitat intermédiaire pour seniors | Habitat Intermédiaire",
  description:
    "Découvrez toutes les solutions d'habitat intermédiaire pour seniors : béguinage, village seniors, habitat inclusif, colocation, résidences autonomie, conseils pratiques et simulateurs pour bien choisir selon vos besoins et votre autonomie.",
  keywords: [
    "habitat intermédiaire",
    "logement senior",
    "béguinage",
    "village seniors",
    "habitat inclusif",
    "colocation seniors",
    "résidence autonomie",
    "solutions logement personnes âgées",
    "simulateur logement senior",
    "alternatives EHPAD",
    "vieillir chez soi",
    "choisir son habitat",
    "plateforme logement senior"
  ],
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Solutions d'habitat intermédiaire pour seniors | Habitat Intermédiaire",
    description:
      "Toutes les solutions pour bien vieillir chez soi ou en collectif : conseils, illustrations, simulateurs, alternatives à l’EHPAD.",
    url: "https://habitat-intermediaire.fr/solutions",
    type: "website",
    images: [
      {
        url: "https://habitat-intermediaire.fr/public/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Solutions d'habitat intermédiaire pour seniors"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Solutions d'habitat intermédiaire pour seniors",
    description: "Comparez les solutions, découvrez les conseils et outils pour bien choisir votre habitat intermédiaire.",
    images: ["https://habitat-intermediaire.fr/public/banner_1920x200.webp"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  }
};

export default function SolutionsPage() {
  return <Client />;
}
