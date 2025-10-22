import React, { useMemo, useState } from "react";

// Badge reutilizable
const StatusBadge = ({ status }) => {
  const isActive = String(status).toLowerCase() === "activo";
  const base = "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full";
  return (
    <span className={`${base} ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
};

export default function EmployeeTable() {
  // Mock temporal. Sustituye por datos del backend.
  const [data] = useState([
    {
      id: "1",
      name: "Ana García",
      email: "ana.garcia@example.com",
      role: "Desarrollador Frontend",
      dept: "Tecnología",
      status: "Activo",
      avatar: "https://i.pravatar.cc/100?img=47",
    },
    {
      id: "2",
      name: "Carlos Rodriguez",
      email: "carlos.r@example.com",
      role: "Gerente de Proyectos",
      dept: "Gestión",
      status: "Activo",
      avatar: null,
    },
    {
      id: "3",
      name: "Laura Martinez",
      email: "laura.m@example.com",
      role: "Diseñadora UX/UI",
      dept: "Diseño",
      status: "Inactivo",
      avatar: "https://i.pravatar.cc/100?img=65",
    },
    {
      id: "4",
      name: "Javier Pérez",
      email: "javier.p@example.com",
      role: "Analista de Datos",
      dept: "Business Intelligence",
      status: "Activo",
      avatar: null,
    },
  ]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((x) =>
      [x.name, x.email, x.role, x.dept, x.status].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExport = () => {
    const headers = ["Nombre", "Email", "Cargo", "Departamento", "Estado"];
    const rows = filtered.map((r) => [r.name, r.email, r.role, r.dept, r.status]);
    const csv =
      [headers, ...rows].map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "empleados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const jump = (n) => setPage(n);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Empleados</h1>

          <button
            type="button"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
            aria-label="Añadir empleado"
            onClick={() => console.log("add")}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
            Añadir empleado
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <label htmlFor="search" className="sr-only">Buscar empleado</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" aria-hidden="true">
              search
            </span>
            <input
              id="search"
              type="text"
              placeholder="Buscar empleado..."
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            onClick={() => console.log("filters")}
            aria-label="Abrir filtros"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">filter_list</span>
            Filtros
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            onClick={handleExport}
            aria-label="Exportar CSV"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">download</span>
            Exportar
          </button>
        </div>

        {/* Card + Table */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Listado de empleados</caption>
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="w-10 py-3 pl-4 pr-2 text-left font-semibold" scope="col"></th>
                  <th className="py-3 px-4 text-left font-semibold" scope="col">Nombre</th>
                  <th className="py-3 px-4 text-left font-semibold" scope="col">Cargo</th>
                  <th className="py-3 px-4 text-left font-semibold" scope="col">Departamento</th>
                  <th className="py-3 px-4 text-left font-semibold" scope="col">Estado</th>
                  <th className="py-3 px-4 text-left font-semibold" scope="col">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {slice.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-4 pl-4 pr-2 align-middle">
                      <input
                        type="radio"
                        name="row"
                        className="h-4 w-4 accent-blue-600"
                        aria-label={`Seleccionar ${row.name}`}
                        checked={selectedId === row.id}
                        onChange={() => setSelectedId(row.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {row.avatar ? (
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            alt={`Avatar de ${row.name}`}
                            src={row.avatar}
                            loading="lazy"
                          />
                        ) : (
                          <span className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" aria-hidden="true" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{row.name}</div>
                          <div className="text-sm text-slate-500">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{row.role}</td>
                    <td className="py-4 px-4">{row.dept}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <button
                          type="button"
                          className="hover:text-blue-600"
                          title="Editar"
                          aria-label={`Editar ${row.name}`}
                          onClick={() => console.log("edit", row.id)}
                        >
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit</span>
                        </button>
                        <button
                          type="button"
                          className="hover:text-slate-700"
                          title="Eliminar"
                          aria-label={`Eliminar ${row.name}`}
                          onClick={() => console.log("delete", row.id)}
                        >
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {slice.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <span className="text-sm text-slate-500">
              Mostrando {(currentPage - 1) * pageSize + (slice.length ? 1 : 0)}-{(currentPage - 1) * pageSize + slice.length} de {total} resultados
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50"
                onClick={goPrev}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const n = i + 1;
                const isActive = n === currentPage;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`px-3 py-1 rounded-lg text-sm ${isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                    onClick={() => jump(n)}
                  >
                    {n}
                  </button>
                );
              })}

              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50"
                onClick={goNext}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
