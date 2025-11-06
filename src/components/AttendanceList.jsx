import React, { useEffect, useState } from "react";
import { getAllAttendances, updateAttendance } from "../services/attendanceService";

export default function AttendanceList() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [formData, setFormData] = useState({
    tipo: "entrada",
    hora: "",
    observaciones: "",
  });
  const [infoMessage, setInfoMessage] = useState("");

  // Filtros
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    turnoId: "",
  });

  useEffect(() => {
    loadAttendances();
  }, []);

  useEffect(() => {
    if (filters.turnoId !== "") applyFilters();
  }, [filters.turnoId]);

  const loadAttendances = async (customFilters = null) => {
    setLoading(true);
    setError("");
    try {
      const filtersToUse = customFilters || filters;
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

  const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const applyFilters = () => loadAttendances();
  const clearFilters = () => {
    const empty = { fechaDesde: "", fechaHasta: "", turnoId: "" };
    setFilters(empty);
    loadAttendances(empty);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-MX");
  };

  const formatTime = (timeString) => (timeString ? timeString.substring(0, 5) : "—");

  const getStatusColor = (estado) => {
    const colors = {
      Completado: "bg-green-100 text-green-800",
      "En turno": "bg-blue-100 text-blue-800",
      Ausencia: "bg-red-100 text-red-800",
      Actualizado: "bg-yellow-100 text-yellow-800",
    };
    return colors[estado] || "bg-slate-100 text-slate-700";
  };

  // Abrir modal
  const handleEditClick = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      tipo: "entrada",
      hora: "",
      observaciones: "",
    });
    setShowModal(true);
  };

  // Guardar cambios
  const handleSaveCorrection = async () => {
    if (!formData.hora || !formData.observaciones) {
      //setInfoMessage("Por favor, completa todos los campos."); SI ES NECESARIO, DESCOMENTAR
      return;
    }

    const data =
      formData.tipo === "entrada"
        ? { horaEntrada: formData.hora, observaciones: formData.observaciones }
        : { horaSalida: formData.hora, observaciones: formData.observaciones };

    try {
      await updateAttendance(selectedAttendance.asistenciaId, data);
      setInfoMessage("Asistencia actualizada correctamente.");
      setShowModal(false);
      await loadAttendances();
    } catch (err) {
      console.error(err);
      setInfoMessage("Error al actualizar la asistencia.");
    }
  };

  // Caja de mensajes
  const renderInfoBox = () =>
    infoMessage && (
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
        <span className="material-symbols-outlined text-[22px]">info</span>
        <p className="text-sm font-medium leading-relaxed">{infoMessage}</p>
      </div>
    );

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-slate-600">filter_list</span>
          <h3 className="font-semibold text-slate-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
            <select
              value={filters.turnoId}
              onChange={(e) => handleFilterChange("turnoId", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="1">Matutino</option>
              <option value="2">Vespertino</option>
              <option value="3">Nocturno</option>
            </select>
          </div>

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
        {renderInfoBox()}

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
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Cargando asistencias...
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                attendances.map((att) => (
                  <tr key={att.asistenciaId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-medium text-slate-800">{att.nombreEmpleado}</td>
                    <td className="py-3 px-4 text-slate-600">{att.turno}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(att.fecha)}</td>
                    <td className="py-3 px-4">{formatTime(att.horaEntradaReal)}</td>
                    <td className="py-3 px-4">{formatTime(att.horaSalidaReal)}</td>
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
                      <button
                        onClick={() => handleEditClick(att)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-orange-600 transition"
                        title="Corregir asistencia"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === MODAL === */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Corregir asistencia de {selectedAttendance?.nombreEmpleado}
            </h3>

            <label className="block mb-3">
              <span className="text-sm font-medium text-slate-600">Tipo de corrección</span>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium text-slate-600">Nueva hora</span>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium text-slate-600">Observaciones</span>
              <textarea
                rows="3"
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Corrección manual por olvido de marcar salida"
              ></textarea>
            </label>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
