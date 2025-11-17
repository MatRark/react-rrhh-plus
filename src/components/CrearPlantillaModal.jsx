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

    // Pre-cargar datos si editas
    useEffect(() => {
        if (modo === "editar" && plantilla) {
            const normalizarFecha = (fecha) =>
                fecha ? fecha.split("T")[0] : "";

            setForm({
                nombre: plantilla.nombre || "",
                descripcion: plantilla.descripcion || "",
                area_id: plantilla.area_id || "",
                periodo_inicio: normalizarFecha(plantilla.periodo_inicio),
                periodo_fin: normalizarFecha(plantilla.periodo_fin),
                indicadores:
                    plantilla.indicadores?.map(i => ({
                        catalogo_id: i.catalogo_id,
                        ponderacion: String(Number(i.ponderacion))
                    })) || [{ catalogo_id: "", ponderacion: "" }]
            });

        }
    }, [modo, plantilla]);

    // ===========================
    // VALIDACIONES
    // ===========================

    const total = form.indicadores.reduce(
        (a, b) => a + (Number(b.ponderacion || 0) || 0),
        0
    );

    const validTotal = total === 100;

    const actualizar = (i, campo, valor) => {
        const nuevos = [...form.indicadores];

        if (campo === "ponderacion") {
            // permitir vacío mientras escribe
            if (valor === "") {
                nuevos[i].ponderacion = "";
            } else {
                let num = Number(valor);
                if (isNaN(num)) num = 0;
                if (num < 0) num = 0;
                if (num > 100) num = 100;
                // 👇 siempre guardamos sin ceros a la izquierda
                nuevos[i].ponderacion = String(num);
            }
        } else {
            nuevos[i][campo] = valor;
        }

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

    const esValido =
        validTotal &&
        form.nombre &&
        form.area_id &&
        form.periodo_inicio &&
        form.periodo_fin;

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
                ponderacion: Number(i.ponderacion || 0)
            }))
        };

        if (modo === "editar") {
            data.plantilla_id = plantilla.plantilla_id;
        }

        onSave(data);
    };

    // ===========================
    // UI
    // ===========================
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full my-8 p-6 shadow-xl">

                {/* Título */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {modo === "crear" ? "Crear Nueva Plantilla" : "Editar Plantilla"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* FORMULARIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Nombre */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Nombre *</label>
                        <input
                            placeholder="Escribe un nombre descriptivo"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Área */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Área *</label>
                        <select
                            value={form.area_id}
                            onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecciona un área</option>
                            {areas.map(a => (
                                <option key={a.area_id} value={a.area_id}>{a.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha inicio */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de inicio *</label>
                        <input
                            type="date"
                            value={form.periodo_inicio}
                            onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Fecha fin */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de fin *</label>
                        <input
                            type="date"
                            value={form.periodo_fin}
                            onChange={(e) => setForm({ ...form, periodo_fin: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Descripción (opcional)</label>
                        <textarea
                            placeholder="Puedes agregar una nota descriptiva aquí"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        />
                    </div>
                </div>

                {/* BARRA PONDERACIÓN */}
                <div className="flex justify-between text-sm mb-1">
                    <span>Total ponderación:</span>

                    <span className={validTotal ? "text-green-600" : "text-red-600"}>
                        {total}% (debe ser 100%)
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                        className={`h-full rounded-full transition-all ${validTotal ? "bg-green-500" : "bg-red-500"
                            }`}
                        style={{ width: `${Math.min(total, 100)}%` }}
                    />
                </div>

                {/* TABLA INDICADORES */}
                <div className="border rounded-lg overflow-hidden mb-6">
                    <table className="w-full">
                        <tbody>
                            {form.indicadores.map((ind, i) => (
                                <tr key={i} className="border-b">

                                    {/* Indicador */}
                                    <td className="p-2 w-full">
                                        <label className="text-xs text-gray-500">Indicador</label>
                                        <select
                                            value={ind.catalogo_id}
                                            onChange={(e) => actualizar(i, "catalogo_id", e.target.value)}
                                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar indicador...</option>
                                            {indicadores.map(ic => (
                                                <option key={ic.catalogo_id} value={ic.catalogo_id}>
                                                    {ic.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Ponderación */}
                                    <td className="p-2 w-32">
                                        <label className="text-xs text-gray-500">% Ponderación</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={ind.ponderacion}
                                            onChange={(e) => actualizar(i, "ponderacion", e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border rounded text-center focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>

                                    {/* Botón agregar/eliminar */}
                                    <td className="p-2 w-12 text-center align-bottom">
                                        {i === form.indicadores.length - 1 ? (
                                            <button onClick={agregarFila} className="text-green-600 hover:text-green-800">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button onClick={() => eliminarFila(i)} className="text-red-600 hover:text-red-800">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* BOTONES */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!esValido}
                        className={`px-6 py-2 rounded-lg text-white transition ${esValido
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {modo === "editar" ? "Actualizar" : "Guardar"}
                    </button>
                </div>

            </div>
        </div>
    );
}
