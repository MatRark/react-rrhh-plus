import React, { useEffect, useState } from "react";
import { getUserInfo } from "../services/authService";
import { getAllAttendances } from "../services/attendanceService";

/* ===============================
   Vista de Registro (Empleado y Admin)
================================= */
function AttendanceRegistrationView() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const formattedDate = now.toLocaleDateString("es-ES", options);
      const formattedTime = now
        .toLocaleTimeString("es-ES", { hour12: false })
        .padStart(8, "0");

      setDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Registro de Asistencia
        </h2>
        <p className="text-slate-500">
          Registra tu entrada y salida de forma rápida y sencilla.
        </p>
      </div>

      {/* Bloque principal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 mb-8">
        <div className="mb-10">
          <p className="text-xl text-slate-600">{date}</p>
          <p className="text-7xl md:text-8xl font-bold text-slate-900 tracking-tight">
            {time}
          </p>
        </div>

        {/* Botones de entrada/salida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 transition-all duration-300 transform hover:scale-105 shadow-sm">
            <span className="material-symbols-outlined text-5xl">login</span>
            <span className="text-xl font-semibold">Marcar Entrada</span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 transition-all duration-300 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled
          >
            <span className="material-symbols-outlined text-5xl">logout</span>
            <span className="text-xl font-semibold">Marcar Salida</span>
          </button>
        </div>
      </div>

      {/* Registro del día */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Registro del Día
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-2xl">
              check_circle
            </span>
            <div>
              <p className="text-sm">Última Entrada</p>
              <p className="font-semibold text-lg text-slate-800">09:02 AM</p>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3 opacity-60">
            <span className="material-symbols-outlined text-slate-400 text-2xl">
              highlight_off
            </span>
            <div>
              <p className="text-sm">Salida</p>
              <p className="font-semibold text-lg text-slate-800">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Vista de Listado (Admin/Gestor)
================================= */
function AttendanceListView() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    turnoId: "",
  });

  useEffect(() => {
    loadAttendances();
  }, []);

  const loadAttendances = async () => {
    setLoading(true);
    setError("");
    try {
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = {};
      if (filters.fechaDesde) cleanFilters.fechaDesde = filters.fechaDesde;
      if (filters.fechaHasta) cleanFilters.fechaHasta = filters.fechaHasta;
      if (filters.turnoId) cleanFilters.turnoId = filters.turnoId;
      
      const data = await getAllAttendances(cleanFilters);
      setAttendances(data);
    } catch (err) {
      setError(err.message || "Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadAttendances();
  };

  const clearFilters = () => {
    setFilters({ fechaDesde: "", fechaHasta: "", turnoId: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    // Evitar problemas de zona horaria parseando manualmente
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-MX");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    return timeString.substring(0, 5); // HH:MM
  };

  const getStatusColor = (estado) => {
    const colors = {
      Completado: "bg-green-100 text-green-800",
      "En turno": "bg-blue-100 text-blue-800",
      Ausencia: "bg-red-100 text-red-800",
      Actualizado: "bg-yellow-100 text-yellow-800",
    };
    return colors[estado] || "bg-slate-100 text-slate-700";
  };

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-slate-600">
            filter_list
          </span>
          <h3 className="font-semibold text-slate-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Turno
            </label>
            <select
              value={filters.turnoId}
              onChange={(e) => handleFilterChange("turnoId", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los turnos</option>
              <option value="1">Matutino</option>
              <option value="2">Vespertino</option>
              <option value="3">Nocturno</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Empleado</th>
                <th className="py-3 px-4 font-semibold">Turno</th>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Entrada</th>
                <th className="py-3 px-4 font-semibold">Salida</th>
                <th className="py-3 px-4 font-semibold">Retardo</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">
                        refresh
                      </span>
                      Cargando asistencias...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && attendances.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron registros de asistencia
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                attendances.map((att) => (
                  <tr
                    key={att.asistenciaId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {att.nombreEmpleado}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{att.turno}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(att.fecha)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-600 text-[16px]">
                          login
                        </span>
                        {formatTime(att.horaEntradaReal)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {att.horaSalidaReal ? (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-red-600 text-[16px]">
                            logout
                          </span>
                          {formatTime(att.horaSalidaReal)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {att.retardoMinutos > 0 ? (
                        <span className="text-red-600 font-medium">
                          +{att.retardoMinutos} min
                        </span>
                      ) : (
                        <span className="text-green-600">A tiempo</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          att.estado
                        )}`}
                      >
                        {att.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-orange-600 transition"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer con información */}
        {!loading && !error && attendances.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>
              Total de registros: <b>{attendances.length}</b>
            </span>
            <button className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Exportar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===============================
   Componente Principal con Tabs
================================= */
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
          <AttendanceRegistrationView />
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
            <AttendanceListView />
          ) : (
            <AttendanceRegistrationView />
          )}
        </div>
      </div>
    </div>
  );
}