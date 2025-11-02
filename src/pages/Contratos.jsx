import React, { useMemo, useState } from "react";

/* ===============================
   Datos de ejemplo (mock)
================================= */
const MOCK_CONTRACTS = [
  {
    nombre: "Ana Torres",
    tipo: "Tiempo Completo",
    inicio: "2023-01-01",
    fin: "2024-12-31",
    estado: "Activo",
  },
  {
    nombre: "Carlos Ruiz",
    tipo: "Medio Tiempo",
    inicio: "2023-03-15",
    fin: "—",
    estado: "Activo",
  },
  {
    nombre: "Elena Gómez",
    tipo: "Por Proyecto",
    inicio: "2024-06-01",
    fin: "2024-09-30",
    estado: "Próximo",
  },
  {
    nombre: "Javier Morales",
    tipo: "Temporal",
    inicio: "2024-02-01",
    fin: "2024-05-31",
    estado: "Vencido",
  },
];

/* ===============================
   Utilidades visuales
================================= */
const STATE_COLORS = {
  Activo: "bg-green-100 text-green-800",
  Próximo: "bg-blue-100 text-blue-800",
  Vencido: "bg-gray-200 text-gray-700",
  Suspendido: "bg-yellow-100 text-yellow-700",
};

const TABLE_COLUMNS = [
  "Nombre",
  "Tipo de Contrato",
  "Fecha de Inicio",
  "Fecha de Fin",
  "Estado",
  "Acciones",
];

const ActionButton = ({ icon, tone = "default", onClick }) => {
  const colors =
    tone === "danger"
      ? "hover:text-red-600 dark:hover:text-red-500"
      : "hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <button
      className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition ${colors}`}
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
};

/* ===============================
   Componente principal
================================= */
export default function ContractTable() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CONTRACTS.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q)
    );
  }, [query]);

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
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto justify-center">
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
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Filtros
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="w-10 py-3 pl-4 pr-2"></th> {/* ojito */}
                    <th className="py-3 px-4 font-semibold">Nombre</th>
                    <th className="py-3 px-4 font-semibold">Tipo de Contrato</th>
                    <th className="py-3 px-4 font-semibold">Fecha de Inicio</th>
                    <th className="py-3 px-4 font-semibold">Fecha de Fin</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filtered.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {/* 👁️ Ojito a la izquierda */}
                      <td className="py-3 pl-4 pr-2">
                        <button
                          className="text-slate-400 hover:text-blue-600"
                          title="Ver detalles"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí tu lógica para abrir detalle del contrato
                            // setSelectedContract(r.id);
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </td>

                      {/* Nombre */}
                      <td className="py-3 px-4 font-medium text-slate-800">{r.nombre}</td>

                      {/* Tipo */}
                      <td className="py-3 px-4 text-slate-600">{r.tipo}</td>

                      {/* Fechas */}
                      <td className="py-3 px-4 text-slate-600">{r.inicio}</td>
                      <td className="py-3 px-4 text-slate-600">{r.fin}</td>

                      {/* Estado */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${STATE_COLORS[r.estado] || "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {r.estado}
                        </span>
                      </td>

                      {/* Acciones (igual que antes) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-600 transition"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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
                  Anterior d
                </button>
                <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
