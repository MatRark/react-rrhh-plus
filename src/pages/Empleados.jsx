import React from "react";

export default function EmployeeTable() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Empleados</h1>

          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm">
            <span className="material-icons text-[20px]">add</span>
            Añadir empleado
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
            <span className="material-icons text-[20px]">filter_list</span>
            Filtros
          </button>

          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
            <span className="material-icons text-[20px]">download</span>
            Exportar
          </button>
        </div>

        {/* Card + Table */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="w-10 py-3 pl-4 pr-2 text-left font-semibold">
                  {/* radio header vacío */}
                </th>
                <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                <th className="py-3 px-4 text-left font-semibold">Cargo</th>
                <th className="py-3 px-4 text-left font-semibold">Departamento</th>
                <th className="py-3 px-4 text-left font-semibold">Estado</th>
                <th className="py-3 px-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 pl-4 pr-2 align-middle">
                  <input type="radio" name="row" className="h-4 w-4 accent-blue-600" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Ana García"
                      src="https://i.pravatar.cc/100?img=47"
                    />
                    <div>
                      <div className="font-medium text-slate-900">Ana García</div>
                      <div className="text-sm text-slate-500">ana.garcia@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">Desarrollador Frontend</td>
                <td className="py-4 px-4">Tecnología</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <button className="hover:text-blue-600" title="Editar">
                      <span className="material-icons text-[20px]">edit</span>
                    </button>
                    <button className="hover:text-slate-700" title="Eliminar">
                      <span className="material-icons text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 pl-4 pr-2">
                  <input type="radio" name="row" className="h-4 w-4 accent-blue-600" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                    <div>
                      <div className="font-medium">Carlos Rodriguez</div>
                      <div className="text-sm text-slate-500">carlos.r@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">Gerente de Proyectos</td>
                <td className="py-4 px-4">Gestión</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <button className="hover:text-blue-600" title="Editar">
                      <span className="material-icons text-[20px]">edit</span>
                    </button>
                    <button className="hover:text-slate-700" title="Eliminar">
                      <span className="material-icons text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 pl-4 pr-2">
                  <input type="radio" name="row" className="h-4 w-4 accent-blue-600" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Laura Martinez"
                      src="https://i.pravatar.cc/100?img=65"
                    />
                    <div>
                      <div className="font-medium">Laura Martinez</div>
                      <div className="text-sm text-slate-500">laura.m@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">Diseñadora UX/UI</td>
                <td className="py-4 px-4">Diseño</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    Inactivo
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <button className="hover:text-blue-600" title="Editar">
                      <span className="material-icons text-[20px]">edit</span>
                    </button>
                    <button className="hover:text-slate-700" title="Eliminar">
                      <span className="material-icons text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 pl-4 pr-2">
                  <input type="radio" name="row" className="h-4 w-4 accent-blue-600" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                    <div>
                      <div className="font-medium">Javier Pérez</div>
                      <div className="text-sm text-slate-500">javier.p@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">Analista de Datos</td>
                <td className="py-4 px-4">Business Intelligence</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <button className="hover:text-blue-600" title="Editar">
                      <span className="material-icons text-[20px]">edit</span>
                    </button>
                    <button className="hover:text-slate-700" title="Eliminar">
                      <span className="material-icons text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer / Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <span className="text-sm text-slate-500">
              Mostrando 1-4 de 25 resultados
            </span>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm">
                Anterior
              </button>

              <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm shadow-sm">
                1
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm">
                2
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm">
                3
              </button>

              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
