import React, { useState } from "react";
import { createVacante } from "../services/vacantesService";

export default function CreateVacancyModal({ open, onClose, onCreated }) {
  if (!open) return null;

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    areaId: "",
    puestoId: "",
    fechaPublicacion: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.titulo || !form.areaId || !form.puestoId || !form.fechaPublicacion) {
      setError("Todos los campos obligatorios deben estar llenos");
      return;
    }

    try {
      setLoading(true);
      const newVacancy = await createVacante({
        titulo: form.titulo,
        descripcion: form.descripcion,
        areaId: Number(form.areaId),
        puestoId: Number(form.puestoId),
        fechaPublicacion: form.fechaPublicacion
      });

      onCreated(newVacancy);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 w-full max-w-lg border border-border-light dark:border-border-dark">
        
        <h2 className="text-xl font-bold mb-4">Crear Vacante</h2>

        {error && (
          <p className="text-red-500 mb-3 text-sm">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="input"
            name="titulo"
            placeholder="Título*"
            value={form.titulo}
            onChange={handleChange}
          />

          <textarea
            className="input h-24"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          />

          <input
            className="input"
            name="areaId"
            placeholder="Área ID*"
            value={form.areaId}
            onChange={handleChange}
          />

          <input
            className="input"
            name="puestoId"
            placeholder="Puesto ID*"
            value={form.puestoId}
            onChange={handleChange}
          />

          <input
            type="date"
            className="input"
            name="fechaPublicacion"
            value={form.fechaPublicacion}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
