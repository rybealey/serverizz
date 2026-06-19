import type { ReactNode } from "react";
import { SiteNav } from "@/components/szz/site-nav";
import { SiteFooter } from "@/components/szz/site-footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
