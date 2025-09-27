"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import HomeBrandOnly from "@/app/HomeBrandOnly";

const AidesSubnav = dynamic(() => import("@/app/aides/AidesSubnav"));
const SolutionsSubnav = dynamic(() => import("@/app/solutions/SolutionsSubnav"));

export default function HeaderSubnavGate() {
  const pathname = usePathname();

  if (pathname === "/") return <HomeBrandOnly />;
  if (pathname?.startsWith("/aides")) return <AidesSubnav />;
  if (pathname?.startsWith("/solutions")) return <SolutionsSubnav />;

  return null; // rien sur les autres pages
}