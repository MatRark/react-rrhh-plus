import React, { useMemo, useState, useEffect } from "react";
import CreateContractForm from "../components/CreateContractForm";
import { getUserInfo } from "../services/authService";
import { getMyContract, getAllContracts } from "../services/contractService";

/* ===============================
   Utilidades visuales
================================= */
const STATE_COLORS = {
  Activo: "bg-green-100 text-green-800",
  Vigente: "bg-green-100 text-green-800",
  Próximo: "bg-blue-100 text-blue-800",
  Vencido: "bg-gray-200 text-gray-700",
  Suspendido: "bg-yellow-100 text-yellow-700",
  Finalizado: "bg-gray-200 text-gray-700",
};

/* ===============================
   Vista para EMPLEADO (Solo lectura)
================================= */
function EmployeeContractView() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyContract();
  }, []);

  const loadMyContract = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyContract();
      setContract(data);
      console.log(data)
    } catch (err) {
      setError(err.message || "Error al cargar tu contrato");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-blue-600 animate-spin">refresh</span>
          <p className="mt-4 text-slate-600">Cargando tu contrato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-3xl">info</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Sin contrato activo</h3>
                <p className="text-blue-600">No tienes un contrato registrado en el sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Contrato</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta la información de tu contrato vigente.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header del contrato */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-3xl">description</span>
                  <h2 className="text-2xl font-bold">{contract.tipoContrato}</h2>
                </div>
                <p className="text-white/80">Contrato ID: #{contract.contratoId}</p>
              </div>
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  STATE_COLORS[contract.estatusContrato] || "bg-white/20 text-white"
                }`}
              >
                {contract.estatusContrato}
              </span>
            </div>
          </div>

          {/* Contenido del contrato */}
          <div className="p-6 space-y-6">
            {/* Fechas */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">event</span>
                Periodo del Contrato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Fecha de Inicio</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {formatDate(contract.fechaInicio)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Fecha de Fin</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {formatDate(contract.fechaFin)}
                  </p>
                </div>
              </div>
            </section>

            {/* Salario */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">payments</span>
                Compensación
              </h3>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-700 mb-1">Salario Base</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(contract.salarioBase)}
                </p>
                <p className="text-xs text-green-600 mt-1">por mes</p>
              </div>
            </section>

            {/* Observaciones (si existen) */}
            {contract.observaciones && (
              <section>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-600">notes</span>
                  Observaciones
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">{contract.observaciones}</p>
                </div>
              </section>
            )}

            {/* Información adicional */}
            <section className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <p>
                  Esta información es de solo lectura. Para cualquier modificación o consulta,
                  contacta al departamento de Recursos Humanos.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Vista para ADMIN/GESTOR (Gestión completa)
================================= */
function AdminContractView() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllContracts();
      setContracts(data);
      console.log(data);
    } catch (err) {
      setError(err.message || "Error al cargar contratos");
    } finally {
      setLoading(false);
    }
  };

  const handleContractCreated = (newContract) => {
    console.log("Nuevo contrato creado:", newContract);
    loadContracts(); // Recargar la lista
    setShowCreateForm(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Contratos</h1>
              <p className="text-slate-500 text-sm mt-1">
                Gestiona todos los contratos de tus empleados.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nuevo contrato
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="relative flex-1 min-w-[220px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, tipo o estado..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="w-10 py-3 pl-4 pr-2"></th>
                    <th className="py-3 px-4 font-semibold">Empleado</th>
                    <th className="py-3 px-4 font-semibold">Tipo de Contrato</th>
                    <th className="py-3 px-4 font-semibold">Fecha de Inicio</th>
                    <th className="py-3 px-4 font-semibold">Fecha de Fin</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Cargando contratos...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No se encontraron contratos
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !error &&
                    filtered.map((r) => (
                      <tr key={r.contratoId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pl-4 pr-2">
                          <button
                            className="text-slate-400 hover:text-blue-600"
                            title="Ver detalles"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Lógica para ver detalle
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {r.nombreEmpleado || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{r.tipoContrato || "—"}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(r.fechaInicio)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(r.fechaFin)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              STATE_COLORS[r.estatusContrato] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.estatusContrato || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            <button
                              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-600 transition"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <p className="text-slate-500">
                Mostrando <b>{filtered.length}</b> resultado
                {filtered.length !== 1 && "s"}
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50">
                  Anterior
                </button>
                <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de creación de contrato */}
      {showCreateForm && (
        <CreateContractForm
          onClose={() => setShowCreateForm(false)}
          onContractCreated={handleContractCreated}
        />
      )}
    </div>
  );
}

/* ===============================
   Componente principal - Router por rol
================================= */
export default function ContractTable() {
  const { roles } = getUserInfo();

  // Determinar si el usuario es empleado (solo empleado, sin otros roles de admin)
  const isEmployee = roles?.includes("empleado") && 
                     !roles?.includes("admin") && 
                     !roles?.includes("gestor_empleados");

  // Mostrar vista según el rol
  return isEmployee ? <EmployeeContractView /> : <AdminContractView />;
}