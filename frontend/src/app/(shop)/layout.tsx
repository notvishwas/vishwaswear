import type { ReactNode } from "react";
import { ShopShell } from "@/components/layout/shop-shell";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
