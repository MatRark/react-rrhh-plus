// components/PostulationDetailModal.jsx
import { useState, useEffect } from "react";
import { getPostulacionById } from "../services/postulacionesService";

const STATUS_COLORS = {
  recibida: "bg-blue-100 text-blue-800",
  en_revision: "bg-yellow-100 text-yellow-800",
  entrevista: "bg-purple-100 text-purple-800",
  aceptada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  recibida: "Recibida",
  en_revision: "En Revisión",
  entrevista: "Entrevista",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export default function PostulationDetailModal({ postulacionId, onClose }) {
  const [postulation, setPostulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostulation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPostulacionById(postulacionId);
        setPostulation(data);
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - FIJO */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">badge</span>
            <div>
              <h2 className="text-lg font-semibold">Detalle de Postulación</h2>
              <p className="text-white/80 text-xs">Información completa del candidato</p>
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

        {/* Content - CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin">
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

          {!loading && !error && postulation && (
            <div className="space-y-5">
              {/* Estado y Fecha */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Estado Actual</p>
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                      STATUS_COLORS[postulation.estatus] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {STATUS_LABELS[postulation.estatus] || postulation.estatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Fecha de Postulación</p>
                  <p className="text-xs font-medium text-slate-800">
                    {formatDate(postulation.fechaPostulacion)}
                  </p>
                </div>
              </div>

              {/* Información del Candidato */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">person</span>
                  Información del Candidato
                </h3>
                <div className="space-y-2">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-0.5">Nombre Completo</p>
                    <p className="text-sm font-medium text-slate-800">
                      {postulation.nombreContacto}
                    </p>
                  </div>
                  
                  {postulation.emailContacto && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-0.5">Correo Electrónico</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[16px]">
                          mail
                        </span>
                        <a 
                          href={`mailto:${postulation.emailContacto}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {postulation.emailContacto}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {postulation.telefonoContacto && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-0.5">Teléfono</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[16px]">
                          call
                        </span>
                        <a 
                          href={`tel:${postulation.telefonoContacto}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {postulation.telefonoContacto}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Información de la Vacante */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">work</span>
                  Vacante
                </h3>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-800 mb-2">
                    {postulation.nombreVacante}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Estado de la vacante:</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      postulation.vacanteEstatus === "abierta" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {postulation.vacanteEstatus === "abierta" ? "Abierta" : "Cerrada"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Currículum */}
              {postulation.cvUrl && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-xl">description</span>
                    Currículum Vitae
                  </h3>
                  <a
                    href={postulation.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-blue-600 text-2xl">
                      picture_as_pdf
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600">
                        Ver Currículum (PDF)
                      </p>
                      <p className="text-xs text-slate-500">Clic para abrir en nueva pestaña</p>
                    </div>
                    <span className="material-symbols-outlined text-blue-600 text-xl">open_in_new</span>
                  </a>
                </section>
              )}

              {/* Observaciones */}
              {postulation.observacion && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-xl">notes</span>
                    Observaciones
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {postulation.observacion}
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer - FIJO */}
        <div className="border-t bg-white p-4 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
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