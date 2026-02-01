"use client";

import Image from "next/image";
import Link from "next/link";
import OblongButtonLink from "../components/OblongButtonLink";
import SearchAutocomplete from "../components/SearchAutocomplete";
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
    <h1 className="hero__title" style={{ marginTop: "4rem" }}>Trouvez votre habitat intermédiaire senior en France</h1>

        {/* Barre de recherche centrale avec boutons carte et chatbot */}
        <div style={{ 
          position: "relative", 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "center", 
          gap: "1rem",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 1rem"
        }}>
          {/* Bouton Carte de France */}
          <Link
            href="/plateforme?view=map"
            className="map-btn"
            style={{
              position: "relative",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "2px solid rgba(217, 135, 106, 0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 24px rgba(217, 135, 106, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              animation: "mapPulse 3s ease-in-out infinite",
              flexShrink: 0,
              textDecoration: "none"
            }}
            aria-label="Accéder à la carte"
            title="Accéder à la carte"
          >
            {/* Icône Carte avec marqueurs élégante */}
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Carte stylisée avec lignes et points */}
              <rect 
                x="4" 
                y="6" 
                width="24" 
                height="20" 
                rx="2" 
                fill="url(#mapGradient)"
                stroke="#d9876a"
                strokeWidth="1.5"
              />
              
              {/* Lignes de carte horizontales */}
              <line x1="6" y1="11" x2="26" y2="11" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              <line x1="6" y1="16" x2="26" y2="16" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              <line x1="6" y1="21" x2="26" y2="21" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              
              {/* Lignes verticales */}
              <line x1="11" y1="8" x2="11" y2="24" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              <line x1="16" y1="8" x2="16" y2="24" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              <line x1="21" y1="8" x2="21" y2="24" stroke="#c1694a" strokeWidth="0.8" opacity="0.4"/>
              
              {/* Marqueurs de localisation */}
              <g>
                {/* Pin principal */}
                <path 
                  d="M16 10 C14 10 12.5 11.5 12.5 13.5 C12.5 15.5 16 20 16 20 C16 20 19.5 15.5 19.5 13.5 C19.5 11.5 18 10 16 10 Z" 
                  fill="#c1694a"
                  stroke="#d9876a"
                  strokeWidth="0.8"
                />
                <circle cx="16" cy="13.5" r="1" fill="white"/>
                
                {/* Petits marqueurs secondaires */}
                <circle cx="10" cy="13" r="2" fill="#d9876a" opacity="0.7"/>
                <circle cx="22" cy="18" r="2" fill="#d9876a" opacity="0.7"/>
                <circle cx="12" cy="20" r="1.5" fill="#e8a87c" opacity="0.6"/>
              </g>
              
              {/* Définition du gradient */}
              <defs>
                <linearGradient id="mapGradient" x1="16" y1="6" x2="16" y2="26">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#f8f9fa"/>
                </linearGradient>
              </defs>
            </svg>
          </Link>
          
          <div style={{ flex: 1, maxWidth: "100%" }}>
            <SearchAutocomplete />
          </div>
          
          {/* Icône Chatbot IA avec bulle élégante */}
          <button
            onClick={() => {
              const event = new CustomEvent('openChatbot');
              window.dispatchEvent(event);
            }}
            className="chatbot-btn"
            style={{
              position: "relative",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3d5568 100%)",
              border: "2px solid rgba(217, 135, 106, 0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 24px rgba(44, 62, 80, 0.4), inset 0 1px 0 rgba(217, 135, 106, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              animation: "chatbotPulse 3s ease-in-out infinite",
              flexShrink: 0
            }}
            aria-label="Assistant IA"
            title="Assistant IA - Posez-moi vos questions !"
          >
            {/* Bulle de chat avec trois points */}
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bulle de chat élégante */}
              <path 
                d="M24 8c0-2.2-3.6-4-8-4s-8 1.8-8 4v8c0 2.2 3.6 4 8 4 1.2 0 2.3-0.1 3.3-0.4l4.7 3.4v-5c0 0 0 0 0-0.2V16C24 16 24 8 24 8z" 
                fill="url(#bubbleGradient)"
                stroke="#f4a460"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Trois points élégants à l'intérieur */}
              <circle cx="12" cy="12" r="1.5" fill="#2c3e50" opacity="0.8"/>
              <circle cx="16" cy="12" r="1.5" fill="#2c3e50" opacity="0.8"/>
              <circle cx="20" cy="12" r="1.5" fill="#2c3e50" opacity="0.8"/>
              
              {/* Définition du gradient cuivré */}
              <defs>
                <linearGradient id="bubbleGradient" x1="16" y1="4" x2="16" y2="20">
                  <stop offset="0%" stopColor="#f4a460"/>
                  <stop offset="50%" stopColor="#e8a87c"/>
                  <stop offset="100%" stopColor="#d9876a"/>
                </linearGradient>
              </defs>
            </svg>
          </button>
        </div>
        
        <style jsx>{`
          @keyframes chatbotPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 4px 24px rgba(44, 62, 80, 0.4), inset 0 1px 0 rgba(217, 135, 106, 0.1);
            }
            50% { 
              transform: scale(1.08);
              box-shadow: 0 6px 32px rgba(217, 135, 106, 0.5), 
                          0 0 0 4px rgba(217, 135, 106, 0.1),
                          inset 0 1px 0 rgba(217, 135, 106, 0.2);
            }
          }
          
          @keyframes mapPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 4px 24px rgba(217, 135, 106, 0.3);
            }
            50% { 
              transform: scale(1.08);
              box-shadow: 0 6px 32px rgba(217, 135, 106, 0.5), 
                          0 0 0 4px rgba(217, 135, 106, 0.1);
            }
          }
          
          .map-btn:hover {
            transform: scale(1.15) !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            box-shadow: 0 8px 36px rgba(217, 135, 106, 0.6), 
                        0 0 0 6px rgba(217, 135, 106, 0.15) !important;
            border-color: rgba(217, 135, 106, 0.5) !important;
            animation: none !important;
          }
          
          .map-btn:hover svg {
            filter: brightness(1.1) drop-shadow(0 0 8px rgba(217, 135, 106, 0.4));
          }
          
          .map-btn:active {
            transform: scale(1.05) !important;
          }
          
          .chatbot-btn:hover {
            transform: scale(1.15) !important;
            background: linear-gradient(135deg, #34495e 0%, #3d5568 50%, #2c3e50 100%) !important;
            box-shadow: 0 8px 36px rgba(217, 135, 106, 0.6), 
                        0 0 0 6px rgba(217, 135, 106, 0.15),
                        inset 0 1px 0 rgba(217, 135, 106, 0.3) !important;
            border-color: rgba(217, 135, 106, 0.4) !important;
            animation: none !important;
          }
          
          .chatbot-btn:hover svg {
            filter: brightness(1.2) drop-shadow(0 0 8px rgba(244, 164, 96, 0.6));
          }
          
          .chatbot-btn:active {
            transform: scale(1.05) !important;
          }
          
          @media (max-width: 768px) {
            .map-btn {
              width: 52px !important;
              height: 52px !important;
            }
            .map-btn svg {
              width: 28px !important;
              height: 28px !important;
            }
            .chatbot-btn {
              width: 52px !important;
              height: 52px !important;
            }
            .chatbot-btn svg {
              width: 28px !important;
              height: 28px !important;
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
            Gérez facilement vos annonces et connectez-vous avec les personnes recherchant des solutions d&#39;habitat adapté.
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

      {/* Modal Chatbot (caché par défaut, s'ouvre via l'icône) */}
      <ChatbotIcon />
    </section>
  );
}
