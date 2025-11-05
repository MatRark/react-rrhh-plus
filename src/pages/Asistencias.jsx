import React, { useState } from "react";
import { getUserInfo } from "../services/authService";
import AttendanceRegistration from "../components/AttendanceRegistration";
import AttendanceList from "../components/AttendanceList";

export default function Asistencias() {
  const { roles } = getUserInfo();
  const [activeTab, setActiveTab] = useState("list");

  // Verificar si el usuario es admin o gestor
  const isAdminOrManager =
    roles?.includes("admin") || roles?.includes("gestor_empleados");

  // Si es empleado, solo muestra la vista de registro
  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AttendanceRegistration />
        </div>
      </div>
    );
  }

  // Si es admin/gestor, muestra tabs
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Asistencias</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona los registros de asistencia de tus empleados.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "list"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    list_alt
                  </span>
                  Registros de Asistencia
                </div>
              </button>

              <button
                onClick={() => setActiveTab("register")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "register"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    touch_app
                  </span>
                  Registrar Asistencia
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según el tab activo */}
        <div>
          {activeTab === "list" ? (
            <AttendanceList />
          ) : (
            <AttendanceRegistration />
          )}
        </div>
      </div>
    </div>
  );
}