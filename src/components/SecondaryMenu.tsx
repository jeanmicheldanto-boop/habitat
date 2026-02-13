"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Composant de bouton de menu avec effet hover
function MenuButton({ href, children }: { href: string; children: React.ReactNode }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "0.32rem 0.9rem",
        borderRadius: "32px",
        background: isHovered ? "#fff" : "rgba(255,255,255,0)",
        color: isHovered ? "#8b4513" : "#fff",
        border: "1px solid #fff",
        fontWeight: 500,
        fontSize: "0.92rem",
        boxShadow: isHovered ? "0 3px 12px 0 rgba(0,0,0,0.12)" : "0 2px 8px 0 rgba(0,0,0,0.04)",
        transition: "all 0.25s ease",
        textDecoration: "none",
        whiteSpace: "nowrap",
        cursor: "pointer"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  );
}

export default function SecondaryMenu() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const bannerUrl = isMobile ? "/banner_mobile_1080x240.webp" : "/banner_1920x200.webp";

  if (isMobile) {
    return (
      <header
        className="secondary-menu"
        style={{
          width: "100%",
          minHeight: 70,
          background: `url(${bannerUrl}) center/cover no-repeat`,
          borderBottom: "1px solid #a85b2b",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          padding: "0.75rem 1rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="caveat-font"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(40,30,20,0.6)",
            color: "#fff",
            borderRadius: "24px",
            fontFamily: "'Caveat', cursive",
            fontSize: "1.1rem",
            textDecoration: "none",
            fontWeight: 700,
            backdropFilter: "blur(2px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            padding: "8px 16px",
            transition: "all 0.3s ease",
            flex: 1,
            marginRight: "8px"
          }}
        >
          <Image src="/logoDF.png" alt="Logo" width={24} height={24} />
          habitat-intermediaire.fr
        </Link>

        {/* Bouton Menu Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}
        >
          <div style={{ width: "20px", height: "2px", background: "#fff" }}></div>
          <div style={{ width: "20px", height: "2px", background: "#fff" }}></div>
          <div style={{ width: "20px", height: "2px", background: "#fff" }}></div>
        </button>

        {/* Menu Mobile Dropdown */}
        {menuOpen && (
          <nav style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(40,30,20,0.95)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            gap: "0",
            borderBottom: "1px solid #a85b2b",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            <Link 
              href="/plateforme"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 1rem",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.95rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: "8px", height: "8px", background: "#d9876a", borderRadius: "2px" }}></div>
              Plateforme
            </Link>
            <Link 
              href="/aides"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 1rem",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.95rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: "8px", height: "8px", background: "#d9876a", borderRadius: "2px" }}></div>
              Aides
            </Link>
            <Link 
              href="/solutions"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 1rem",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.95rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: "8px", height: "8px", background: "#d9876a", borderRadius: "2px" }}></div>
              Solutions
            </Link>
            <Link 
              href="/contact"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 1rem",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: "8px", height: "8px", background: "#d9876a", borderRadius: "2px" }}></div>
              Contact
            </Link>
          </nav>
        )}
      </header>
    );
  }

  // Version desktop inchangée
  return (
    <header
      className="secondary-menu"
      style={{
        width: "100%",
        minHeight: 80,
        background: `url(${bannerUrl}) center/cover no-repeat`,
        borderBottom: "1px solid #a85b2b",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
        padding: "0.5rem 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center"
      }}
    >
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 2rem",
        gap: 24,
        width: "100%"
      }}>
        <Link
          href="/"
          className="caveat-font"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(40,30,20,0.6)",
            color: "#fff",
            borderRadius: "32px",
            fontFamily: "'Caveat', cursive",
            fontSize: "1.3rem",
            textDecoration: "none",
            fontWeight: 700,
            border: "none",
            backdropFilter: "blur(2px)",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
            marginRight: 18,
            marginLeft: -12,
            cursor: "pointer",
            whiteSpace: "nowrap",
            padding: "0.4rem 2rem",
            minWidth: "fit-content",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.12)';
          }}
        >
          <Image src="/logoDF.png" alt="Logo Habitat Intermédiaire" width={38} height={38} />
          habitat-intermediaire.fr
        </Link>
        <div style={{ display: "flex", gap: 12, marginLeft: 10 }}>
          <MenuButton href="/plateforme">Plateforme Habitat Intermédiaire</MenuButton>
          <MenuButton href="/aides">Faire le point sur les aides</MenuButton>
          <MenuButton href="/solutions">Choisir sa solution logement</MenuButton>
          <MenuButton href="/contact">Qui sommes-nous</MenuButton>
        </div>
      </nav>
    </header>
  );
}

const mobileMenuBtnStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.3)",
  fontWeight: 600,
  fontSize: "0.8rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
  textDecoration: "none",
  textAlign: "center",
  cursor: "pointer",
  backdropFilter: "blur(2px)"
};
