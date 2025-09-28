"use client";
export const dynamic = 'force-dynamic';
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function HomeBrandOnly() {
  const pathname = usePathname();
  if (pathname !== "/") return null; // n’affiche la pastille que sur la home

  return (
    <Link href="/" className="brand" aria-label="Accueil habitat-intermediaire.fr">
      <Image src="/logoDF.png" alt="Logo DF" width={32} height={32} priority />
      <span className={`brand-title ${caveat.className}`}>habitat-intermediaire.fr</span>
    </Link>
  );
}
