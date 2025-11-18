// components/Postulation.jsx
import { useState, useMemo, useEffect } from "react";
import PostulationForm from "./PostulationForm";
import PostulationDetailModal from "./PostulationDetailModal";
import PostulationEditModal from "./PostulationEditModal";
import { getPostulaciones } from "../services/postulacionesService";
import { getVacantes } from "../services/vacantesService";

const STATUS_COLORS = {
  recibida: "bg-blue-100 text-blue-800",
  en_revision: "bg-yellow-100 text-yellow-800",
  entrevista: "bg-purple-100 text-purple-800",
  aceptada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  recibida: "Recibida",
  en_revision: "En Revisión",
  entrevista: "Entrevista",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const PAGE_SIZE = 6; // Registros por página

export default function Postulation() {
  const [postulations, setPostulations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPostulationId, setSelectedPostulationId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVacancy, setFilterVacancy] = useState("");
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lista de vacantes para el filtro
  const [vacantes, setVacantes] = useState([]);

  // Cargar vacantes para el dropdown de filtros
  useEffect(() => {
    const fetchVacantes = async () => {
      try {
        const data = await getVacantes();
        // Asegurarse de que sea un array
        const vacantesArray = Array.isArray(data) ? data : (data.data || data.items || []);
        setVacantes(vacantesArray);
      } catch (err) {
        console.error("Error al cargar vacantes para filtros:", err);
        setVacantes([]); // Asegurar que sea un array vacío en caso de error
      }
    };

    fetchVacantes();
  }, []);

const fetchPostulations = async () => {
  try {
    setLoading(true);
    setError(null);

    // NO enviar page ni pageSize
    const filters = {};
    
    if (filterStatus) filters.estatus = filterStatus;
    if (filterVacancy) filters.vacanteNombre = filterVacancy;

    const data = await getPostulaciones(filters);
    const postulacionesArray = Array.isArray(data) ? data : (data.items || data.data || []);
    setPostulations(postulacionesArray); // TODOS los registros
  } catch (err) {
    setError(err.message);
    setPostulations([]);
  } finally {
    setLoading(false);
  }
};

// El resto del código de paginación local queda igual

  // Cargar postulaciones al montar y cuando cambien los filtros o página
  useEffect(() => {
    fetchPostulations();
  }, [currentPage, filterStatus, filterVacancy]);

  const handlePostulationCreated = () => {
    // Recargar las postulaciones después de crear una nueva
    setCurrentPage(1); // Volver a la primera página
    fetchPostulations();
  };

  const handlePostulationUpdated = () => {
    // Recargar las postulaciones después de actualizar
    fetchPostulations();
  };

  const handleViewDetails = (postulacionId) => {
    setSelectedPostulationId(postulacionId);
    setShowDetailModal(true);
  };

  const handleEdit = (postulacionId) => {
    setSelectedPostulationId(postulacionId);
    setShowEditModal(true);
  };

  // Filtrado LOCAL por búsqueda de texto (nombre o email)
  const filtered = useMemo(() => {
    // Asegurarse de que postulations sea un array
    if (!Array.isArray(postulations)) return [];
    if (!query.trim()) return postulations;

    const q = query.trim().toLowerCase();
    return postulations.filter(
      (p) =>
        p.nombreContacto?.toLowerCase().includes(q) ||
        p.emailContacto?.toLowerCase().includes(q)
    );
  }, [postulations, query]);

  // Paginación LOCAL sobre datos ya filtrados por búsqueda
  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  
  const paginatedData = useMemo(() => {
    if (!Array.isArray(filtered)) return [];
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  // Funciones de paginación
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset a página 1 cuando cambien los filtros
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Opciones únicas para filtro de vacantes
  const vacancyOptions = useMemo(() => {
    return ["Todas", ...vacantes.map((v) => v.titulo)];
  }, [vacantes]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX");
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Postulaciones</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Postulación
          </button>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
              <button 
                onClick={fetchPostulations}
                className="ml-auto text-red-700 underline hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* FILTROS Y BÚSQUEDA */}
        <div className="mb-6 space-y-3">
          {/* Búsqueda LOCAL */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus)(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="recibida">Recibida</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>

            <select
              value={filterVacancy}
              onChange={(e) => handleFilterChange(setFilterVacancy)(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vacancyOptions.map((vac) => (
                <option key={vac} value={vac === "Todas" ? "" : vac}>
                  {vac === "Todas" ? "Todas las vacantes" : vac}
                </option>
              ))}
            </select>

            {(filterStatus || filterVacancy || query) && (
              <button
                onClick={() => {
                  setFilterStatus("");
                  setFilterVacancy("");
                  setQuery("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Candidato</th>
                  <th className="py-3 px-4 font-semibold">Vacante</th>
                  <th className="py-3 px-4 font-semibold">Fecha</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Cargando postulaciones...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No se encontraron postulaciones
                    </td>
                  </tr>
                )}

                {!loading && paginatedData.map((post) => (
                  <tr key={post.postulacionId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {post.nombreContacto}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium">{post.nombreVacante || post.vacante}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(post.fechaPostulacion)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[post.estatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {STATUS_LABELS[post.estatus] || post.estatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(post.postulacionId)}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(post.postulacionId)}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-orange-600 transition"
                          title="Editar estado"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {!loading && filtered.length > 0 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info de registros */}
              <div className="text-sm text-slate-600">
                Mostrando <span className="font-semibold">{startIndex + 1}</span> a{" "}
                <span className="font-semibold">{Math.min(endIndex, filtered.length)}</span> de{" "}
                <span className="font-semibold">{filtered.length}</span> resultado{filtered.length !== 1 && "s"}
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {/* Botón Anterior */}
                  <button
                    onClick={prevPage}
                    disabled={validCurrentPage === 1}
                    className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                            validCurrentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Indicador móvil de página actual */}
                  <div className="sm:hidden text-sm text-slate-600 font-medium">
                    Página {validCurrentPage} de {totalPages}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={nextPage}
                    disabled={validCurrentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de creación */}
      {showCreateForm && (
        <PostulationForm
          onClose={() => setShowCreateForm(false)}
          onPostulationCreated={handlePostulationCreated}
        />
      )}

      {/* Modal de detalles */}
      {showDetailModal && (
        <PostulationDetailModal
          postulacionId={selectedPostulationId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPostulationId(null);
          }}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && (
        <PostulationEditModal
          postulacionId={selectedPostulationId}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPostulationId(null);
          }}
          onPostulationUpdated={handlePostulationUpdated}
        />
      )}
    </div>
  );
}