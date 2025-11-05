// src/layouts/DashboardLayout.jsx
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/App.css";

export default function DashboardLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (colapsable en móviles) */}
        <Sidebar />

        {/* Contenedor principal con scroll vertical */}
        <main className="flex-1 flex flex-col bg-[#F5F7FB] overflow-y-auto">
          {/* IMPORTANTE: evita que el section limite el ancho */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
