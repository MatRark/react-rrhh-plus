import React, { useEffect, useState } from "react";
import { getVacantes, createVacante } from "../services/vacantesService";
import { getAreas, getPuestos } from "../services/catalogosService";

export default function RecruitmentPanel() {
  const [vacantes, setVacantes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    areaId: "",
    puestoId: "",
    fechaPublicacion: "",
  });

  // ==========================
  // Cargar vacantes al inicio
  // ==========================
  useEffect(() => {
    loadVacantes();
  }, []);

  const loadVacantes = async () => {
    try {
      const data = await getVacantes({});
      setVacantes(data.items);
    } catch (err) {
      console.error("Error cargando vacantes:", err);
    }
  };

  // ==========================
  // Abrir modal -> cargar áreas
  // ==========================
  const abrirModal = async () => {
    setOpenModal(true);
    setLoadingModal(true);

    try {
      const dataAreas = await getAreas();
      setAreas(dataAreas); // vienen con Id y Nombre
    } catch (err) {
      console.error("Error cargando áreas:", err);
    } finally {
      setTimeout(() => setLoadingModal(false), 400);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================
  // Cambio de área -> cargar puestos
  // ==========================
  const handleAreaChange = async (e) => {
    const areaId = e.target.value;

    setForm({ ...form, areaId, puestoId: "" });
    setPuestos([]);

    if (!areaId) return;

    try {
      const dataPuestos = await getPuestos(areaId);
      setPuestos(dataPuestos); // vienen con Id, Nombre, AreaId
    } catch (err) {
      console.error("Error cargando puestos:", err);
    }
  };

  // ==========================
  // Crear vacante
  // ==========================
  const crear = async () => {
    if (!form.titulo || !form.areaId || !form.puestoId || !form.fechaPublicacion) {
      setError("Todos los campos obligatorios deben estar llenos.");
      return;
    }

    setLoadingModal(true);

    try {
      await createVacante({
        titulo: form.titulo,
        descripcion: form.descripcion,
        areaId: Number(form.areaId),   // aquí mandamos el Id correcto
        puestoId: Number(form.puestoId),
        fechaPublicacion: form.fechaPublicacion,
      });

      // Reset
      setOpenModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        areaId: "",
        puestoId: "",
        fechaPublicacion: "",
      });
      setError("");
      loadVacantes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <>
      {/* LOADER CENTRAL */}
      {loadingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9999]">
          <div className="bg-white dark:bg-gray-800 px-10 py-6 rounded-xl shadow-xl border flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="font-semibold text-gray-700 dark:text-gray-200">Cargando...</p>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vacantes</h1>

          <button
            onClick={abrirModal}
            className="flex gap-2 items-center bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Vacante
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow rounded-xl border">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Área</th>
                <th className="px-6 py-3">Puesto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Publicación</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.map((v) => (
                <tr key={v.vacanteId} className="border-t">
                  <td className="px-6 py-3">{v.titulo}</td>
                  <td className="px-6 py-3">{v.nombreArea}</td>
                  <td className="px-6 py-3">{v.nombrePuesto}</td>
                  <td className="px-6 py-3 capitalize">{v.estatus}</td>
                  <td className="px-6 py-3">
                    {new Date(v.fechaPublicacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / DRAWER */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[550px] bg-white dark:bg-gray-900 
          shadow-xl border-l transition-transform duration-300 z-[9998]
          ${openModal ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER AZUL FUERTE COMO CONTRATOS */}
        <div className="bg-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined">work</span>
                Nueva Vacante
              </h2>
              <p className="text-sm opacity-80">Completa la información</p>
            </div>

            <button onClick={() => setOpenModal(false)}>
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="p-6 overflow-y-auto space-y-6 h-[calc(100%-150px)]">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Título *</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                badge
              </span>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej. Desarrollador .NET Jr"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción de la vacante"
              className="w-full px-4 py-2.5 h-28 border rounded-xl bg-white dark:bg-gray-800 
                         border-gray-300 dark:border-gray-600 
                         focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Área */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Área *</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                domain
              </span>
              <select
                name="areaId"
                value={form.areaId}
                onChange={handleAreaChange}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                           appearance-none"
              >
                <option value="">Selecciona un área</option>
                {areas.map((a) => (
                  <option key={a.Id} value={a.Id}>
                    {a.Nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                expand_more
              </span>
            </div>
          </div>

          {/* Puesto */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Puesto *</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                work
              </span>
              <select
                name="puestoId"
                value={form.puestoId}
                disabled={!form.areaId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                           appearance-none disabled:bg-gray-200 dark:disabled:bg-gray-700"
              >
                <option value="">Selecciona un puesto</option>
                {puestos.map((p) => (
                  <option key={p.Id} value={p.Id}>
                    {p.Nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                expand_more
              </span>
            </div>
          </div>

          {/* Fecha publicación */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Fecha publicación *</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                calendar_month
              </span>
              <input
                type="date"
                name="fechaPublicacion"
                value={form.fechaPublicacion}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white dark:bg-gray-900">
          <button
            onClick={() => setOpenModal(false)}
            className="px-4 py-2 border rounded-xl"
          >
            Cancelar
          </button>

          <button
            onClick={crear}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            Crear Vacante
          </button>
        </div>
      </div>
    </>
  );
}
