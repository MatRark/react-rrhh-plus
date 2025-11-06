export default function ConfirmDeleteModal({ show, message, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-red-600 text-[28px]">warning</span>
          <h2 className="text-xl font-semibold text-red-700">Confirmar eliminación</h2>
        </div>
        <p className="text-slate-700 mb-6">{message || "¿Deseas eliminar este contrato? Esta acción no se puede deshacer."}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Eliminar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
