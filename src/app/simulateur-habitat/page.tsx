import type { Metadata } from "next";
import SimulateurHabitatClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur d'Habitat Intermédiaire - Trouvez votre solution idéale | Habitat Intermédiaire",
  description:
    "Découvrez la solution d'habitat intermédiaire qui vous correspond grâce à notre simulateur personnalisé. Évaluez vos besoins et trouvez l'option parfaite entre autonomie et vie sociale.",
  keywords: [
    "simulateur habitat",
    "habitat intermédiaire",
    "logement seniors",
    "résidence autonomie",
    "habitat inclusif",
    "colocation seniors",
    "village seniors",
    "MARPA",
    "béguinage",
    "habitat alternatif",
    "logement adapté",
    "vie sociale seniors"
  ],
  alternates: { canonical: "/simulateur-habitat" },
  openGraph: {
    title: "Simulateur d'Habitat Intermédiaire - Trouvez votre solution idéale",
    description:
      "Simulateur personnalisé pour choisir votre habitat intermédiaire selon vos besoins d'autonomie, budget et vie sociale.",
    url: "https://habitat-intermediaire.fr/simulateur-habitat",
    type: "website",
    images: [
      {
        url: "https://habitat-intermediaire.fr/public/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur d'Habitat Intermédiaire"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulateur d'Habitat Intermédiaire - Trouvez votre solution idéale",
    description: "Découvrez l'habitat intermédiaire qui vous correspond grâce à notre simulateur personnalisé.",
    images: ["https://habitat-intermediaire.fr/public/banner_1920x200.webp"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  }
};

export default function SimulateurHabitatPage() {
  return <SimulateurHabitatClient />;
}