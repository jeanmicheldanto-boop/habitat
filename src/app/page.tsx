import Image from "next/image";
import Link from "next/link";
import OblongButtonLink from "../components/OblongButtonLink";

export default function HomePage() {
  return (
    <section className="hero" aria-label="Accueil habitat-intermediaire.fr">
      <div className="hero__bg" aria-hidden="true">
        <Image
          src="/hero_habitat.png"
          alt="Illustration habitat intermédiaire"
          fill
          sizes="100vw"
          className="hero__img hero__img--desktop"
          priority
        />
        <Image
          src="/hero_habitat.png"
          alt="Illustration habitat intermédiaire"
          fill
          sizes="100vw"
          className="hero__img hero__img--mobile"
        />
        <span className="hi-hero__scrim" />
      </div>

      <div className="hero__content">
  <h1 className="hero__title">Plateforme experte du logement inclusif pour séniors</h1>

        {/* Barre de recherche centrale */}
        <form
          className="search-bar-custom"
          action="/plateforme"
          method="get"
          style={{ margin: "2rem auto", maxWidth: 480 }}
        >
            <label htmlFor="search-location" style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: 8, display: "block", color: "#ffb366" }}>
            Où cherchez-vous un habitat intermédiaire&nbsp;?
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              id="search-location"
              name="location"
              type="text"
              placeholder="Ville, département..."
              style={{
                flex: 1,
                padding: "0.75rem 1.2rem",
                borderRadius: "32px",
                border: "1px solid #eee",
                fontSize: "1rem",
                background: "#fff",
                color: "#444",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" stroke="#bbb" strokeWidth="2" fill="none" />
                <path d="M8 12h8M14 8l4 4-4 4" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </form>

        {/* Boutons oblong pour aides et solutions */}
        <div style={{ marginTop: "2rem", textAlign: "center", display: "flex", justifyContent: "center", gap: 24 }}>
          <OblongButtonLink href="/aides">Faire le point sur les aides</OblongButtonLink>
          <OblongButtonLink href="/solutions">Choisir sa solution logement</OblongButtonLink>
        </div>
      </div>

      {/* Pied de page de la home : bouton Contact + lien Mentions légales */}
      <div className="home-footer">
        <div className="home-footer__inner">
          <Link href="/contact" className="btn btn--accent">Qui sommes-nous</Link>
          <Link href="/mentions-legales" className="home-footer__legal">Mentions légales</Link>
        </div>
      </div>
    </section>
  );
}
