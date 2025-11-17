// src/pages/Evaluaciones.jsx
import React, { useEffect, useState } from "react";
import { ServiceEvaluacionAdmin } from "../services/ServiceEvaluacionAdmin";

import CrearPlantillaModal from "../components/CrearPlantillaModal";
import DetallePlantillaModal from "../components/DetallePlantillaModal";

const Evaluaciones = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [areas, setAreas] = useState([]);

  const [filtros, setFiltros] = useState({
    vigente: true,
    area_id: "",
    search: ""
  });

  const [openCrear, setOpenCrear] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  // =========================================================
  // FETCH AREAS
  // =========================================================
  const cargarAreas = async () => {
    const res = await ServiceEvaluacionAdmin.getAreas();

    setAreas(
      res.map(a => ({
        area_id: a.Id,
        nombre: a.Nombre
      }))
    );
  };

  // =========================================================
  // FETCH INDICADORES
  // =========================================================
  const cargarIndicadores = async () => {
    const res = await ServiceEvaluacionAdmin.getIndicadoresCatalogo();
    setIndicadores(res);
  };

  // =========================================================
  // FETCH PLANTILLAS
  // =========================================================
  const cargarPlantillas = async () => {
    const res = await ServiceEvaluacionAdmin.getPlantillas({
      vigente: filtros.vigente,
      area_id: filtros.area_id
    });
    setPlantillas(res);
  };

  // =========================================================
  // USE EFFECT INIT
  // =========================================================
  useEffect(() => {
    cargarIndicadores();
    cargarAreas();
  }, []);

  useEffect(() => {
    cargarPlantillas();
  }, [filtros]);

  // =========================================================
  // CAMBIAR VIGENCIA
  // =========================================================
  const cambiarVigencia = async (id, vigente) => {
    await ServiceEvaluacionAdmin.actualizarVigencia(id, vigente);
    cargarPlantillas();
  };

  // =========================================================
  // GUARDAR PLANTILLA
  // =========================================================
  const guardarPlantilla = async (data) => {
    await ServiceEvaluacionAdmin.crearPlantilla(data);
    setOpenCrear(false);
    cargarPlantillas();
  };

  // =========================================================
  // FILTRO
  // =========================================================
  const plantillasFiltradas = plantillas.filter(p =>
    p.nombre.toLowerCase().includes(filtros.search.toLowerCase())
  );

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <main className="flex w-full flex-1 justify-center py-8">
          <div className="flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">

            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-72 flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tighter">Evaluaciones</h1>
                <p className="text-base font-normal text-text-light-secondary dark:text-dark-secondary">
                  Crea, administra y consulta plantillas de evaluación.
                </p>
              </div>

              <button
                onClick={() => setOpenCrear(true)}
                className="flex min-w-[84px] items-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Nueva Plantilla
              </button>
            </div>

            {/* FILTROS */}
            <div className="mt-6 flex flex-wrap items-center gap-4">

              {/* BUSCAR */}
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-3 text-text-light-secondary dark:text-dark-secondary">
                  search
                </span>
                <input
                  type="text"
                  value={filtros.search}
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                  className="form-input h-12 w-full pl-10 rounded-lg bg-card-light dark:bg-card-dark"
                  placeholder="Buscar plantilla..."
                />
              </div>

              {/* AREAS */}
              <select
                value={filtros.area_id}
                onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value })}
                className="form-select h-12 rounded-lg bg-card-light dark:bg-card-dark"
              >
                <option value="">Todas las áreas</option>
                {areas.map(a => (
                  <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
                ))}
              </select>

              {/* VIGENCIA */}
              <select
                value={filtros.vigente}
                onChange={(e) => setFiltros({ ...filtros, vigente: e.target.value === "true" })}
                className="form-select h-12 rounded-lg bg-card-light dark:bg-card-dark"
              >
                <option value="true">Vigentes</option>
                <option value="false">Inactivas</option>
              </select>
            </div>

            {/* LISTA */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plantillasFiltradas.map((p) => (
                <div key={p.plantilla_id} className="flex flex-col rounded-xl border bg-card-light dark:bg-card-dark shadow-sm hover:shadow-lg">
                  <div className="p-5 flex flex-col gap-4">

                    <div className="flex justify-between">
                      <p className="text-xl font-bold">{p.nombre}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.vigente ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.vigente ? "Vigente" : "Inactiva"}
                      </span>
                    </div>

                    <p className="text-sm">Área: {p.nombre_area}</p>
                    <p className="text-sm">Periodo: {p.periodo_inicio} — {p.periodo_fin}</p>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={p.vigente}
                        onChange={(e) => cambiarVigencia(p.plantilla_id, e.target.checked)}
                      />
                      Activa
                    </label>
                  </div>

                  <div className="p-4 border-t flex justify-end">
                    <button
                      onClick={() => {
                        setPlantillaSeleccionada(p);
                        setOpenDetalle(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* MODAL CREAR */}
        {openCrear && (
          <CrearPlantillaModal
            indicadores={indicadores}
            areas={areas}
            onClose={() => setOpenCrear(false)}
            onSave={guardarPlantilla}
          />
        )}

        {/* MODAL DETALLE */}
        {openDetalle && plantillaSeleccionada && (
          <DetallePlantillaModal
            plantilla={plantillaSeleccionada}
            onClose={() => setOpenDetalle(false)}
          />
        )}

      </div>
    </div>
  );
};

export default Evaluaciones;
