// src/app/aides/layout.tsx
import type { ReactNode } from "react";
import SecondaryMenu from "../../components/SecondaryMenu";
import AidesSubnav from "./AidesSubnav";

export default function AidesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      <div style={{ display: "flex" }}>
        <AidesSubnav />
        <div style={{ flex: 1, marginLeft: 260 }}>
          {children}
        </div>
      </div>
    </>
  );
}
