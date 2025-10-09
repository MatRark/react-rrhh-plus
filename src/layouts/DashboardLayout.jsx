// src/layouts/DashboardLayout.jsx
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/App.css"; // si prefieres importarlo aquí

export default function DashboardLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <section className="flex-1 p-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
