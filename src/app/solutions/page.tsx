import type { Metadata } from "next";
import Client from "./client";

export const metadata: Metadata = {
  title: "Solutions | Habitat Intermédiaire",
  description:
    "Repères pratiques sur le logement sénior, notre simulateur et la plateforme de recherche.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Solutions | Habitat Intermédiaire",
    description:
      "Comprendre les options de logement, tester un simulateur et accéder à la plateforme de recherche.",
    url: "https://habitat-intermediaire.fr/solutions",
    type: "website",
  },
};

export default function SolutionsPage() {
  return <Client />;
}
