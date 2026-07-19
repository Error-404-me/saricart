import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

const STORAGE_KEY = "saricart_sidebar_collapsed";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex">
        {/* spacer */}
        <div
          className={`hidden md:block shrink-0 transition-all duration-200 ${
            collapsed ? "w-16" : "w-56"
          }`}
        />

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
