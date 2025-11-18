// src/components/CrearPlantillaModal.jsx
import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";

// Formato YYYY-MM-DD
const normalizarFecha = (f) => {
    if (!f) return "";
    if (f.includes("T")) return f.split("T")[0];
    if (f.includes("/")) {
        const [dd, mm, yyyy] = f.split("/");
        return `${yyyy}-${mm}-${dd}`;
    }
    return f;
};

export default function CrearPlantillaModal({ indicadores, areas, onClose, onSave }) {

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        area_id: "",
        periodo_inicio: "",
        periodo_fin: "",
        indicadores: [{ catalogo_id: "", ponderacion: "" }]
    });

    // ---------------- VALIDACIONES ----------------
    const total = form.indicadores.reduce(
        (a, b) => a + (Number(b.ponderacion || 0) || 0),
        0
    );

    const validTotal = total === 100;

    const actualizar = (i, campo, valor) => {
        const copia = [...form.indicadores];

        if (campo === "ponderacion") {
            if (valor === "") {
                copia[i].ponderacion = "";
            } else {
                let num = Number(valor);
                if (num < 0) num = 0;
                if (num > 100) num = 100;
                copia[i].ponderacion = String(num);
            }
        } else {
            copia[i][campo] = valor;
        }

        setForm({ ...form, indicadores: copia });
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
            indicadores: form.indicadores.filter((_, idx) => i !== idx)
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
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            area_id: Number(form.area_id),
            periodo_inicio: normalizarFecha(form.periodo_inicio),
            periodo_fin: normalizarFecha(form.periodo_fin),
            indicadores: form.indicadores.map(i => ({
                catalogo_id: Number(i.catalogo_id),
                ponderacion: Number(i.ponderacion)
            }))
        };

        onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Crear nueva plantilla</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <div>
                        <label className="text-sm font-semibold">Nombre *</label>
                        <input
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Ej. Evaluación Anual Desarrollo"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Área *</label>
                        <select
                            value={form.area_id}
                            onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">Selecciona un área</option>
                            {areas.map(a => (
                                <option key={a.area_id} value={a.area_id}>
                                    {a.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Fecha de inicio *</label>
                        <input
                            type="date"
                            value={form.periodo_inicio}
                            onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Fecha de fin *</label>
                        <input
                            type="date"
                            value={form.periodo_fin}
                            onChange={(e) => setForm({ ...form, periodo_fin: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Agrega una breve descripción a la plantilla"
                            className="w-full px-4 py-2 border rounded-lg"
                            rows={2}
                        />
                    </div>

                </div>

                {/* BARRA DE PONDERACION */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1 text-sm">
                        <span>Total ponderación:</span>
                        <span className={validTotal ? "text-green-600" : "text-red-600"}>
                            {total}% (debe ser 100%)
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${validTotal ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(total, 100)}%` }}
                        />
                    </div>
                </div>

                {/* TABLA INDICADORES */}
                <div className="border rounded-lg mb-6 overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {form.indicadores.map((ind, i) => (
                                <tr key={i} className="border-b last:border-b-0">

                                    <td className="p-2">
                                        <label className="text-xs text-gray-500">Indicador</label>
                                        <select
                                            value={ind.catalogo_id}
                                            onChange={(e) =>
                                                actualizar(i, "catalogo_id", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="">Seleccionar indicador...</option>
                                            {indicadores.map(ic => (
                                                <option key={ic.catalogo_id} value={ic.catalogo_id}>
                                                    {ic.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="p-2 w-28">
                                        <label className="text-xs text-gray-500">% Ponderación</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={ind.ponderacion}
                                            onChange={(e) =>
                                                actualizar(i, "ponderacion", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border rounded-lg text-center"
                                        />
                                    </td>

                                    <td className="p-2 w-12 text-center align-bottom">
                                        {i === form.indicadores.length - 1 ? (
                                            <button onClick={agregarFila} className="text-green-600">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => eliminarFila(i)}
                                                className="text-red-600"
                                            >
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
                        className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!esValido}
                        className={`px-6 py-2 rounded-lg text-white ${
                            esValido ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                        }`}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
