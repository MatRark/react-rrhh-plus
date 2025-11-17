// pages/Evaluaciones.jsx
import React, { useEffect, useState } from "react";
import { getUserInfo } from "../services/authService";
import { ServiceEvaluacionAdmin } from "../services/ServiceEvaluacionAdmin";
import EmployeeEvaluations from "../components/EmployeeEvaluations";

import CrearPlantillaModal from "../components/CrearPlantillaModal";
import DetallePlantillaModal from "../components/DetallePlantillaModal";

// Vista para Admin/Evaluador
function AdminEvaluationsView() {
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
    cargarPlantillas();
  }, [filtros]);

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
    <div className="p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Plantillas de Evaluación</h1>
          <p className="text-gray-500">Crea, edita y administra plantillas.</p>
        </div>

        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva plantilla
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Buscar plantilla..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
          className="px-4 py-2 rounded-lg border w-full"
        />

        <select
          value={filtros.area_id}
          onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value })}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="">Todas las áreas</option>
          {areas.map(a => (
            <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
          ))}
        </select>

        <select
          value={filtros.vigente}
          onChange={(e) => setFiltros({ ...filtros, vigente: e.target.value === "true" })}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="true">Vigentes</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="w-full border-collapse bg-white shadow-sm rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Área</th>
            <th className="p-3 text-left">Periodo</th>
            <th className="p-3 text-left">Vigente</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {plantillasFiltradas.map((p) => (
            <tr key={p.plantilla_id} className="border-t">
              <td className="p-3">{p.nombre}</td>
              <td className="p-3">{p.nombre_area}</td>
              <td className="p-3">{p.periodo_inicio} — {p.periodo_fin}</td>

              <td className="p-3">
                <input
                  type="checkbox"
                  checked={p.vigente}
                  onChange={(e) => cambiarVigencia(p.plantilla_id, e.target.checked)}
                />
              </td>

              <td className="p-3 flex gap-4 justify-center">

                {/* Ojo */}
                <span
                  onClick={() => abrirVer(p)}
                  className="material-symbols-outlined cursor-pointer text-[22px] text-blue-600 hover:text-blue-800 transition"
                >
                  visibility
                </span>

                {/* Lápiz */}
                <span
                  onClick={() => abrirEditar(p)}
                  className="material-symbols-outlined cursor-pointer text-[22px] text-amber-600 hover:text-amber-700 transition"
                >
                  edit
                </span>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

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