import React, { useEffect, useMemo, useState } from "react";
import {
  getAllContracts,
  getMyContract,
  getContractById,
  deleteContract,
} from "../services/contractService";
import { getUserInfo } from "../services/authService";
import CreateContractForm from "../components/CreateContractForm";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import NoContractView from "../components/NoContractView"; // Importa el nuevo componente

const STATE_COLORS = {
  Activo: "bg-green-100 text-green-800",
  Vigente: "bg-green-100 text-green-800",
  Próximo: "bg-blue-100 text-blue-800",
  Vencido: "bg-gray-200 text-gray-700",
  Suspendido: "bg-yellow-100 text-yellow-700",
  Finalizado: "bg-gray-200 text-gray-700",
};

// Descripciones para cada tipo de contrato
const CONTRACT_DESCRIPTIONS = {
  Determinado: "Contrato por tiempo específico con fecha de inicio y fin definidas",
  Indeterminado: "Contrato de planta con duración indefinida",
  Honorarios: "Contrato por servicios profesionales sin relación laboral"
};

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function Contratos() {
  const { roles } = getUserInfo();

  const isEmployee =
    roles?.includes("empleado") &&
    !roles?.includes("admin") &&
    !roles?.includes("gestor_empleados");

  return isEmployee ? <EmployeeContractView /> : <AdminContractView />;
}

