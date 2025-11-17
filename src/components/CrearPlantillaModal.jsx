import { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

export default function CrearPlantillaModal({ indicadores,areas, onClose, onSave }) {
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        area_id: '',
        periodo_inicio: '',
        periodo_fin: '',
        indicadores: [{ catalogo_id: '', ponderacion: '' }]
    });

    const total = form.indicadores.reduce((s, i) => s + (Number(i.ponderacion) || 0), 0);
    const esValido = total === 100 && form.nombre && form.area_id && form.periodo_inicio && form.periodo_fin;

    const agregarFila = () => {
        setForm({
            ...form,
            indicadores: [...form.indicadores, { catalogo_id: '', ponderacion: '' }]
        });
    };

    const eliminarFila = (i) => {
        setForm({
            ...form,
            indicadores: form.indicadores.filter((_, idx) => idx !== i)
        });
    };

    const actualizar = (i, campo, valor) => {
        const nuevos = [...form.indicadores];
        nuevos[i][campo] = valor;
        setForm({ ...form, indicadores: nuevos });
    };

    const handleSubmit = () => {
        if (!esValido) return;

        onSave({
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            area_id: Number(form.area_id),
            periodo_inicio: form.periodo_inicio,
            periodo_fin: form.periodo_fin,
            indicadores: form.indicadores
                .filter(i => i.catalogo_id && i.ponderacion)
                .map(i => ({
                    catalogo_id: Number(i.catalogo_id),
                    ponderacion: Number(i.ponderacion)
                }))
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full my-8 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Plantilla</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                        placeholder="Nombre de la plantilla *"
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="date"
                        value={form.periodo_inicio}
                        onChange={e => setForm({ ...form, periodo_inicio: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="date"
                        value={form.periodo_fin}
                        onChange={e => setForm({ ...form, periodo_fin: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={form.area_id}
                        onChange={e => setForm({ ...form, area_id: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecciona área *</option>
                        {areas.map(a => (
                            <option key={a.area_id} value={a.area_id}>
                                {a.nombre}
                            </option>
                        ))}
                    </select>

                    <textarea
                        placeholder="Descripción (opcional)"
                        value={form.descripcion}
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                    />
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">Indicadores</span>
                        <span className={`font-semibold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            Total: {total}% {total !== 100 && '(debe ser 100%)'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${total === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(total, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden mb-6">
                    <table className="w-full">
                        <tbody>
                            {form.indicadores.map((ind, i) => (
                                <tr key={i} className="border-b last:border-b-0">
                                    <td className="p-2 w-full">
                                        <select
                                            value={ind.catalogo_id}
                                            onChange={e => actualizar(i, 'catalogo_id', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                                            placeholder="%"
                                            value={ind.ponderacion}
                                            onChange={e => actualizar(i, 'ponderacion', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="p-2 w-12 text-center">
                                        {i === form.indicadores.length - 1 ? (
                                            <button
                                                onClick={agregarFila}
                                                className="text-green-600 hover:text-green-800 transition"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => eliminarFila(i)}
                                                className="text-red-600 hover:text-red-800 transition"
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

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!esValido}
                        className={`px-6 py-2 rounded-lg font-medium text-white transition ${esValido
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Guardar Plantilla
                    </button>
                </div>
            </div>
        </div>
    );
}