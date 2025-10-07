import type { Metadata } from "next";
import SimulateurMenu from "../../components/SimulateurMenu";
import StructuredData from "../../components/StructuredData";
import SimulateurApaClient from "./client";

export const metadata: Metadata = {
  title: "Simulateur APA Gratuit 2025 - Calcul Participation & Reste à Charge | Allocation Autonomie",
  description:
    "💰 Simulateur APA officiel gratuit 2025 : calculez votre participation financière et reste à charge selon vos revenus et GIR. Estimation précise des droits allocation personnalisée autonomie.",
  keywords: [
    "simulateur APA gratuit 2025",
    "calcul participation APA",
    "reste à charge APA domicile",
    "allocation personnalisée autonomie",
    "aide financière seniors",
    "GIR 1 2 3 4 tarif",
    "plan aide domicile coût",
    "estimation droits APA",
    "conseil départemental APA",
    "aide ménagère participation",
    "auxiliaire vie APA",
    "plafond ressources APA",
    "ticket modérateur APA",
    "dossier APA simulation",
    "financement aide domicile",
    "calcul revenus APA",
    "barème APA 2025"
  ],
  alternates: { canonical: "/simulateur-apa" },
  openGraph: {
    title: "💰 Simulateur APA Gratuit 2025 - Calcul Participation & Reste à Charge",
    description:
      "🎯 Estimez précisément votre participation APA et reste à charge selon vos revenus et niveau GIR. Simulation officielle basée sur les barèmes départementaux 2025.",
    url: "https://habitat-intermediaire.fr/simulateur-apa",
    type: "website",
    siteName: "Habitat Intermédiaire",
    locale: "fr_FR",
    images: [
      {
        url: "https://habitat-intermediaire.fr/banner_1920x200.webp",
        width: 1920,
        height: 200,
        alt: "Simulateur APA 2025 - Calcul participation allocation autonomie"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "💰 Simulateur APA Gratuit 2025",
    description: "Calculez votre participation APA et reste à charge selon vos revenus et niveau GIR. Estimation précise et gratuite.",
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
  category: "Aide Sociale et Financement",
  classification: "Calculateur allocation APA",
  other: {
    "application-name": "Simulateur APA",
    "apple-mobile-web-app-title": "Calcul APA",
    "msapplication-tooltip": "Calcul participation APA et reste à charge",
    "robots": "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
  }
};

export default function SimulateurApaPage() {
  return (
    <>
      <StructuredData type="apa" />
      <SimulateurMenu />
      <SimulateurApaClient />
    </>
  );
}