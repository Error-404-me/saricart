import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import OfflineBanner from "../components/common/OfflineBanner";

const STORAGE_KEY = "saricart_sidebar_collapsed";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    // --sidebar-w is the single source of truth for the fixed desktop
    // sidebar's width. Sidebar and <main> both read it (via
    // md:w-[var(--sidebar-w)] / md:ml-[var(--sidebar-w)]) instead of each
    // hard-coding a matching Tailwind size class — those are static
    // strings Tailwind can always find at build time, and there's no way
    // for the two to drift out of sync since they share one value.
    <div
      className="min-h-screen bg-[var(--color-paper)]"
      style={{ "--sidebar-w": collapsed ? "4rem" : "14rem" }}
    >
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />

      {/* Offset to clear the fixed desktop sidebar; no offset needed on
          mobile since that header is sticky (in normal flow) rather than
          fixed. */}
      <main className="min-w-0 px-4 py-6 transition-[margin] duration-200 md:ml-[var(--sidebar-w)] md:px-8 md:py-8">
        <OfflineBanner />
        {/* Used as a normal nested route (Outlet) almost everywhere;
            Landing passes children directly so it can wrap the customer
            Home in this same layout without an extra route level. */}
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
