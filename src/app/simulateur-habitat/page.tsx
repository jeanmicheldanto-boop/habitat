import type { Metadata } from "next";
import SimulateurMenu from "../../components/SimulateurMenu";
import StructuredData from "../../components/StructuredData";
import SimulateurHabitatClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur Habitat Intermédiaire Gratuit - Trouvez Votre Logement Senior Idéal | 12 Solutions",
  description:
    "🏠 Simulateur gratuit d'habitat intermédiaire : découvrez parmi 12 solutions (résidence autonomie, MARPA, béguinage, colocation seniors...) celle qui correspond à vos besoins. Test personnalisé en 3 minutes.",
  keywords: [
    "simulateur habitat intermédiaire",
    "logement seniors gratuit",
    "résidence autonomie simulation",
    "MARPA village seniors",
    "béguinage habitat groupé",
    "colocation seniors services",
    "habitat inclusif handicap",
    "maison accueil familial",
    "résidence services seniors",
    "habitat intergénérationnel",
    "solution logement personne âgée",
    "alternative EHPAD domicile",
    "habitat alternatif écologique",
    "conseil orientation habitat",
    "comparateur logement senior",
    "aide choix résidence",
    "accompagnement habitat adapté"
  ],
  alternates: { canonical: "/simulateur-habitat" },
  openGraph: {
    title: "🏠 Simulateur Habitat Intermédiaire - 12 Solutions Logement Seniors",
    description:
      "✨ Trouvez votre habitat intermédiaire idéal ! Test gratuit et personnalisé parmi résidence autonomie, MARPA, béguinage, colocation seniors et 8 autres solutions adaptées.",
    url: "https://habitat-intermediaire.fr/simulateur-habitat",
    type: "website",
    siteName: "Habitat Intermédiaire",
    locale: "fr_FR",
    images: [
      {
        url: "https://habitat-intermediaire.fr/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur habitat intermédiaire - 12 solutions logement seniors"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "🏠 Simulateur Habitat Intermédiaire Gratuit",
    description: "Découvrez parmi 12 solutions celle qui correspond à vos besoins : résidence autonomie, MARPA, béguinage...",
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
  category: "Logement et Habitat",
  classification: "Outil orientation habitat seniors",
  other: {
    "application-name": "Simulateur Habitat",
    "apple-mobile-web-app-title": "Habitat Senior",
    "msapplication-tooltip": "Trouvez votre logement senior idéal",
    "robots": "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
  }
};

export default function SimulateurHabitatPage() {
  return (
    <>
      <StructuredData type="habitat" />
      <SimulateurMenu />
      <SimulateurHabitatClient />
    </>
  );
}