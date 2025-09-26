import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import HeaderSubnavGate from '@/components/HeaderSubnavGate';
import SecondaryMenu from '@/components/SecondaryMenu';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://habitat-intermediaire.fr'),
  title: {
    default: "Habitat Intermédiaire - Plateforme de logements pour seniors | Résidences autonomie, services seniors",
    template: "%s | Habitat Intermédiaire - Logements seniors"
  },
  description: "Découvrez les meilleures solutions d'habitat intermédiaire pour seniors : résidences autonomie, résidences services, béguinages, MARPA. Alternative à l'EHPAD, trouvez le logement adapté près de chez vous.",
  keywords: [
    "habitat intermédiaire",
    "logement seniors",
    "résidence autonomie",
    "résidence services seniors", 
    "béguinage",
    "MARPA",
    "alternative EHPAD",
    "habitat inclusif",
    "colocation seniors",
    "village seniors",
    "logement personnes âgées",
    "habitat adapté seniors",
    "résidence pour seniors",
    "logement intergénérationnel"
  ],
  authors: [{ name: "Habitat Intermédiaire" }],
  creator: "Habitat Intermédiaire",
  publisher: "Habitat Intermédiaire",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://habitat-intermediaire.fr',
    siteName: 'Habitat Intermédiaire',
    title: 'Habitat Intermédiaire - Logements pour seniors | Résidences autonomie, services',
    description: 'Plateforme experte du logement inclusif pour seniors. Trouvez résidences autonomie, résidences services, béguinages, MARPA près de chez vous.',
    images: [
      {
        url: '/hero_habitat.png',
        width: 1920,
        height: 1080,
        alt: 'Habitat Intermédiaire - Logements pour seniors',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habitat Intermédiaire - Logements pour seniors',
    description: 'Trouvez le logement senior idéal : résidences autonomie, services seniors, béguinages. Alternative à l\'EHPAD.',
    images: ['/hero_habitat.png'],
    creator: '@habitat_inter',
    site: '@habitat_inter',
  },
  alternates: {
    canonical: 'https://habitat-intermediaire.fr',
  },
  category: 'Logement Seniors',
  classification: 'Habitat Intermédiaire, Logement Seniors, Résidences Services',
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msvalidate.01': 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Habitat Intermédiaire",
    "url": "https://habitat-intermediaire.fr",
    "logo": "https://habitat-intermediaire.fr/logoDF.png",
    "description": "Plateforme experte du logement inclusif pour seniors. Trouvez résidences autonomie, résidences services, béguinages, MARPA près de chez vous.",
    "sameAs": [
      "https://www.facebook.com/habitat-intermediaire",
      "https://www.linkedin.com/company/habitat-intermediaire",
      "https://twitter.com/habitat_inter"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Support client",
      "availableLanguage": "French"
    },
    "service": {
      "@type": "Service",
      "name": "Recherche de logements pour seniors",
      "description": "Service de recherche et de mise en relation pour l'habitat intermédiaire : résidences autonomie, résidences services seniors, béguinages, MARPA",
      "provider": {
        "@type": "Organization",
        "name": "Habitat Intermédiaire"
      },
      "areaServed": {
        "@type": "Country",
        "name": "France"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Seniors, Familles de seniors, Professionnels du secteur"
      }
    }
  };

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <meta name="theme-color" content="#f97316" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/hero_habitat.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <HeaderSubnavGate />
        {children}
        <SecondaryMenu />
      </body>
    </html>
  );
}
