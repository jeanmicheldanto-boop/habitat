import "./globals.css";
import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import HeaderSubnavGate from '@/components/HeaderSubnavGate';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({ weight: "700", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://habitat-intermediaire.fr'),
  title: {
    default: "Habitat Intermédiaire - Plateforme Logements Seniors | Simulateurs Gratuits & Solutions Adaptées",
    template: "%s | Habitat Intermédiaire - Logements seniors"
  },
  description: "🏠 Plateforme habitat intermédiaire : simulateurs gratuits (GIR, APA, habitat), 500+ établissements référencés. Trouvez résidence autonomie, MARPA, béguinage adaptés. Alternative EHPAD.",
  keywords: [
    "habitat intermédiaire",
    "simulateur logement seniors",
    "résidence autonomie",
    "résidence services seniors", 
    "béguinage",
    "MARPA",
    "alternative EHPAD",
    "habitat inclusif",
    "colocation seniors",
    "village seniors",
    "simulateur GIR gratuit",
    "simulateur APA 2025",
    "logement personnes âgées",
    "habitat adapté seniors",
    "résidence pour seniors",
    "logement intergénérationnel",
    "plateforme seniors France",
    "aide choix habitat senior"
  ],
  authors: [{ name: "Habitat Intermédiaire" }],
  creator: "Habitat Intermédiaire",
  publisher: "Habitat Intermédiaire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
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
        <Footer />
      </body>
    </html>
  );
}
