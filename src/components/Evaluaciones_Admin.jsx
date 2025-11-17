import { useEffect, useState } from "react";
import { ServiceEvaluacionAdmin } from "../../services/ServiceEvaluacionAdmin";

import CrearPlantillaModal from "./CrearPlantillaModal";
import DetallePlantillaModal from "./DetallePlantillaModal";

export default function Evaluaciones_Admin() {
  const [plantillas, setPlantillas] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filtros, setFiltros] = useState({ vigente: true, area_id: "" });

  const [openCrear, setOpenCrear] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  // Cargar catálogo de indicadores
  const cargarIndicadores = async () => {
    const data = await ServiceEvaluacionAdmin.getIndicadoresCatalogo();
    setIndicadores(data);
  };

  // Cargar plantillas
  const cargarPlantillas = async () => {
    const data = await ServiceEvaluacionAdmin.getPlantillas(filtros);
    setPlantillas(data);
  };

  useEffect(() => {
    cargarIndicadores();
  }, []);

  useEffect(() => {
    cargarPlantillas();
  }, [filtros]);

  // Cambiar vigencia
  const cambiarVigencia = async (id, vigente) => {
    await ServiceEvaluacionAdmin.actualizarVigencia(id, vigente);
    cargarPlantillas();
  };

  // Guardar plantilla
  const guardarPlantilla = async (data) => {
    await ServiceEvaluacionAdmin.crearPlantilla(data);
    setOpenCrear(false);
    cargarPlantillas();
  };

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Plantillas de Evaluación</h1>

        <button
          onClick={() => setOpenCrear(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Nueva Plantilla
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4 mb-4">

        {/* FILTRO ÁREA */}
        <select
          className="border px-3 py-2 rounded-lg"
          value={filtros.area_id}
          onChange={(e) =>
            setFiltros({ ...filtros, area_id: e.target.value })
          }
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.area_id} value={a.area_id}>
              {a.nombre}
            </option>
          ))}
        </select>

        {/* FILTRO VIGENCIA */}
        <select
          className="border px-3 py-2 rounded-lg"
          value={filtros.vigente}
          onChange={(e) =>
            setFiltros({ ...filtros, vigente: e.target.value === "true" })
          }
        >
          <option value="true">Vigentes</option>
          <option value="false">No vigentes</option>
        </select>
      </div>

      {/* TABLA */}
      <table className="w-full border rounded-lg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3">Área</th>
            <th className="p-3">Periodo</th>
            <th className="p-3">Vigente</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {plantillas.map((p) => (
            <tr key={p.plantilla_id} className="border-t">
              <td className="p-3">{p.nombre}</td>
              <td className="p-3">{p.nombre_area}</td>
              <td className="p-3">
                {p.periodo_inicio} → {p.periodo_fin}
              </td>
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={p.vigente}
                  onChange={(e) =>
                    cambiarVigencia(p.plantilla_id, e.target.checked)
                  }
                />
              </td>
              <td className="p-3">
                <button
                  onClick={() => {
                    setPlantillaSeleccionada(p);
                    setOpenDetalle(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODALES */}
      {openCrear && (
        <CrearPlantillaModal
          indicadores={indicadores}
          onClose={() => setOpenCrear(false)}
          onSave={guardarPlantilla}
        />
      )}

      {openDetalle && plantillaSeleccionada && (
        <DetallePlantillaModal
          plantilla={plantillaSeleccionada}
          onClose={() => setOpenDetalle(false)}
        />
      )}
    </div>
  );
}
