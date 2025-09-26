// src/app/aides/page.tsx
import type { Metadata } from "next";
import AidesSubnav from "./AidesSubnav";
import AidesClient from "./AidesClient";

export const metadata: Metadata = {
  title: "Aides | Habitat Intermédiaire",
  description:
    "Comprendre les aides à l'autonomie de façon simple et pratique : bons réflexes, repères, simulateurs (GIR & APA).",
  alternates: { canonical: "/aides" },
  openGraph: {
    title: "Aides | Habitat Intermédiaire",
    description:
      "Infos pratiques pour s’orienter : GIR, APA, coûts réels et conseils concrets.",
    url: "https://habitat-intermediaire.fr/aides",
    type: "website",
  },
};

export default function AidesPage() {
  return (
    <>
      <AidesSubnav />
      <AidesClient />
    </>
  );
}
