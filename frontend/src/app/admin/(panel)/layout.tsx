import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

// AdminShell runs requireAdmin(). Every admin page and data function calls it again, because
// layouts and pages render in parallel and a layout check alone would not protect a page.
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
