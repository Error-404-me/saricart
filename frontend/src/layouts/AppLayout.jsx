import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const STORAGE_KEY = "saricart_sidebar_collapsed";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {/* Used as a normal nested route (Outlet) almost everywhere;
              Landing passes children directly so it can wrap the customer
              Home in this same layout without an extra route level. */}
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
