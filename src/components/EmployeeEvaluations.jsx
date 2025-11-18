// components/EmployeeEvaluations.jsx
import { useState, useEffect } from "react";
import { getMyEvaluations } from "../services/evaluationService";

const NIVEL_COLORS = {
  Excelente: "bg-green-100 text-green-800",
  Bueno: "bg-green-100 text-green-800", 
  Regular: "bg-yellow-100 text-yellow-800",
  Deficiente: "bg-red-100 text-red-800",
};

const ESTATUS_COLORS = {
  en_proceso: "bg-blue-100 text-blue-800",
  cerrada: "bg-slate-100 text-slate-800",
};

const ESTATUS_LABELS = {
  en_proceso: "En Proceso",
  cerrada: "Completada",
};

export default function EmployeeEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyEvaluations();
      console.log("📥 Evaluaciones recibidas:", data);
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar evaluaciones:", err);
      setError(err.message || "Error al cargar evaluaciones");
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el estado de la evaluación
  const getEvaluationStatus = (evaluation) => {
    if (!evaluation.puntajeTotal && !evaluation.nivelDesempeno) {
      return "pending";
    }
    if (evaluation.estatus === "cerrada" && evaluation.puntajeTotal && evaluation.nivelDesempeno) {
      return "completed";
    }
    return "in_progress";
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-blue-600 animate-spin">
            refresh
          </span>
          <p className="mt-4 text-slate-600">Cargando tus evaluaciones...</p>
        </div>
      </div>
    );
  }

  // Si no hay evaluaciones
  if (!loading && evaluations.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">
                  assignment
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    Aún no tienes evaluaciones asignadas
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Tu evaluación de desempeño será asignada próximamente por el área de Recursos Humanos. 
                    Recibirás una notificación cuando esté disponible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar la primera evaluación (asumiendo que solo hay una por empleado)
  const evaluation = evaluations[0];
  const status = getEvaluationStatus(evaluation);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Evaluación de Desempeño</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta el estado y resultados de tu evaluación
          </p>
        </div>

        {/* Tarjeta de Evaluación */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header de la evaluación */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">analytics</span>
              <div>
                <h2 className="text-2xl font-bold">{evaluation.nombrePlantilla}</h2>
                <p className="text-white/80 text-sm mt-1">
                  Evaluación de desempeño profesional
                </p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${
                ESTATUS_COLORS[evaluation.estatus] || "bg-white/20 text-white"
              }`}
            >
              {ESTATUS_LABELS[evaluation.estatus] || evaluation.estatus}
            </span>
          </div>

          {/* Contenido de la evaluación */}
          <div className="p-6 space-y-6">
            {/* Información General */}
            <section>
              <h3 className="text-sm font-semibold mb-4 text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Área</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {evaluation.nombreArea || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Empleado</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {evaluation.nombreEmpleado || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Estado de la Evaluación */}
            {status === "pending" && (
              <section>
                <h3 className="text-sm font-semibold mb-4 text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">schedule</span>
                  Estado Actual
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-amber-600 mt-1">
                      pending_actions
                    </span>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-lg mb-2">
                        Evaluación Pendiente
                      </h4>
                      <p className="text-amber-700">
                        Tu evaluación está en proceso de revisión. El área de Recursos Humanos 
                        está trabajando en tu evaluación de desempeño. Los resultados estarán 
                        disponibles una vez que el proceso sea completado.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {status === "in_progress" && (
              <section>
                <h3 className="text-sm font-semibold mb-4 text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">trending_up</span>
                  Progreso Actual
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-blue-600 mt-1">
                      analytics
                    </span>
                    <div>
                      <h4 className="font-semibold text-blue-800 text-lg mb-2">
                        Evaluación en Proceso
                      </h4>
                      <p className="text-blue-700">
                        Tu evaluación está siendo analizada. El proceso de evaluación 
                        se encuentra en etapa de revisión final. Pronto podrás ver 
                        tus resultados completos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Resultados - Solo mostrar si la evaluación está completada */}
            {status === "completed" && (
              <section>
                <h3 className="text-sm font-semibold mb-4 text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">emoji_events</span>
                  Resultados Finales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Puntaje Total */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-2xl">score</span>
                      <div>
                        <p className="text-blue-100 text-sm">Puntaje Total</p>
                        <p className="text-3xl font-bold">
                          {evaluation.puntajeTotal?.toFixed(1) || "0.0"}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-100 text-xs">
                      Puntuación obtenida en tu evaluación
                    </p>
                  </div>

                  {/* Nivel de Desempeño */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                      <div>
                        <p className="text-green-100 text-sm">Nivel de Desempeño</p>
                        <p className="text-3xl font-bold">
                          {evaluation.nivelDesempeno || "—"}
                        </p>
                      </div>
                    </div>
                    <p className="text-green-100 text-xs">
                      Evaluación de tu desempeño general
                    </p>
                  </div>
                </div>

                {/* Interpretación del Nivel */}
                {evaluation.nivelDesempeno && (
                  <div className="mt-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      NIVEL_COLORS[evaluation.nivelDesempeno] || "bg-slate-100 text-slate-700"
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {evaluation.nivelDesempeno === "Excelente" ? "star" : 
                         evaluation.nivelDesempeno === "Bueno" ? "thumb_up" :
                         evaluation.nivelDesempeno === "Regular" ? "adjust" : "warning"}
                      </span>
                      <span className="font-semibold">
                        {evaluation.nivelDesempeno === "Excelente" ? "¡Desempeño Excepcional!" :
                         evaluation.nivelDesempeno === "Bueno" ? "Buen Desempeño" :
                         evaluation.nivelDesempeno === "Regular" ? "Desempeño Satisfactorio" : 
                         "Áreas de Oportunidad Identificadas"}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Información Adicional */}
            <section>
              <h3 className="text-sm font-semibold mb-4 text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600">description</span>
                Detalles del Proceso
              </h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Estado del Proceso:</span>
                    <span className="font-semibold text-slate-800">
                      {status === "pending" ? "Pendiente de Inicio" :
                       status === "in_progress" ? "En Revisión" : "Completado"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Plantilla de Evaluación:</span>
                    <span className="font-semibold text-slate-800">
                      {evaluation.nombrePlantilla}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Área Responsable:</span>
                    <span className="font-semibold text-slate-800">
                      {evaluation.nombreArea}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Mensaje Informativo */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-500 mt-0.5">info</span>
                <div>
                  <p className="text-sm text-slate-700">
                    <strong>Nota:</strong> Para cualquier duda o aclaración sobre tu evaluación, 
                    comunícate con el área de Recursos Humanos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}