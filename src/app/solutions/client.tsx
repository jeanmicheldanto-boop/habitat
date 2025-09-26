"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Subnav from "./SolutionsSubnav";

function Section({ id, children }: React.PropsWithChildren<{ id: string }>) {
  // Le scrollMarginTop réel est posé au runtime via style inline (voir plus bas)
  return <section id={id}>{children}</section>;
}

export default function Client() {
  const [headerH, setHeaderH] = useState(72);
  const [subnavH, setSubnavH] = useState(44);

  // Mesure header (sécurise si le style change)
  useEffect(() => {
    const el = document.getElementById("site-header");
    if (!el) return;
    const measure = () =>
      setHeaderH(el.getBoundingClientRect().height || 72);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const contentOffset = headerH + subnavH + 12;

  return (
    <section className="min-h-screen" style={{ paddingTop: contentOffset }}>
      {/* Barre + pastille intégrées au header */}
      <Subnav onHeight={setSubnavH} />

      {/* En-tête */}
      <header className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Les solutions logement
        </h1>
        <p className="mt-3 max-w-3xl text-neutral-700">
          Repères concrets, accès à notre simulateur et à la plateforme de recherche.
        </p>
      </header>

      {/* Contenu */}
      <main
        className="container mx-auto max-w-5xl px-4 pb-20 space-y-20"
        style={{ scrollMarginTop: contentOffset }} // sécurité pour les ancres
      >
        {/* Repères */}
        <Section id="reperes-logement-senior">
          <h2 className="text-2xl font-semibold">Repères sur le logement sénior</h2>
          <p className="mt-2 text-neutral-700">
            (À compléter) Types de solutions, niveaux de services, montées en charge,
            ordres de grandeur budgétaires, etc.
          </p>
        </Section>

        {/* Simulateur */}
        <Section id="simulateur-logement">
          <h2 className="text-2xl font-semibold">Notre simulateur</h2>
          <p className="mt-2 text-neutral-700">
            (À compléter) Présentation rapide + bouton d’accès.
          </p>
          <div className="mt-4">
            <Link
              href="/a-definir" // ← remplace par l’URL réelle
              className="inline-flex items-center rounded-md border px-4 py-2 text-neutral-900 border-neutral-300 hover:bg-neutral-50"
            >
              Ouvrir le simulateur
            </Link>
          </div>
        </Section>

        {/* Plateforme de recherche (pastille orange) */}
        <Section id="plateforme-recherche">
          <h2 className="text-2xl font-semibold">Plateforme de recherche</h2>
          <p className="mt-2 text-neutral-700">
            (À compléter) Moteur/annuaire des solutions, filtres, critères, etc.
          </p>
          <div className="mt-4">
            <Link
              href="/a-definir" // ← remplace par l’URL réelle
              className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Accéder à la plateforme
            </Link>
          </div>
        </Section>
      </main>
    </section>
  );
}
