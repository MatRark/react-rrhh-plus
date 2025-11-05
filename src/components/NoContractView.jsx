import React from "react";

export default function NoContractView() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header con ícono */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">
              description
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Sin Contrato Asignado
          </h2>
          <p className="text-blue-100 text-sm">
            Actualmente no tienes un contrato activo en el sistema
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500 mt-0.5">
                info
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">¿Qué significa esto?</h3>
                <p className="text-slate-600 text-sm mt-1">
                  No se ha encontrado un contrato activo asociado a tu cuenta. Esto puede deberse a que:
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">
                  schedule
                </span>
                <span className="text-slate-700 text-sm">Tu contrato está en proceso de creación</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">
                  event_busy
                </span>
                <span className="text-slate-700 text-sm">Tu contrato anterior ha expirado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">
                  pending_actions
                </span>
                <span className="text-slate-700 text-sm">Hay una actualización en proceso</span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <span className="material-symbols-outlined text-amber-500 mt-0.5">
                warning
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">Siguientes pasos</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Contacta al departamento de Recursos Humanos para obtener información sobre tu situación contractual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}