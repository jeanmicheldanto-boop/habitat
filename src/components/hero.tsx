// src/app/page.tsx (ou src/components/Hero.tsx)
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero" aria-label="Accueil habitat-intermediaire.fr">
      <div className="hero__bg" aria-hidden="true">
        {/* Desktop */}
        <Image
          src="/hero-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hi-hero__img hi-hero__img--desktop"
        />
        {/* Mobile */}
        <Image
          src="/hero-mobile.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hi-hero__img hi-hero__img--mobile"
        />
        <span className="hi-hero__scrim" />
      </div>

      <div className="hi-hero__content">
        <h1 className="hi-hero__title">Ressources pour penser demain sereinement</h1>
        <div className="hi-hero__actions">
          <Link href="/aides" className="hi-btn hi-btn--solid">Les aides</Link>
          <Link href="/solutions" className="hi-btn hi-btn--ghost">Les solutions logement</Link>
        </div>
      </div>
    </section>
  );
}

