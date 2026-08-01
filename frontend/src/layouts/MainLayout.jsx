import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
