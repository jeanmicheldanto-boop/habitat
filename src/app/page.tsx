"use client";

import Image from "next/image";
import Link from "next/link";
import OblongButtonLink from "../components/OblongButtonLink";
import IntegratedSearchBar from "../components/IntegratedSearchBar";
import ChatbotIcon from "../components/ChatbotIcon";

export default function HomePage() {
  return (
    <section className="hero" aria-label="Accueil habitat-intermediaire.fr">
      <div className="hero__bg" aria-hidden="true">
        <Image
          src="/hero_habitat.jpg"
          alt="Illustration habitat intermédiaire"
          fill
          sizes="100vw"
          className="hero__img hero__img--desktop"
          priority
        />
        <Image
          src="/hero_habitat.jpg"
          alt="Illustration habitat intermédiaire"
          fill
          sizes="100vw"
          className="hero__img hero__img--mobile"
        />
        <span className="hi-hero__scrim" />
      </div>

      <div className="hero__content">
    <h1 className="hero__title">Trouvez votre habitat intermédiaire senior en France</h1>

        {/* Barre de recherche intégrée - Boîte oblongue unique */}
        <IntegratedSearchBar />
        
        <style jsx>{`
          @keyframes mapPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 2px 12px rgba(217, 135, 106, 0.2);
            }
            50% { 
              transform: scale(1.08);
              box-shadow: 0 4px 20px rgba(217, 135, 106, 0.4), 
                          0 0 0 4px rgba(217, 135, 106, 0.1);
            }
          }

          .integrated-map-btn {
            animation: mapPulse 3s ease-in-out infinite;
          }

          @keyframes chatbotPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 2px 12px rgba(44, 62, 80, 0.3);
            }
            50% { 
              transform: scale(1.08);
              box-shadow: 0 4px 20px rgba(217, 135, 106, 0.5), 
                          0 0 0 4px rgba(217, 135, 106, 0.1);
            }
          }

          .integrated-chatbot-btn {
            animation: chatbotPulse 3s ease-in-out infinite;
          }

          @media (max-width: 768px) {
            .integrated-map-btn {
              width: 52px !important;
              height: 52px !important;
            }
            .integrated-chatbot-btn {
              width: 48px !important;
              height: 48px !important;
            }
          }
        `}</style>

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
          <OblongButtonLink href="/solutions">Faire le point sur son projet d&#39;habitat</OblongButtonLink>
        </div>
      </div>

      {/* Section Gestionnaire - En bas après l'image de fond */}
      <div style={{ 
        position: "relative",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        padding: "3rem 1rem",
        borderRadius: "24px",
        marginTop: "2rem",
        margin: "2rem auto 0",
        width: "100%",
        maxWidth: "min(1100px, calc(100% - 2rem))",
        boxSizing: "border-box"
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
            Vous proposez de l&#39;habitat intermédiaire ?
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
            Gérez facilement vos fiches de présentation et tenez vos informations à jour.
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
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Infos disponibles via API
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

      {/* Modal Chatbot (caché par défaut, s'ouvre via l'icône) */}
      <ChatbotIcon />
    </section>
  );
}