/* ============================================================
   VISTA EMPLEADO
============================================================ */
function EmployeeContractView() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyContract();
  }, []);

  const loadMyContract = async () => {
    setLoading(true);
    try {
      const data = await getMyContract();
      setContract(data);
    } catch (err) {
      setError(err.message || "Error al cargar tu contrato");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-MX") : "—";
  const formatCurrency = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(n || 0);

  // Obtener la descripción del contrato
  const getContractDescription = (tipoContrato) => {
    return CONTRACT_DESCRIPTIONS[tipoContrato] || "Tipo de contrato general";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin">
            progress_activity
          </span>
          <p className="mt-2 text-slate-600 text-sm">Cargando tu contrato...</p>
        </div>
      </div>
    );

  if (error)
    return <NoContractView />;

  // Reemplaza la vista anterior con el nuevo componente
  if (!contract)
    return <NoContractView />;

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 scroll-smooth">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto max-h-[90vh]">
        <h1 className="text-3xl font-bold mb-2">Mi Contrato</h1>
        <p className="text-slate-500 text-sm mb-8">
          Consulta la información de tu contrato vigente.
        </p>

        <div className="bg-white rounded-xl shadow border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex flex-col sm:flex-row justify-between items-start rounded-t-xl gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-3xl">description</span>
                <div>
                  <h2 className="text-2xl font-bold">{contract.tipoContrato}</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {getContractDescription(contract.tipoContrato)}
                  </p>
                </div>
              </div>
              <p className="text-white/80">Contrato ID: #{contract.contratoId}</p>
            </div>
            <span
              className={`px-4 py-1 rounded-full font-semibold text-sm ${
                STATE_COLORS[contract.estatusContrato] ||
                "bg-white/20 text-white"
              }`}
            >
              {contract.estatusContrato}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  event
                </span>
                Periodo del Contrato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Inicio</p>
                  <p className="text-lg font-semibold">
                    {formatDate(contract.fechaInicio)}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Fin</p>
                  <p className="text-lg font-semibold">
                    {formatDate(contract.fechaFin)}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">
                  payments
                </span>
                Compensación
              </h3>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-xs text-green-700 mb-1">Salario Base</p>
                <p className="text-2xl font-bold text-green-800 break-words">
                  {formatCurrency(contract.salarioBase)}
                </p>
                <p className="text-xs text-green-600 mt-1">por mes</p>
              </div>
            </section>

            {contract.observaciones && (
              <section>
                <h3 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-600">
                    notes
                  </span>
                  Observaciones
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 overflow-y-auto max-h-40">
                  <p className="text-slate-700">{contract.observaciones}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   VISTA ADMIN / GESTOR
============================================================ */
function AdminContractView() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      setContracts(data);
    } catch (err) {
      setError(err.message || "Error al cargar contratos");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter(
      (r) =>
        (r.nombreEmpleado?.toLowerCase().includes(q) || "") ||
        (r.tipoContrato?.toLowerCase().includes(q) || "") ||
        (r.estatusContrato?.toLowerCase().includes(q) || "")
    );
  }, [contracts, query]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("es-MX") : "—");

  // CRUD
  const openCreate = () => {
    setMode("create");
    setSelectedId(null);
    setShowForm(true);
  };
  const openEdit = (id) => {
    setMode("edit");
    setSelectedId(id);
    setShowForm(true);
  };
  const openRenew = (id) => {
    setMode("renew");
    setSelectedId(id);
    setShowForm(true);
  };
  const openDetail = async (id) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      const data = await getContractById(id);
      setDetail(data);
    } catch (err) {
      alert(err.message);
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };
  const askDelete = (id) => {
    setSelectedId(id);
    setShowDelete(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteContract(selectedId);
      setShowDelete(false);
      setSelectedId(null);
      loadContracts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 scroll-smooth">
      <main className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Contratos</h1>
            <p className="text-slate-500 text-sm">
              Administra, edita y renueva contratos.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo contrato
          </button>
        </div>

        {/* buscador */}
        <div className="mb-6">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, tipo o estado..."
              className="pl-10 pr-3 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* tabla con scroll horizontal */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="py-3 px-4 text-left">Empleado</th>
                <th className="py-3 px-4 text-left">Tipo</th>
                <th className="py-3 px-4 text-left">Inicio</th>
                <th className="py-3 px-4 text-left">Fin</th>
                <th className="py-3 px-4 text-left">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    Cargando contratos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-slate-500"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr
                    key={c.contratoId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 break-words">
                      {c.nombreEmpleado || "—"}
                    </td>
                    <td className="py-3 px-4">{c.tipoContrato || "—"}</td>
                    <td className="py-3 px-4">{formatDate(c.fechaInicio)}</td>
                    <td className="py-3 px-4">{formatDate(c.fechaFin)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          STATE_COLORS[c.estatusContrato] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.estatusContrato || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2 flex-wrap">
                      <button
                        title="Ver detalles"
                        className="p-2 rounded-full hover:bg-slate-100 text-blue-600"
                        onClick={() => openDetail(c.contratoId)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                      </button>
                      <button
                        title="Editar"
                        className="p-2 rounded-full hover:bg-slate-100 text-green-600"
                        onClick={() => openEdit(c.contratoId)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>

                      {/* ♻️ Renovar */}
                      <button
                        title={
                          c.tipoContrato?.toLowerCase() === "determinado"
                            ? "Renovar contrato"
                            : "Solo los contratos de tipo Determinado pueden renovarse"
                        }
                        disabled={c.tipoContrato?.toLowerCase() !== "determinado"}
                        onClick={() =>
                          c.tipoContrato?.toLowerCase() === "determinado"
                            ? openRenew(c.contratoId)
                            : null
                        }
                        className={`p-2 rounded-full transition ${
                          c.tipoContrato?.toLowerCase() === "determinado"
                            ? "text-indigo-600 hover:bg-slate-100"
                            : "text-slate-400 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          autorenew
                        </span>
                      </button>

                      <button
                        title="Eliminar"
                        className="p-2 rounded-full hover:bg-slate-100 text-red-600"
                        onClick={() => askDelete(c.contratoId)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* paginación */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-3">
          <p>
            Página {page} de {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>

      {/* Modales */}
      {showForm && (
        <CreateContractForm
          mode={mode}
          contractId={selectedId}
          onClose={() => setShowForm(false)}
          onSuccess={loadContracts}
        />
      )}

      {showDetail && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-2xl relative animate-fadeIn max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">
                  progress_activity
                </span>
                <p className="mt-2 text-slate-600 text-sm">
                  Cargando detalles del contrato...
                </p>
              </div>
            ) : detail ? (
              <>
                <div className="border-b pb-3 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[26px]">
                    description
                  </span>
                  <h2 className="text-xl font-bold text-slate-800">
                    Detalles del Contrato
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Empleado</p>
                      <p className="font-semibold text-slate-800 break-words">
                        {detail.nombreEmpleado}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Tipo</p>
                      <p className="font-semibold text-slate-800">
                        {detail.tipoContrato}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Estado</p>
                      <p
                        className={`inline-block px-2 py-[2px] text-xs font-medium rounded-full ${
                          STATE_COLORS[detail.estatusContrato]
                        }`}
                      >
                        {detail.estatusContrato}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Salario</p>
                      <p className="font-semibold text-green-700">
                        ${detail.salarioBase}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Inicio</p>
                      <p className="font-semibold">
                        {formatDate(detail.fechaInicio)}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Fin</p>
                      <p className="font-semibold">
                        {formatDate(detail.fechaFin)}
                      </p>
                    </div>
                  </div>

                  {detail.observaciones && (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                      <p className="text-xs text-indigo-700 mb-1 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-indigo-600">
                          notes
                        </span>
                        Observaciones
                      </p>
                      <p className="text-sm text-indigo-900">
                        {detail.observaciones}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mt-4 mb-2 text-slate-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-indigo-500 text-[20px]">
                        history
                      </span>
                      Renovaciones
                    </h3>
                    <ul className="list-disc ml-6 text-slate-600 text-sm">
                      {detail.renovaciones?.length ? (
                        detail.renovaciones.map((r) => (
                          <li key={r.renovacionId}>
                            {formatDate(r.fechaRenovacion)} →{" "}
                            {formatDate(r.nuevaFechaFin)} ({r.comentario})
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500">
                          Sin renovaciones
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={() => setShowDetail(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-slate-600 text-sm">
                No se pudieron cargar los detalles.
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        show={showDelete}
        message="¿Deseas eliminar este contrato? Esta acción no se puede deshacer."
        onCancel={() => setShowDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
