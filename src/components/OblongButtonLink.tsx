"use client";
import Link from "next/link";
import React, { useState } from "react";

interface OblongButtonLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function OblongButtonLink({ href, children }: OblongButtonLinkProps) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "0.75rem 2.2rem",
        borderRadius: "32px",
        background: hover ? "#fff" : "rgba(255,255,255,0)",
        color: hover ? "#6b3f1c" : "#c2c2c2",
        border: "1px solid #eee",
        fontWeight: 500,
        fontSize: "1.05rem",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
        transition: "background 0.2s, color 0.2s"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}
