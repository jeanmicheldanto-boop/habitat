import type { ReactNode } from "react";
import SecondaryMenu from "../../components/SecondaryMenu";
import SolutionsSubnav from "./SolutionsSubnav";

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      <div style={{ display: "flex" }}>
        <SolutionsSubnav />
        <div style={{ flex: 1, marginLeft: 260 }}>
          {children}
        </div>
      </div>
    </>
  );
}
