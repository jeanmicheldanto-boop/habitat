import type { ReactNode } from "react";
import SecondaryMenu from "../../components/SecondaryMenu";

export default function PlateformeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SecondaryMenu />
      {children}
    </>
  );
}
