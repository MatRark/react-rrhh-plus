// components/PostulationEditModal.jsx
import { useState, useEffect } from "react";
import { getPostulacionById, updatePostulacionEstatus } from "../services/postulacionesService";

const STATUS_OPTIONS = [
  { value: "aceptada", label: "Aceptada", color: "bg-green-100 text-green-800" },
  { value: "rechazada", label: "Rechazada", color: "bg-red-100 text-red-800" },
];

// Estados finales que no permiten más cambios
const FINAL_STATUSES = ["aceptada", "rechazada"];

export default function PostulationEditModal({ postulacionId, onClose, onPostulationUpdated }) {
  const [postulation, setPostulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    estatus: "",
    observacion: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchPostulation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPostulacionById(postulacionId);
        setPostulation(data);
        setFormData({
          estatus: data.estatus,
          observacion: data.observacion || "",
        });
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar postulación:", err);
      } finally {
        setLoading(false);
      }
    };

    if (postulacionId) {
      fetchPostulation();
    }
  }, [postulacionId]);

  // Verificar si la postulación está en estado final (no editable)
  const isFinalStatus = postulation && FINAL_STATUSES.includes(postulation.estatus);

  const validateForm = () => {
    const errors = {};

    // Si es estado final, no validar nada más
    if (isFinalStatus) {
      return false;
    }

    if (!formData.estatus) {
      errors.estatus = "Selecciona un estado";
    }

    // Si el estado es "rechazada", la observación es obligatoria
    if (formData.estatus === "rechazada" && !formData.observacion.trim()) {
      errors.observacion = "La observación es obligatoria al rechazar";
    }

    // No se puede repetir el mismo estatus
    if (postulation && formData.estatus === postulation.estatus) {
      errors.estatus = "No puedes seleccionar el mismo estado actual";
    }

    // Si la vacante está cerrada, no se puede aceptar
    if (postulation && postulation.vacanteEstatus === "cerrada" && formData.estatus === "aceptada") {
      errors.estatus = "No se puede aceptar porque la vacante está cerrada";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si es estado final, no permitir envío
    if (isFinalStatus) {
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    setMessage("");
    setError(null);

    try {
      await updatePostulacionEstatus(postulacionId, {
        estatus: formData.estatus,
        observacion: formData.observacion.trim() || undefined,
      });

      setMessage("¡Estado actualizado exitosamente!");

      setTimeout(() => {
        if (onPostulationUpdated) onPostulationUpdated();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    // Si es estado final, no permitir cambios
    if (isFinalStatus) {
      return;
    }

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal - ALTURA AUTOMÁTICA SIN SCROLL INTERNO */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - FIJO */}
        <div className={`p-6 flex items-center justify-between flex-shrink-0 ${
          isFinalStatus 
            ? "bg-gradient-to-r from-slate-600 to-slate-700" 
            : "bg-gradient-to-r from-blue-600 to-indigo-600"
        } text-white`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">
              {isFinalStatus ? "lock" : "edit_note"}
            </span>
            <div>
              <h2 className="text-xl font-bold">
                {isFinalStatus ? "Estado Finalizado" : "Actualizar Estado"}
              </h2>
              <p className="text-white/90 text-sm">
                {isFinalStatus 
                  ? "Esta postulación ya tiene un estado final" 
                  : "Cambia el estado de la postulación"
                }
              </p>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form - SIN SCROLL INTERNO */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Content - SIN OVERFLOW */}
          <div className="flex-1 p-6 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">
                    progress_activity
                  </span>
                  <p className="text-slate-600 text-sm">Cargando información...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {!loading && postulation && (
              <>
                {/* Información de contexto - MÁS COMPACTO */}
                <div className={`rounded-xl p-4 space-y-2 border ${
                  isFinalStatus 
                    ? "bg-slate-50 border-slate-200" 
                    : "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-lg ${
                      isFinalStatus ? "text-slate-600" : "text-blue-600"
                    }`}>
                      {isFinalStatus ? "lock" : "badge"}
                    </span>
                    <h3 className={`text-sm font-bold ${
                      isFinalStatus ? "text-slate-800" : "text-blue-800"
                    }`}>
                      Información de la Postulación
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        isFinalStatus ? "text-slate-600" : "text-blue-700"
                      }`}>
                        Candidato:
                      </span>
                      <span className={`text-sm font-bold ${
                        isFinalStatus ? "text-slate-900" : "text-blue-900"
                      }`}>
                        {postulation.nombreContacto}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        isFinalStatus ? "text-slate-600" : "text-blue-700"
                      }`}>
                        Vacante:
                      </span>
                      <span className={`text-sm font-bold ${
                        isFinalStatus ? "text-slate-900" : "text-blue-900"
                      }`}>
                        {postulation.nombreVacante}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        isFinalStatus ? "text-slate-600" : "text-blue-700"
                      }`}>
                        Estado actual:
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        STATUS_OPTIONS.find(s => s.value === postulation.estatus)?.color || 
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {STATUS_OPTIONS.find(s => s.value === postulation.estatus)?.label || postulation.estatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mensaje de estado final */}
                {isFinalStatus && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[20px] mt-0.5">lock</span>
                      <div>
                        <p className="font-bold">Estado final alcanzado</p>
                        <p className="mt-1 text-amber-700">
                          Esta postulación ya tiene un estado final ({postulation.estatus}) y no puede ser modificada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado de la vacante - Alerta si está cerrada */}
                {!isFinalStatus && postulation.vacanteEstatus === "cerrada" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                      <div>
                        <p className="font-bold">Vacante cerrada</p>
                        <p className="mt-0.5">
                          No se puede cambiar el estado a "Aceptada" porque la vacante ya está cerrada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selector de Estado - SOLO SI NO ES ESTADO FINAL */}
                {!isFinalStatus && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800">
                      Nuevo Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        formErrors.estatus
                          ? "border-red-300 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">Selecciona un estado</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.estatus && (
                      <div className="flex items-center gap-2 text-red-600 text-xs">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>{formErrors.estatus}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Observación - SOLO SI NO ES ESTADO FINAL */}
                {!isFinalStatus && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800">
                      Observación
                      {formData.estatus === "rechazada" && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>
                    <textarea
                      name="observacion"
                      value={formData.observacion}
                      onChange={handleChange}
                      rows="3"
                      placeholder={
                        formData.estatus === "rechazada"
                          ? "Motivo del rechazo (obligatorio)..."
                          : "Comentarios adicionales (opcional)..."
                      }
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 resize-none transition-colors ${
                        formErrors.observacion
                          ? "border-red-300 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    />
                    {formErrors.observacion && (
                      <div className="flex items-center gap-2 text-red-600 text-xs">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>{formErrors.observacion}</span>
                      </div>
                    )}
                    
                    {/* Mensajes informativos */}
                    <div className="space-y-1">
                      {formData.estatus === "rechazada" && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          <span>La observación es obligatoria al rechazar una postulación</span>
                        </div>
                      )}
                      {formData.estatus === "aceptada" && (
                        <div className="flex items-center gap-2 text-green-600 text-xs">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          <span>Al aceptar, la vacante se cerrará automáticamente</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - SIEMPRE VISIBLE */}
          {!loading && postulation && (
            <div className="border-t border-slate-200 bg-white p-4 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              
              {/* Botón condicional según estado */}
              {isFinalStatus ? (
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 text-sm font-bold rounded-lg text-white bg-slate-400 cursor-not-alladow shadow-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Estado Finalizado
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 text-sm font-bold rounded-lg text-white inline-flex items-center gap-2 transition-colors ${
                    submitting 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 shadow-md"
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">hourglass_top</span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Actualizar Estado
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}