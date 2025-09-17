import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inter, Caveat } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: "Habitat Intermédiaire",
  description: "Ressources pour penser demain sereinement : aides séniors et solutions de logement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* HEADER : logo DF + marque manuscrite */}
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand" aria-label="Accueil habitat-intermediaire.fr">
              <Image
                src="/logoDF.png"   // fichier dans /public
                alt="Logo DF"
                width={32}
                height={32}
                priority
              />
              <span className={`brand-title ${caveat.className}`}>
                habitat-intermediaire.fr
              </span>
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
