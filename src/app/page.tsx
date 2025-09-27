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
  <h1 className="hero__title" style={{ marginTop: "6rem" }}>Plateforme experte du logement inclusif pour séniors</h1>

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
              name="search"
              type="text"
              placeholder="Ville, département, type d'habitat, nom..."
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
                <circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2" fill="none" />
                <path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </form>

        {/* Boutons oblong pour aides, qui sommes-nous et solutions */}
        <div style={{ 
          marginTop: "3.5rem", 
          textAlign: "center", 
          display: "flex", 
          justifyContent: "center", 
          gap: 20, 
          flexWrap: "wrap",
          padding: "0 1rem" 
        }}>
          <OblongButtonLink href="/aides">Faire le point sur les aides</OblongButtonLink>
          <OblongButtonLink href="/contact" variant="orange">Qui sommes-nous</OblongButtonLink>
          <OblongButtonLink href="/solutions">Faire le point sur son projet d'habitat</OblongButtonLink>
        </div>
      </div>

      {/* Section Gestionnaire - En bas après l'image de fond */}
      <div style={{ 
        position: "relative",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        padding: "3rem 1rem",
        marginTop: "2rem",
        borderRadius: "24px",
        margin: "2rem 1rem 0"
      }}>
        <div style={{ 
          margin: "0 auto", 
          maxWidth: 800, 
          textAlign: "center"
        }}>
          <h2 style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: "#2c3e50", 
            marginBottom: 16,
            textAlign: "center"
          }}>
            Vous proposez de l'habitat intermédiaire ?
          </h2>
          <p style={{ 
            color: "#495057", 
            fontSize: "1.1rem", 
            marginBottom: 40, 
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto 40px"
          }}>
            Rejoignez notre réseau de partenaires et donnez de la visibilité à votre établissement. 
            Gérez facilement vos annonces et connectez-vous avec les personnes recherchant des solutions d'habitat adapté.
          </p>
          
          <div style={{ 
            display: "flex", 
            gap: 20, 
            justifyContent: "center", 
            flexWrap: "wrap",
            marginBottom: 32
          }}>
            {/* Bouton Ajouter - Plus grand */}
            <Link 
              href="/gestionnaire/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: 16,
                padding: "18px 36px",
                fontSize: "1.1rem",
                fontWeight: 600,
                transition: "all 0.3s ease",
                boxShadow: "0 6px 24px rgba(52, 152, 219, 0.4)",
                border: "none",
                cursor: "pointer"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Ajouter mon habitat
            </Link>

            {/* Bouton Espace Gestionnaire - Plus grand */}
            <Link 
              href="/gestionnaire/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: 16,
                padding: "18px 36px",
                fontSize: "1.1rem",
                fontWeight: 600,
                transition: "all 0.3s ease",
                boxShadow: "0 6px 24px rgba(230, 126, 34, 0.4)",
                border: "none",
                cursor: "pointer"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
              Espace gestionnaire
            </Link>
          </div>

          {/* Petite ligne d'informations */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
            fontSize: "0.95rem",
            color: "#6c757d"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Référencement gratuit
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Mise en ligne rapide
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Support dédié
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page de la home : lien Mentions légales */}
      <div className="home-footer">
        <div className="home-footer__inner">
          <Link href="/mentions-legales" className="home-footer__legal">Mentions légales</Link>
        </div>
      </div>
    </section>
  );
}
