import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero" aria-label="Accueil habitat-intermediaire.fr">
      <div className="hero__bg" aria-hidden="true">
        <Image
          src="/hero-desktop.png"
          alt=""
          fill
          sizes="100vw"
          className="hero__img hero__img--desktop"
          priority
        />
        <Image
          src="/hero-mobile.png"
          alt=""
          fill
          sizes="100vw"
          className="hero__img hero__img--mobile"
        />
        <span className="hi-hero__scrim" />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">Ressources pour penser demain sereinement</h1>
        <div className="hero__actions">
          <Link href="/aides" className="btn btn--primary">Les aides</Link>
          <Link href="/solutions" className="btn btn--outline">Les solutions logement</Link>
        </div>
      </div>

      {/* Pied de page de la home : bouton Contact + lien Mentions légales */}
      <div className="home-footer">
        <div className="home-footer__inner">
          <Link href="/contact" className="btn btn--accent">Contact</Link>
          <Link href="/mentions-legales" className="home-footer__legal">Mentions légales</Link>
        </div>
      </div>
    </section>
  );
}
