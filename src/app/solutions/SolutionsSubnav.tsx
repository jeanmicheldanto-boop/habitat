
"use client";

import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "reperes-logement-senior", label: "Repères sur le logement sénior" },
  { id: "simulateur-logement", label: "Notre simulateur" },
  { id: "plateforme-recherche", label: "Plateforme de recherche" },
];

export default function SolutionsSubnav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handler = () => {
      let found = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 120 && rect.bottom > 120) {
            found = s.id;
            break;
          }
        }
      }
      setActive(found);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const goTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - (isMobile ? 120 : 80);
    window.scrollTo({ top, behavior: "smooth" });
    if (isMobile) setIsMenuOpen(false); // Fermer le menu après sélection
  };

  // Version mobile : menu horizontal collapsible
  if (isMobile) {
    return (
      <>
        {/* Bouton toggle menu mobile */}
        <div
          style={{
            position: "sticky",
            top: 64,
            zIndex: 100,
            background: "#fff",
            borderBottom: "1px solid #e0e0e0",
            padding: "12px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "12px 16px",
              background: "#f8f9fa",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#495057",
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔍</span>
              <span>Sections : {SECTIONS.find(s => s.id === active)?.label}</span>
            </div>
            <span style={{ 
              transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}>
              ▼
            </span>
          </button>
          
          {/* Menu déroulant */}
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 16,
                right: 16,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                marginTop: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 101,
                overflow: "hidden"
              }}
            >
              {SECTIONS.map((s, idx) => {
                const isActive = active === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={goTo(s.id)}
                    style={{
                      display: "block",
                      padding: "14px 16px",
                      background: isActive ? "#f1f3f4" : "#fff",
                      color: isActive ? "#a85b2b" : "#495057",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      borderBottom: idx < SECTIONS.length - 1 ? "1px solid #f0f0f0" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {s.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Overlay pour fermer le menu */}
        {isMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 99
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // Version desktop : menu latéral fixe
  return (
    <aside
      style={{
        width: 180,
        background: "#f6f6f6",
        borderRight: "1px solid #e0e0e0",
        position: "fixed",
        top: 56,
        left: 0,
        bottom: 0,
        zIndex: 59,
        paddingTop: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <nav style={{ width: "100%" }}>
        <ul style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
          width: "100%"
        }}>
          {SECTIONS.map((s, idx) => {
            const isActive = active === s.id;
            return (
              <React.Fragment key={s.id}>
                <li style={{ width: "100%" }}>
                  <a
                    href={`#${s.id}`}
                    onClick={goTo(s.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.9rem 0.5rem",
                      background: isActive ? "#ececec" : "#f6f6f6",
                      color: isActive ? "#a85b2b" : "#444",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "1.05rem",
                      textAlign: "center",
                      fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                      letterSpacing: "0.01em",
                      border: "none",
                      borderRadius: 0,
                      transition: "background 0.2s, color 0.2s",
                      textDecoration: "none",
                      cursor: "pointer"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#ececec";
                      e.currentTarget.style.color = "#a85b2b";
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = "#f6f6f6";
                        e.currentTarget.style.color = "#444";
                      }
                    }}
                  >
                    {s.label}
                  </a>
                </li>
                {idx < SECTIONS.length - 1 && (
                  <li aria-hidden="true" style={{ width: "60%", margin: "0 auto" }}>
                    <div style={{ height: 1, background: "#e0e0e0", margin: "0.5rem 0" }} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
