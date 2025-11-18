import React, { useEffect, useState } from "react";
import { getUserInfo } from "../services/authService";
import { ServiceEvaluacionAdmin } from "../services/ServiceEvaluacionAdmin";
import EmployeeEvaluations from "../components/EmployeeEvaluations";
import VistaEvaluaciones from "../components/VistaEvaluaciones";

import CrearPlantillaModal from "../components/CrearPlantillaModal";
import DetallePlantillaModal from "../components/DetallePlantillaModal";

// COMPONENTE DE CARGA BONITO
function LoadingOverlay({ message = "Cargando..." }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xl font-semibold text-slate-700">{message}</span>
      </div>
    </div>
  );
}

// SKELETON ROW 
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
      <td className="py-4 px-4">
        <div className="w-5 h-5 bg-slate-300 rounded mx-auto"></div>
      </td>
      <td className="py-4 px-4 text-center">
        <div className="w-8 h-8 bg-slate-200 rounded-full mx-auto"></div>
      </td>
    </tr>
  );
}

function AdminEvaluationsView() {
  const [activeTab, setActiveTab] = useState("plantillas");

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

  // ESTADOS DE CARGA
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");
  const [cargandoLista, setCargandoLista] = useState(true); // para el skeleton inicial

  // =================== CARGAS INICIALES ===================
  const cargarAreas = async () => {
    const res = await ServiceEvaluacionAdmin.getAreas();
    setAreas(res.map(a => ({ area_id: a.Id, nombre: a.Nombre })));
  };

  const cargarIndicadores = async () => {
    const res = await ServiceEvaluacionAdmin.getIndicadoresCatalogo();
    setIndicadores(res);
  };

  const cargarPlantillas = async () => {
    setCargandoLista(true);
    try {
      const res = await ServiceEvaluacionAdmin.getPlantillas({
        vigente: filtros.vigente,
        area_id: filtros.area_id
      });
      setPlantillas(res);
    } catch (error) {
      console.error("Error cargando plantillas", error);
    } finally {
      setCargandoLista(false);
    }
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

  // =================== ACCIONES CON LOADING ===================
  const abrirCrear = () => {
    setModo("crear");
    setPlantillaSeleccionada(null);
    setOpenCrear(true);
  };

  const abrirVer = async (p) => {
    setLoading(true);
    setLoadingMessage("Cargando...");
    try {
      const detalle = await ServiceEvaluacionAdmin.getPlantillaById(p.plantilla_id);
      setPlantillaSeleccionada(detalle);
      setOpenDetalle(true);
    } catch (error) {
      alert("Error al cargar los detalles de la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const guardarPlantilla = async (data) => {
    setLoading(true);
    setLoadingMessage("Guardando plantilla...");
    try {
      await ServiceEvaluacionAdmin.crearPlantilla(data);
      setOpenCrear(false);
      await cargarPlantillas();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const cambiarVigencia = async (id, vigente) => {
    setLoading(true);
    setLoadingMessage(vigente ? "Activando plantilla..." : "Desactivando plantilla...");
    try {
      await ServiceEvaluacionAdmin.actualizarVigencia(id, vigente);
      await cargarPlantillas();
    } catch (error) {
      alert("Error al cambiar vigencia");
    } finally {
      setLoading(false);
    }
  };

  const plantillasFiltradas = plantillas.filter((p) =>
    p.nombre.toLowerCase().includes(filtros.search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sistema de Evaluaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona plantillas y evaluaciones de desempeño.</p>
        </div>

        {/* TABS */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("plantillas")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "plantillas"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">description</span>
                Plantillas
              </div>
            </button>
            <button
              onClick={() => setActiveTab("evaluaciones")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "evaluaciones"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">analytics</span>
                Evaluaciones
              </div>
            </button>
          </nav>
        </div>

        {/* CONTENIDO */}
        {activeTab === "plantillas" ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* HEADER PLANTILLAS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Plantillas de Evaluación</h2>
                <p className="text-slate-500 text-sm mt-1">Crea, edita y administra plantillas.</p>
              </div>
              <button
                onClick={abrirCrear}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                Nueva plantilla
              </button>
            </div>

            {/* FILTROS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Buscar plantilla..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                  className="pl-10 pr-4 py-3 rounded-lg border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filtros.area_id}
                onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value })}
                className="px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las áreas</option>
                {areas.map(a => (
                  <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
                ))}
              </select>

              <select
                value={filtros.vigente}
                onChange={(e) => setFiltros({ ...filtros, vigente: e.target.value === "true" })}
                className="px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Vigentes</option>
                <option value="false">Inactivas</option>
              </select>
            </div>

            {/* TABLA RESPONSIVE + SCROLL + SKELETON */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Área</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Periodo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vigente</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {cargandoLista ? (
                    // Skeleton mientras carga
                    Array(5).fill().map((_, i) => <SkeletonRow key={i} />)
                  ) : plantillasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-500">
                        <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">description</span>
                        <p className="text-lg">No se encontraron plantillas</p>
                      </td>
                    </tr>
                  ) : (
                    plantillasFiltradas.map((p) => (
                      <tr key={p.plantilla_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.nombre_area}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {p.periodo_inicio} — {p.periodo_fin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={p.vigente}
                            onChange={(e) => cambiarVigencia(p.plantilla_id, e.target.checked)}
                            disabled={loading}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => abrirVer(p)}
                            disabled={loading}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <VistaEvaluaciones />
          </div>
        )}

        {/* MODALES */}
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

        {openDetalle && plantillaSeleccionada && (
          <DetallePlantillaModal
            plantilla={plantillaSeleccionada}
            onClose={() => setOpenDetalle(false)}
          />
        )}

        {/* CARGANDO... BONITO */}
        {loading && <LoadingOverlay message={loadingMessage} />}
      </div>
    </div>
  );
}

export default function Evaluaciones() {
  const { roles } = getUserInfo();
  const isEmployee = roles?.includes("empleado") && !roles?.includes("admin") && !roles?.includes("evaluador");

  return isEmployee ? <EmployeeEvaluations /> : <AdminEvaluationsView />;
}