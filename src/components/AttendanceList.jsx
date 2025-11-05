import React, { useEffect, useState } from "react";
import { getAllAttendances } from "../services/attendanceService";

export default function AttendanceList() {
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

  // Efecto para aplicar automáticamente cuando cambia el turno
  useEffect(() => {
    if (filters.turnoId !== "") {
      applyFilters();
    }
  }, [filters.turnoId]); // Se ejecuta cuando cambia turnoId

  const loadAttendances = async (customFilters = null) => {
    setLoading(true);
    setError("");
    try {
      // Usar los filtros personalizados si se proporcionan, sino usar el estado actual
      const filtersToUse = customFilters || filters;
      
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = {};
      if (filtersToUse.fechaDesde) cleanFilters.fechaDesde = filtersToUse.fechaDesde;
      if (filtersToUse.fechaHasta) cleanFilters.fechaHasta = filtersToUse.fechaHasta;
      if (filtersToUse.turnoId) cleanFilters.turnoId = filtersToUse.turnoId;
      
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
    const emptyFilters = { fechaDesde: "", fechaHasta: "", turnoId: "" };
    setFilters(emptyFilters);
    // Cargar las asistencias sin filtros inmediatamente
    loadAttendances(emptyFilters);
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

      {/* Resto del código permanece igual */}
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