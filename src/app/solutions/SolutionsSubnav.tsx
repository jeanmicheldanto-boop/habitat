
"use client";

import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "reperes-logement-senior", label: "Repères sur le logement sénior" },
  { id: "simulateur-logement", label: "Notre simulateur" },
  { id: "plateforme-recherche", label: "Plateforme de recherche" },
];

export default function SolutionsSubnav() {
  const [active, setActive] = useState(SECTIONS[0].id);

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
    const top = window.scrollY + el.getBoundingClientRect().top - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

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
