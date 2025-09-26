import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import HomeBrandOnly from "./HomeBrandOnly"; // ← import default, chemin relatif OK

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habitat Intermédiaire",
  description: "Ressources pour penser demain sereinement : aides séniors et solutions de logement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <header id="site-header" className="site-header">
          <div className="container header-inner">
            <HomeBrandOnly /> {/* pastille visible UNIQUEMENT sur la home */}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
