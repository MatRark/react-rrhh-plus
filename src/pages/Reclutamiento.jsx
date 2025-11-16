import React, { useEffect, useState } from "react";
import {
  getVacantes,
  createVacante,
  getVacanteById,
  updateVacante
} from "../services/vacantesService";

import { getAreas, getPuestos } from "../services/catalogosService";
import Postulation from "../components/Postulation";

const initialForm = {
  titulo: "",
  descripcion: "",
  areaId: "",
  puestoId: "",
};

// Fecha actual yyyy-MM-dd
const getTodayDateString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Contar palabras
const countWords = (text) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

export default function RecruitmentPanel() {
  const [vacantes, setVacantes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("vacantes");

  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);

  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  // Modal dinámico
  const [modalMode, setModalMode] = useState("crear");
  const [selectedVacante, setSelectedVacante] = useState(null);

  useEffect(() => {
    if (activeTab === "vacantes") loadVacantes();
  }, [activeTab]);

  const loadVacantes = async () => {
    try {
      const data = await getVacantes({});
      setVacantes(data?.items || []);
    } catch (err) {
      console.error("Error cargando vacantes:", err);
      setVacantes([]);
    }
  };

  // ABRIR MODAL PARA CREAR
  const abrirCrear = async () => {
    setModalMode("crear");
    setSelectedVacante(null);
    setForm(initialForm);
    setError("");

    setOpenModal(true);
    setLoadingModal(true);

    try {
      const dataAreas = await getAreas();
      setAreas(dataAreas || []);
    } catch (e) {
      setError("Error al cargar áreas.");
    }

    setLoadingModal(false);
  };

  // ABRIR DETALLES
  const abrirDetalles = async (vacanteId) => {
    setModalMode("detalles");
    setOpenModal(true);
    setLoadingModal(true);
    setError("");

    try {
      const v = await getVacanteById(vacanteId);
      setSelectedVacante(v);
    } catch (err) {
      setError("No se pudo obtener la vacante.");
    }

    setLoadingModal(false);
  };

  // ABRIR EDITAR
  const abrirEditar = async (vacanteId) => {
    setModalMode("editar");
    setOpenModal(true);
    setLoadingModal(true);
    setError("");

    try {
      const v = await getVacanteById(vacanteId);
      setSelectedVacante(v);

      setForm({
        titulo: v.titulo,
        descripcion: v.descripcion || "",
        areaId: String(v.areaId),
        puestoId: String(v.puestoId),
      });

      const areasRes = await getAreas();
      setAreas(areasRes);

      const puestosRes = await getPuestos(v.areaId);
      setPuestos(puestosRes);

    } catch (err) {
      setError("Error al cargar datos para edición.");
    }

    setLoadingModal(false);
  };

  // CAMBIOS DEL FORM
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "titulo") {
      if (countWords(value) > 65) {
        setError("El título no puede tener más de 65 palabras.");
        return;
      }
      if (error.startsWith("El título")) setError("");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // CAMBIO ÁREA
  const handleAreaChange = async (e) => {
    const areaId = e.target.value;
    setForm((prev) => ({ ...prev, areaId, puestoId: "" }));
    setPuestos([]);

    if (!areaId) return;

    try {
      const puestosRes = await getPuestos(areaId);
      setPuestos(puestosRes || []);
    } catch (err) {
      setError("Error cargando puestos.");
    }
  };

  // CREAR VACANTE
  const crear = async () => {
    const tituloTrim = form.titulo.trim();
    const descripcionTrim = form.descripcion.trim();

    const errores = [];
    if (!tituloTrim) errores.push("El título es obligatorio.");
    if (countWords(tituloTrim) > 65)
      errores.push("El título excede las 65 palabras.");
    if (!form.areaId) errores.push("El área es obligatoria.");
    if (!form.puestoId) errores.push("El puesto es obligatorio.");

    if (errores.length) {
      setError(errores.join(" "));
      return;
    }

    setLoadingModal(true);
    try {
      await createVacante({
        titulo: tituloTrim,
        descripcion: descripcionTrim,
        areaId: Number(form.areaId),
        puestoId: Number(form.puestoId),
        fechaPublicacion: getTodayDateString(),
      });

      setOpenModal(false);
      setForm(initialForm);
      await loadVacantes();
    } catch (err) {
      setError(err.message || "Error creando vacante.");
    }
    setLoadingModal(false);
  };

  // EDITAR VACANTE
  const editar = async () => {
    const tituloTrim = form.titulo.trim();
    const descripcionTrim = form.descripcion.trim();

    const errores = [];
    if (!tituloTrim) errores.push("El título es obligatorio.");
    if (countWords(tituloTrim) > 65)
      errores.push("El título excede 65 palabras.");
    if (!form.areaId) errores.push("El área es obligatoria.");
    if (!form.puestoId) errores.push("El puesto es obligatorio.");

    if (errores.length) {
      setError(errores.join(" "));
      return;
    }

    setLoadingModal(true);
    try {
      await updateVacante(selectedVacante.vacanteId, {
        titulo: tituloTrim,
        descripcion: descripcionTrim,
        areaId: Number(form.areaId),
        puestoId: Number(form.puestoId),
      });

      setOpenModal(false);
      await loadVacantes();
    } catch (err) {
      setError(err.message || "Error actualizando vacante.");
    }
    setLoadingModal(false);
  };

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <>
      {/* LOADER CENTRAL */}
      {loadingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000]">
          <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded-xl shadow-xl border text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="font-semibold text-gray-700 dark:text-gray-200">
              Cargando...
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY */}
      <div
        className={`
          fixed inset-0 bg-black/30 transition-opacity duration-300 z-[5000]
          ${openModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setOpenModal(false)}
      />

      {/* MODAL / DRAWER - RESPONSIVE */}
      <div
        className={`
          fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-full sm:w-[550px]
          bg-white dark:bg-gray-900 shadow-xl sm:border-l
          flex flex-col
          transition-transform duration-300 z-[9999]
          ${openModal ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER FIJO */}
        <div className="bg-blue-600 px-4 sm:px-6 py-4 sm:py-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-xl sm:text-2xl">work</span>
                {modalMode === "crear" && "Nueva Vacante"}
                {modalMode === "editar" && "Editar Vacante"}
                {modalMode === "detalles" && "Detalles de la Vacante"}
              </h2>
              <p className="text-xs sm:text-sm opacity-80">
                {modalMode === "detalles" ? "Información completa" : "Completa la información"}
              </p>
            </div>
            <button onClick={() => setOpenModal(false)} className="p-1">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">close</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-500 bg-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* MODO DETALLES */}
          {modalMode === "detalles" && selectedVacante && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Título</p>
                  <p className="font-semibold">{selectedVacante.titulo}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Área</p>
                  <p className="font-semibold">{selectedVacante.nombreArea}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Puesto</p>
                  <p className="font-semibold">{selectedVacante.nombrePuesto}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                  <p className="text-sm text-slate-500">Estado</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                    {selectedVacante.estatus}
                  </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl col-span-1 sm:col-span-2">
                  <p className="text-sm text-slate-500">Fecha de publicación</p>
                  <p className="font-semibold">
                    {new Date(selectedVacante.fechaPublicacion).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Descripción</p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 min-h-[100px] whitespace-pre-wrap">
                  {selectedVacante.descripcion || "Sin descripción"}
                </div>
              </div>
            </div>
          )}

          {/* FORMULARIO CREAR / EDITAR */}
          {(modalMode === "crear" || modalMode === "editar") && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Título *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                  <input
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ej. Desarrollador .NET Jr"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción de la vacante"
                  className="w-full px-4 py-2.5 h-28 border rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Área *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">domain</span>
                  <select
                    name="areaId"
                    value={form.areaId}
                    onChange={handleAreaChange}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map((a) => (
                      <option key={a.Id} value={a.Id}>{a.Nombre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Puesto *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">work</span>
                  <select
                    name="puestoId"
                    value={form.puestoId}
                    onChange={handleChange}
                    disabled={!form.areaId}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-600 appearance-none disabled:bg-gray-200 dark:disabled:bg-gray-700"
                  >
                    <option value="">Selecciona un puesto</option>
                    {puestos.map((p) => (
                      <option key={p.Id} value={p.Id}>{p.Nombre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">expand_more</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER FIJO */}
        <div className="flex justify-end gap-3 px-4 sm:px-6 py-4 border-t bg-white dark:bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setOpenModal(false)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            {modalMode === "detalles" ? "Cerrar" : "Cancelar"}
          </button>

          {modalMode === "crear" && (
            <button
              onClick={crear}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
            >
              Crear Vacante
            </button>
          )}

          {modalMode === "editar" && (
            <button
              onClick={editar}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
            >
              Guardar Cambios
            </button>
          )}
        </div>
      </div>

      {/* LISTA Y TABS */}
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* HEADER */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Reclutamiento</h1>
            <p className="text-slate-500 text-sm mt-1">
              Gestiona las vacantes disponibles y revisa las postulaciones de candidatos.
            </p>
          </div>

          {/* TABS */}
          <div className="mb-6 border-b border-slate-200 overflow-x-auto">
            <nav className="flex gap-4 whitespace-nowrap">
              <button
                onClick={() => setActiveTab("vacantes")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "vacantes"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-xl">work</span>
                  Vacantes
                </div>
              </button>

              <button
                onClick={() => setActiveTab("postulaciones")}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "postulaciones"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-xl">person_search</span>
                  Postulaciones
                </div>
              </button>
            </nav>
          </div>

          {/* TAB VACANTES */}
          {activeTab === "vacantes" ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold">Vacantes Disponibles</h2>
                <button
                  onClick={abrirCrear}
                  className="flex gap-2 items-center bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 text-sm w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Nueva Vacante
                </button>
              </div>

              {/* TABLA RESPONSIVE */}
              <div className="bg-white dark:bg-gray-900 shadow rounded-xl border overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Título</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Área</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Puesto</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Estado</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Publicación</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacantes.map((v) => (
                      <tr key={v.vacanteId} className="border-t hover:bg-slate-50 text-xs sm:text-sm">
                        <td className="px-4 py-3">{v.titulo}</td>
                        <td className="px-4 py-3">{v.nombreArea}</td>
                        <td className="px-4 py-3">{v.nombrePuesto}</td>
                        <td className="px-4 py-3 capitalize">{v.estatus}</td>
                        <td className="px-4 py-3">
                          {new Date(v.fechaPublicacion).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => abrirDetalles(v.vacanteId)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              onClick={() => abrirEditar(v.vacanteId)}
                              className="p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-600"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Postulation />
          )}
        </div>
      </div>
    </>
  );
}