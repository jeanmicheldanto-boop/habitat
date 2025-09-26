"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "bons-reflexes",   label: "Les bons réflexes" },
  { id: "reperes-aides",   label: "Les repères sur les aides" },
  { id: "simulateurs",     label: "Les simulateurs", accent: true },
];

export default function AidesSubnav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const barRef = useRef<HTMLDivElement | null>(null);

  const getOffset = () => (barRef.current?.offsetHeight ?? 56) + 8;

  // Scrollspy
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (top?.target?.id) setActive(top.target.id);
      },
      { rootMargin: `-${getOffset()}px 0px -55% 0px`, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // Smooth scroll with offset
  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - getOffset();
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 top-0 z-[60] border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3 py-2">
          {/* Brand pill → home */}
          <Link
            href="/"
            aria-label="Accueil habitat-intermediaire.fr"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium
                        bg-neutral-700 border border-neutral-700
                        !text-white hover:!text-white
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
            <Image src="/logoDF.png" alt="" width={18} height={18} className="mr-2" />
            habitat-intermediaire.fr
            </Link>
          {/* Nav pills */}
          <nav className="ml-auto">
            <ul className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                const base =
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";
                const normal = isActive
                  ? "bg-neutral-100 border-neutral-400 text-neutral-900 shadow-sm"
                  : "bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50";
                const accent = "bg-orange-500 text-white border-orange-500 hover:bg-orange-600";
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={goTo(s.id)}
                      className={[base, s.accent ? accent : normal].join(" ")}
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
