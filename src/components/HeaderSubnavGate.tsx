"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AidesSubnav = dynamic(() => import("@/app/aides/AidesSubnav"));
const SolutionsSubnav = dynamic(() => import("@/app/solutions/SolutionsSubnav"));

export default function HeaderSubnavGate() {
  const pathname = usePathname();

  if (pathname?.startsWith("/aides")) return <AidesSubnav />;
  if (pathname?.startsWith("/solutions")) return <SolutionsSubnav />;

  return null; // rien sur les autres pages (home incluse)
}