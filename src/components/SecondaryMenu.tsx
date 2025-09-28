"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function SecondaryMenu() {
  const [isMobile, setIsMobile] = React.useState(false);

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
          minHeight: 140,
          background: `url(${bannerUrl}) center/cover no-repeat`,
          borderBottom: "1px solid #a85b2b",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          padding: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Logo mobile centré */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(40,30,20,0.6)",
            color: "#fff",
            borderRadius: "24px",
            fontFamily: "Pacifico, cursive",
            fontSize: "0.85rem",
            textDecoration: "none",
            fontWeight: 500,
            backdropFilter: "blur(2px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            padding: "8px 16px",
            marginBottom: "12px"
          }}
        >
          <Image src="/logoDF.png" alt="Logo" width={28} height={28} />
          habitat-intermediaire.fr
        </Link>

        {/* Menu mobile en grille */}
        <nav style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          width: "100%",
          maxWidth: "320px"
        }}>
          <Link href="/plateforme" style={mobileMenuBtnStyle}>
            🏠 Plateforme
          </Link>
          <Link href="/aides" style={mobileMenuBtnStyle}>
            💰 Aides
          </Link>
          <Link href="/solutions" style={mobileMenuBtnStyle}>
            🔍 Solutions
          </Link>
          <Link href="/contact" style={mobileMenuBtnStyle}>
            📞 Contact
          </Link>
        </nav>
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(40,30,20,0.45)",
            color: "#fff",
            borderRadius: "32px",
            fontFamily: "Pacifico, cursive",
            fontSize: "0.92rem",
            textDecoration: "none",
            fontWeight: 500,
            border: "none",
            backdropFilter: "blur(1.5px)",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
            marginRight: 18,
            cursor: "pointer",
            whiteSpace: "nowrap",
            width: '295px',
            maxWidth: '295px',
            overflow: "visible",
            textOverflow: "clip",
            justifyContent: "center",
            padding: "0.32rem 2.1rem"
          }}
        >
          <Image src="/logoDF.png" alt="Logo Habitat Intermédiaire" width={38} height={38} />
          habitat-intermediaire.fr
        </Link>
        <div style={{ display: "flex", gap: 12, marginLeft: 10 }}>
          <Link href="/plateforme" style={menuBtnStyle}>Plateforme Habitat Intermédiaire</Link>
          <Link href="/aides" style={menuBtnStyle}>Faire le point sur les aides</Link>
          <Link href="/solutions" style={menuBtnStyle}>Choisir sa solution logement</Link>
          <Link href="/contact" style={menuBtnStyle}>Qui sommes-nous</Link>
        </div>
      </nav>
    </header>
  );
}

const menuBtnStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.32rem 0.9rem",
  borderRadius: "32px",
  background: "rgba(255,255,255,0)",
  color: "#fff",
  border: "1px solid #fff",
  fontWeight: 500,
  fontSize: "0.92rem",
  boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
  transition: "background 0.2s, color 0.2s",
  textDecoration: "none",
  whiteSpace: "nowrap",
  cursor: "pointer"
};

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
