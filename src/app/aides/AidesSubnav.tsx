"use client";

import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "bons-reflexes", label: "Les bons réflexes" },
  { id: "reperes-aides", label: "Les repères sur les aides" },
  { id: "simulateurs", label: "Les simulateurs" },
];

export default function AidesSubnav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [isMobile, setIsMobile] = useState(false);

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
    const top = window.scrollY + el.getBoundingClientRect().top - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (isMobile) {
    return null;
  }

  return (
    <aside style={{ width: 180, background: "#f6f6f6", borderRight: "1px solid #e0e0e0", position: "fixed", top: 56, left: 0, bottom: 0, zIndex: 59, paddingTop: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <nav style={{ width: "100%" }}>
        <ul style={{ display: "flex", flexDirection: "column", gap: 0, margin: 0, padding: 0, listStyle: "none", width: "100%" }}>
          {SECTIONS.map((s, idx) => {
            const isActive = active === s.id;
            const isSimulator = s.id === "simulateurs";
            return (
              <React.Fragment key={s.id}>
                <li style={{ width: "100%" }}>
                  <a href={`#${s.id}`} onClick={goTo(s.id)} style={{ display: "block", width: "100%", padding: "0.9rem 0.5rem", background: isActive ? (isSimulator ? "#ff8c42" : "#ececec") : "#f6f6f6", color: isActive ? (isSimulator ? "#fff" : "#a85b2b") : (isSimulator ? "#ff8c42" : "#444"), fontWeight: isActive ? 600 : (isSimulator ? 600 : 400), fontSize: "1.05rem", textAlign: "center", textDecoration: "none", cursor: "pointer" }}>
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
