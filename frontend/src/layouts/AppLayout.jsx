import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import OfflineBanner from "../components/common/OfflineBanner";

const STORAGE_KEY = "saricart_sidebar_collapsed";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div
      className="min-h-screen bg-[var(--color-paper)]"
      style={{ "--sidebar-w": collapsed ? "4rem" : "14rem" }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <main className="flex min-w-0 min-h-screen flex-col px-4 py-6 transition-[margin] duration-200 md:ml-[var(--sidebar-w)] md:px-8 md:py-8">
        <OfflineBanner />
        <div id="main-content" className="flex-1">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}
