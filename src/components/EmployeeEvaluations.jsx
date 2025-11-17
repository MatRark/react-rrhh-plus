// components/EmployeeEvaluations.jsx
import { useState, useEffect } from "react";
import { getMyEvaluations, getEvaluationDetail } from "../services/evaluationService";

const NIVEL_COLORS = {
  Excelente: "text-green-700 bg-green-100",
  Bueno: "text-green-700 bg-green-100",
  Regular: "text-yellow-700 bg-yellow-100",
  Deficiente: "text-red-700 bg-red-100",
};

const ESTATUS_COLORS = {
  en_proceso: "text-blue-700 bg-blue-100",
  cerrada: "text-slate-700 bg-slate-100",
};

const ESTATUS_LABELS = {
  en_proceso: "En Proceso",
  cerrada: "Cerrada",
};

export default function EmployeeEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Modal de detalle
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, [filterStatus]);

  const loadEvaluations = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (filterStatus) filters.estatus = filterStatus;
      
      const data = await getMyEvaluations(filters);
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al cargar evaluaciones");
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (evaluacionId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const detail = await getEvaluationDetail(evaluacionId);
      setSelectedEvaluation(detail);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mis Evaluaciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta tu historial de evaluaciones, puntajes y retroalimentación.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="en_proceso">En Proceso</option>
            <option value="cerrada">Cerradas</option>
          </select>

          {filterStatus && (
            <button
              onClick={() => setFilterStatus("")}
              className="ml-3 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Plantilla</th>
                  <th className="py-3 px-4 font-semibold">Área</th>
                  <th className="py-3 px-4 font-semibold">Puntaje Total</th>
                  <th className="py-3 px-4 font-semibold">Nivel</th>
                  <th className="py-3 px-4 font-semibold">Estatus</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">
                          refresh
                        </span>
                        Cargando evaluaciones...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && evaluations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-300">
                          assignment
                        </span>
                        <p className="font-medium">Aún no tienes evaluaciones registradas</p>
                        <p className="text-sm text-slate-400">
                          Cuando se te asigne una evaluación, aparecerá aquí.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  evaluations.map((evaluation) => (
                    <tr key={evaluation.evaluacionId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {evaluation.plantilla || evaluation.nombrePlantilla || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {evaluation.nombreArea || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {evaluation.puntajeTotal ? evaluation.puntajeTotal.toFixed(1) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {evaluation.nivelDesempeno ? (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              NIVEL_COLORS[evaluation.nivelDesempeno] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {evaluation.nivelDesempeno}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            ESTATUS_COLORS[evaluation.estatus] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ESTATUS_LABELS[evaluation.estatus] || evaluation.estatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewDetail(evaluation.evaluacionId)}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Detalle de Evaluación</h2>
                <p className="text-white/80 text-sm mt-1">Información completa</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {detailLoading && (
                <div className="flex items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
                    refresh
                  </span>
                </div>
              )}

              {!detailLoading && selectedEvaluation && (
                <div className="space-y-6">
                  {/* Información General */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-500 mb-1">Plantilla</p>
                        <p className="font-medium text-slate-800">
                          {selectedEvaluation.plantilla}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-500 mb-1">Área</p>
                        <p className="font-medium text-slate-800">
                          {selectedEvaluation.nombreArea}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Resultados */}
                  {selectedEvaluation.estatus === "cerrada" && (
                    <section>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Resultados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Puntaje Total</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {selectedEvaluation.puntajeTotal?.toFixed(1)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-green-700 mb-1">
                            Nivel de Desempeño
                          </p>
                          <p className="text-2xl font-bold text-green-800">
                            {selectedEvaluation.nivelDesempeno}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Retroalimentación */}
                  {selectedEvaluation.retroalimentacion && (
                    <section>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Retroalimentación General
                      </h3>
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-slate-700">
                          {selectedEvaluation.retroalimentacion}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Detalle de Indicadores */}
                  {selectedEvaluation.detalle && selectedEvaluation.detalle.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Detalle por Indicador
                      </h3>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="py-3 px-4 text-left font-semibold text-slate-700">
                                Indicador
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-slate-700">
                                Ponderación (%)
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-slate-700">
                                Calificación
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedEvaluation.detalle.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50">
                                <td className="py-3 px-4 text-slate-800">
                                  {item.indicador}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-600">
                                  {item.ponderacion}%
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {item.calificacion !== null ? (
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold">
                                      {item.calificacion}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Nota si está en proceso */}
                  {selectedEvaluation.estatus === "en_proceso" && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600">
                          info
                        </span>
                        <div>
                          <p className="font-medium text-blue-800">
                            Evaluación en proceso
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            Esta evaluación aún no ha sido completada. Los resultados
                            estarán disponibles una vez que sea cerrada.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t bg-white p-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}