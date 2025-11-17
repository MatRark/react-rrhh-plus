// pages/Evaluaciones.jsx
import React, { useEffect, useState } from "react";
import { getUserInfo } from "../services/authService";
import { ServiceEvaluacionAdmin } from "../services/ServiceEvaluacionAdmin";
import EmployeeEvaluations from "../components/EmployeeEvaluations";
import VistaEvaluaciones from "../components/VistaEvaluaciones"; // Importar el nuevo componente

import CrearPlantillaModal from "../components/CrearPlantillaModal";
import DetallePlantillaModal from "../components/DetallePlantillaModal";

// Vista para Admin/Evaluador
function AdminEvaluationsView() {
  const [activeTab, setActiveTab] = useState("plantillas"); // Estado para el tab activo
  
  const [plantillas, setPlantillas] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [areas, setAreas] = useState([]);

  const [modo, setModo] = useState("crear");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  const [openCrear, setOpenCrear] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);

  const [filtros, setFiltros] = useState({
    vigente: true,
    area_id: "",
    search: ""
  });

  // =================== LOADERS ===================
  const cargarAreas = async () => {
    const res = await ServiceEvaluacionAdmin.getAreas();
    setAreas(res.map(a => ({ area_id: a.Id, nombre: a.Nombre })));
  };

  const cargarIndicadores = async () => {
    const res = await ServiceEvaluacionAdmin.getIndicadoresCatalogo();
    setIndicadores(res);
  };

  const cargarPlantillas = async () => {
    const res = await ServiceEvaluacionAdmin.getPlantillas({
      vigente: filtros.vigente,
      area_id: filtros.area_id
    });
    setPlantillas(res);
  };

  useEffect(() => {
    cargarAreas();
    cargarIndicadores();
  }, []);

  useEffect(() => {
    if (activeTab === "plantillas") {
      cargarPlantillas();
    }
  }, [filtros, activeTab]);

  // =================== ACCIONES ===================

  const abrirCrear = () => {
    setModo("crear");
    setPlantillaSeleccionada(null);
    setOpenCrear(true);
  };

  const abrirEditar = async (p) => {
    setModo("editar");

    // obtener detalle completo antes de editar
    const detalle = await ServiceEvaluacionAdmin.getPlantillaById(p.plantilla_id);

    setPlantillaSeleccionada(detalle);
    setOpenCrear(true);
  };

  const abrirVer = async (p) => {
    const detalle = await ServiceEvaluacionAdmin.getPlantillaById(p.plantilla_id);
    setPlantillaSeleccionada(detalle);
    setOpenDetalle(true);
  };

  const guardarPlantilla = async (data) => {
    await ServiceEvaluacionAdmin.crearPlantilla(data);
    setOpenCrear(false);
    cargarPlantillas();
  };

  const cambiarVigencia = async (id, vigente) => {
    await ServiceEvaluacionAdmin.actualizarVigencia(id, vigente);
    cargarPlantillas();
  };

  const plantillasFiltradas = plantillas.filter((p) =>
    p.nombre.toLowerCase().includes(filtros.search.toLowerCase())
  );

  // =================== UI ===================
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sistema de Evaluaciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona plantillas y evaluaciones de desempeño.
          </p>
        </div>

        {/* Tabs - Similar al componente de Asistencias */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab("plantillas")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "plantillas"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    description
                  </span>
                  Plantillas
                </div>
              </button>

              <button
                onClick={() => setActiveTab("evaluaciones")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "evaluaciones"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    analytics
                  </span>
                  Evaluaciones
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según el tab activo */}
        <div>
          {activeTab === "plantillas" ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Header de Plantillas */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Plantillas de Evaluación</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Crea, edita y administra plantillas de evaluación.
                  </p>
                </div>

                <button
                  onClick={abrirCrear}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Nueva plantilla
                </button>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar plantilla..."
                      value={filtros.search}
                      onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                      className="pl-10 pr-3 py-2 rounded-lg border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={filtros.area_id}
                  onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map(a => (
                    <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
                  ))}
                </select>

                <select
                  value={filtros.vigente}
                  onChange={(e) => setFiltros({ ...filtros, vigente: e.target.value === "true" })}
                  className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Vigentes</option>
                  <option value="false">Inactivas</option>
                </select>
              </div>

              {/* Tabla de Plantillas */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                      <th className="py-3 px-4 text-left font-semibold">Área</th>
                      <th className="py-3 px-4 text-left font-semibold">Periodo</th>
                      <th className="py-3 px-4 text-left font-semibold">Vigente</th>
                      <th className="py-3 px-4 text-center font-semibold">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {plantillasFiltradas.map((p) => (
                      <tr key={p.plantilla_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">{p.nombre}</td>
                        <td className="py-3 px-4 text-slate-600">{p.nombre_area}</td>
                        <td className="py-3 px-4 text-slate-600">{p.periodo_inicio} — {p.periodo_fin}</td>

                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={p.vigente}
                            onChange={(e) => cambiarVigencia(p.plantilla_id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => abrirVer(p)}
                              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                              title="Ver detalles"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>

                            <button
                              onClick={() => abrirEditar(p)}
                              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors"
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

              {/* Mensaje si no hay plantillas */}
              {plantillasFiltradas.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">
                    description
                  </span>
                  <p>No se encontraron plantillas</p>
                </div>
              )}
            </div>
          ) : (
            /* Vista de Evaluaciones */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <VistaEvaluaciones />
            </div>
          )}
        </div>

        {/* Modal Crear/Editar */}
        {openCrear && (
          <CrearPlantillaModal
            modo={modo}
            plantilla={plantillaSeleccionada}
            indicadores={indicadores}
            areas={areas}
            onClose={() => setOpenCrear(false)}
            onSave={guardarPlantilla}
          />
        )}

        {/* Modal Detalle */}
        {openDetalle && plantillaSeleccionada && (
          <DetallePlantillaModal
            plantilla={plantillaSeleccionada}
            onClose={() => setOpenDetalle(false)}
          />
        )}
      </div>
    </div>
  );
}

// Componente principal con router por roles
export default function Evaluaciones() {
  const { roles } = getUserInfo();

  // Determinar si el usuario es empleado (solo empleado, sin otros roles de admin)
  const isEmployee = roles?.includes("empleado") && 
                     !roles?.includes("admin") && 
                     !roles?.includes("evaluador");

  // Mostrar vista según el rol
  return isEmployee ? <EmployeeEvaluations /> : <AdminEvaluationsView />;
}