// src/components/CrearPlantillaModal.jsx
import { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";

export default function CrearPlantillaModal({
  modo = "crear",
  plantilla,
  indicadores,
  areas,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    area_id: "",
    periodo_inicio: "",
    periodo_fin: "",
    indicadores: [{ catalogo_id: "", ponderacion: "" }]
  });

  // Precargar solo si modo = editar
  useEffect(() => {
    if (modo === "editar" && plantilla) {
      setForm({
        nombre: plantilla.nombre,
        descripcion: plantilla.descripcion || "",
        area_id: plantilla.area_id,
        periodo_inicio: plantilla.periodo_inicio,
        periodo_fin: plantilla.periodo_fin,
        indicadores: plantilla.indicadores.map(i => ({
          catalogo_id: i.catalogo_id,
          ponderacion: i.ponderacion
        }))
      });
    }
  }, [modo, plantilla]);

  const total = form.indicadores.reduce(
    (a, b) => a + (Number(b.ponderacion) || 0),
    0
  );

  const esValido =
    total === 100 &&
    form.nombre &&
    form.area_id &&
    form.periodo_inicio &&
    form.periodo_fin;

  const actualizar = (i, campo, valor) => {
    const nuevos = [...form.indicadores];
    nuevos[i][campo] = valor;

    setForm({ ...form, indicadores: nuevos });
  };

  const agregarFila = () => {
    setForm({
      ...form,
      indicadores: [...form.indicadores, { catalogo_id: "", ponderacion: "" }]
    });
  };

  const eliminarFila = (i) => {
    setForm({
      ...form,
      indicadores: form.indicadores.filter((_, idx) => idx !== i)
    });
  };

  const handleSubmit = () => {
    if (!esValido) return;

    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      area_id: Number(form.area_id),
      periodo_inicio: form.periodo_inicio,
      periodo_fin: form.periodo_fin,
      indicadores: form.indicadores.map(i => ({
        catalogo_id: Number(i.catalogo_id),
        ponderacion: Number(i.ponderacion)
      }))
    };

    if (modo === "editar") {
      data.plantilla_id = plantilla.plantilla_id;
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 p-6 shadow-xl">

        {/* titulo */}
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {modo === "crear" ? "Crear Nueva Plantilla" : "Editar Plantilla"}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Nombre *"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="border px-4 py-2 rounded-lg"
          />

          <select
            value={form.area_id}
            onChange={e => setForm({ ...form, area_id: e.target.value })}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="">Selecciona área *</option>
            {areas.map(a => (
              <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
            ))}
          </select>

          <input
            type="date"
            value={form.periodo_inicio}
            onChange={e => setForm({ ...form, periodo_inicio: e.target.value })}
            className="border px-4 py-2 rounded-lg"
          />

          <input
            type="date"
            value={form.periodo_fin}
            onChange={e => setForm({ ...form, periodo_fin: e.target.value })}
            className="border px-4 py-2 rounded-lg"
          />

          <textarea
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            className="border px-4 py-2 rounded-lg md:col-span-2"
            rows={2}
          />
        </div>

        {/* barra */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Total ponderación: </span>
            <span className={total === 100 ? "text-green-600" : "text-red-600"}>
              {total}% (debe ser 100%)
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${total === 100 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(total, 100)}%` }}
            />
          </div>
        </div>

        {/* tabla indicadores */}
        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <tbody>
              {form.indicadores.map((ind, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">
                    <select
                      value={ind.catalogo_id}
                      onChange={e => actualizar(i, "catalogo_id", e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                    >
                      <option value="">Seleccionar indicador...</option>
                      {indicadores.map(ic => (
                        <option key={ic.catalogo_id} value={ic.catalogo_id}>
                          {ic.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={ind.ponderacion}
                      onChange={e => actualizar(i, "ponderacion", e.target.value)}
                      className="border px-3 py-2 rounded text-center w-full"
                    />
                  </td>

                  <td className="p-2 w-12 text-center">
                    {i === form.indicadores.length - 1 ? (
                      <button className="text-green-600 hover:text-green-800" onClick={agregarFila}>
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button className="text-red-600 hover:text-red-800" onClick={() => eliminarFila(i)}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* botones */}
        <div className="flex justify-end gap-3">
          <button className="px-5 py-2 border rounded-lg" onClick={onClose}>Cancelar</button>

          <button
            onClick={handleSubmit}
            disabled={!esValido}
            className={`px-6 py-2 rounded-lg text-white ${
              esValido ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {modo === "editar" ? "Actualizar" : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}
