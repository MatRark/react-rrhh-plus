import React, { useState, useEffect, useMemo } from "react";
import {
  getAllContracts,
  getContractById,
  deleteContract,
} from "./contractService"; // import corregido para carpeta components

// ==========================
// 🔵 MODAL DETALLE CONTRATO
// ==========================
function ContractDetailModal({ contractId, onClose }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contractId) loadContract();
  }, [contractId]);

  const loadContract = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getContractById(contractId);
      setContract(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!contractId) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER degradado azul */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">description</span>
            <div>
              <h2 className="text-lg font-semibold">Detalle del Contrato</h2>
              <p className="text-white/80 text-sm">Información principal del contrato</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* CONTENIDO */}
        <div className="p-6 overflow-y-auto h-[calc(100%-7rem)]">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Cargando contrato...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Empleado</p>
                  <p className="font-semibold">{contract.nombreEmpleado}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo de Contrato</p>
                  <p className="font-semibold">{contract.tipoContrato}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estatus</p>
                  <p className="font-semibold">{contract.estatusContrato}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Salario Base</p>
                  <p className="font-semibold text-green-700">
                    ${contract.salarioBase?.toLocaleString("es-MX")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha de Inicio</p>
                  <p>{formatDate(contract.fechaInicio)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha de Fin</p>
                  <p>{formatDate(contract.fechaFin)}</p>
                </div>
              </div>

              {contract.observaciones && (
                <div>
                  <p className="text-xs text-slate-500">Observaciones</p>
                  <p className="text-slate-700">{contract.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ==========================
// ❌ MODAL ELIMINAR CONTRATO
// ==========================
function ConfirmDeleteModal({ contract, onConfirm, onCancel }) {
  if (!contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-600 text-3xl">
            warning
          </span>
          <h2 className="text-lg font-semibold text-red-700">
            Eliminar contrato
          </h2>
        </div>
        <p className="text-slate-700 mb-6">
          ¿Seguro que deseas eliminar el contrato de{" "}
          <b>{contract.nombreEmpleado}</b>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================
// 🧩 VISTA PRINCIPAL
// ==========================
export default function AdminContractView() {
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    tipoContratoId: "",
    estatusContratoId: "",
    fechaInicioDesde: "",
    fechaFinHasta: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadContracts();
  }, [filters]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await getAllContracts(filters);
      setContracts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContract(id);
      setDeleteTarget(null);
      loadContracts();
    } catch (error) {
      alert("Error al eliminar contrato: " + error.message);
    }
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return contracts.filter(
      (c) =>
        c.nombreEmpleado?.toLowerCase().includes(q) ||
        c.tipoContrato?.toLowerCase().includes(q) ||
        c.estatusContrato?.toLowerCase().includes(q)
    );
  }, [contracts, filters.search]);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Contratos</h1>

        {/* FILTROS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar nombre, tipo o estado..."
              className="pl-10 pr-3 py-2 w-full rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <select
            value={filters.tipoContratoId}
            onChange={(e) =>
              setFilters({ ...filters, tipoContratoId: e.target.value })
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tipo</option>
            <option value="1">Determinado</option>
            <option value="2">Indeterminado</option>
            <option value="3">Honorarios</option>
          </select>

          <select
            value={filters.estatusContratoId}
            onChange={(e) =>
              setFilters({ ...filters, estatusContratoId: e.target.value })
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Estado</option>
            <option value="1">Vigente</option>
            <option value="2">Vencido</option>
            <option value="3">Suspendido</option>
            <option value="4">Finalizado</option>
          </select>

          <input
            type="date"
            value={filters.fechaInicioDesde}
            onChange={(e) =>
              setFilters({ ...filters, fechaInicioDesde: e.target.value })
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.fechaFinHasta}
            onChange={(e) =>
              setFilters({ ...filters, fechaFinHasta: e.target.value })
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="py-3 px-4">Empleado</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Inicio</th>
                <th className="py-3 px-4">Fin</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No hay contratos.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.contratoId} className="hover:bg-slate-50">
                    <td className="py-3 px-4">{c.nombreEmpleado}</td>
                    <td className="py-3 px-4">{c.tipoContrato}</td>
                    <td className="py-3 px-4">
                      {new Date(c.fechaInicio).toLocaleDateString("es-MX")}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(c.fechaFin).toLocaleDateString("es-MX")}
                    </td>
                    <td className="py-3 px-4">{c.estatusContrato}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedContractId(c.contratoId)}
                          className="p-1 hover:text-blue-600"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1 hover:text-red-600"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-slate-600">
            Mostrando {paginated.length} de {filtered.length} resultados
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {selectedContractId && (
        <ContractDetailModal
          contractId={selectedContractId}
          onClose={() => setSelectedContractId(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          contract={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.contratoId)}
        />
      )}
    </div>
  );
}
