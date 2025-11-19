import { useEffect, useState } from "react";
import {
    getPlantillasVigentes,
    getEmpleadosDisponibles,
    getEvaluaciones,
    crearEvaluacion,
    getEvaluacionById,
    actualizarEvaluacion,
} from "../services/evaluacionesService";

// COMPONENTE CARGANDO BONITO
function LoadingOverlay({ message = "Cargando..." }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xl font-semibold text-slate-700">{message}</span>
            </div>
        </div>
    );
}

// SKELETON PARA FILAS DE TABLA
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
            <td className="px-4 py-4"><div className="h-8 bg-slate-200 rounded-full w-20 mx-auto"></div></td>
            <td className="px-4 py-4"><div className="h-8 bg-slate-200 rounded w-24"></div></td>
        </tr>
    );
}

export default function VistaEvaluaciones() {
    // ESTADOS PRINCIPALES
    const [areaId, setAreaId] = useState("");
    const [estatus, setEstatus] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(true);

    // PAGINACIÓN: 6 por página
    const [paginaActual, setPaginaActual] = useState(1);

    // MODAL CREAR
    const [modalCrear, setModalCrear] = useState(false);
    const [plantillas, setPlantillas] = useState([]);
    const [plantillaSel, setPlantillaSel] = useState("");
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSel, setEmpleadoSel] = useState("");

    // MODAL DETALLE
    const [modalDetalle, setModalDetalle] = useState(false);
    const [evaluacionActual, setEvaluacionActual] = useState(null);
    const [detalleEditable, setDetalleEditable] = useState([]);
    const [retroLocal, setRetroLocal] = useState("");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // ESTADOS DE CARGA GLOBALES
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Cargando...");

    // MODALES AUXILIARES
    const [modalInfo, setModalInfo] = useState({ open: false, title: "", message: "", type: "success" });
    const [modalConfirmCerrar, setModalConfirmCerrar] = useState(false);

    const showInfo = (title, message, type = "success") => {
        setModalInfo({ open: true, title, message, type });
    };

    // CARGAR EVALUACIONES
    const cargarEvaluaciones = async () => {
        setCargandoLista(true);
        try {
            const filtros = { area_id: areaId || undefined, estatus: estatus || undefined };
            const data = await getEvaluaciones(filtros);
            setEvaluaciones(Array.isArray(data) ? data : []);
            setPaginaActual(1); // Reiniciar a la primera página al filtrar/cargar
        } catch (err) {
            showInfo("Error", "No se pudieron cargar las evaluaciones.", "error");
        } finally {
            setCargandoLista(false);
        }
    };

    useEffect(() => {
        cargarEvaluaciones();
    }, [areaId, estatus]);

    // CREAR EVALUACIÓN
    const abrirModalCrear = async () => {
        setLoading(true);
        setLoadingMessage("Cargando plantillas...");
        try {
            const data = await getPlantillasVigentes(areaId || undefined);
            setPlantillas(Array.isArray(data) ? data : []);
            setPlantillaSel("");
            setEmpleadoSel("");
            setEmpleados([]);
            setModalCrear(true);
        } catch (err) {
            showInfo("Error", "No se pudieron cargar las plantillas.", "error");
        } finally {
            setLoading(false);
        }
    };

    const seleccionarPlantilla = async (id) => {
        setPlantillaSel(id);
        setEmpleadoSel("");
        setEmpleados([]);
        if (!id) return;
        setLoading(true);
        setLoadingMessage("Cargando empleados disponibles...");
        try {
            const lista = await getEmpleadosDisponibles(id);
            setEmpleados(Array.isArray(lista) ? lista : []);
        } catch (err) {
            showInfo("Error", "No se pudieron cargar empleados.", "error");
        } finally {
            setLoading(false);
        }
    };

    const crearEvaluacionHandler = async () => {
        if (!plantillaSel || !empleadoSel) {
            showInfo("Faltan datos", "Selecciona plantilla y empleado.", "warning");
            return;
        }
        setLoading(true);
        setLoadingMessage("Creando evaluación...");
        try {
            await crearEvaluacion({
                plantilla_id: Number(plantillaSel),
                empleado_id: Number(empleadoSel),
            });
            setModalCrear(false);
            showInfo("Éxito", "Evaluación iniciada correctamente.", "success");
            cargarEvaluaciones();
        } catch (err) {
            showInfo("Error", "No se pudo crear la evaluación.", "error");
        } finally {
            setLoading(false);
        }
    };

    // DETALLE Y EDICIÓN
    const abrirDetalle = async (id, editable) => {
        setLoading(true);
        setLoadingMessage("Cargando evaluación...");

        try {
            const data = await getEvaluacionById(id);

            setEvaluacionActual(data);
            setRetroLocal(data.retroalimentacion || "");
            setModoEdicion(editable && data.estatus === "en_proceso");

            const detalle = Array.isArray(data.detalle) ? data.detalle : [];

            const conKeys = detalle.map((item, i) => ({
                ...item,
                calificacion: item.calificacion ?? "",
                _key: i,
            }));

            setDetalleEditable(conKeys);
            setModalDetalle(true);
        } catch (err) {
            showInfo("Error", "No se pudo cargar la evaluación.", "error");
        } finally {
            setLoading(false);
        }
    };

    const actualizarCampo = (key, campo, valor) => {
        if (campo === "calificacion") {
            valor = valor.replace(/[^0-9.]/g, "");

            const partes = valor.split(".");
            if (partes.length > 2) {
                valor = partes[0] + "." + partes[1];
            }

            valor = valor.replace(/^0+(?=\d)/, "");

            let num = valor === "" ? "" : Number(valor);

            if (num !== "") {
                if (num > 10) num = 10;
                if (num < 0) num = 0;

                valor = num.toString();
            }
        }

        setDetalleEditable(prev =>
            prev.map(item =>
                item._key === key ? { ...item, [campo]: valor } : item
            )
        );
    };

    const calcularResultado = () => {
        let totalPonderado = 0;
        let totalPonderacion = 0;

        detalleEditable.forEach(item => {
            if (item.calificacion && item.ponderacion) {
                totalPonderado += item.calificacion * (item.ponderacion / 100);
                totalPonderacion += parseFloat(item.ponderacion);
            }
        });

        if (totalPonderacion === 0) return { puntaje: 0, nivel: "-" };
        const promedio = totalPonderado;
        let nivel = "Insuficiente";
        if (promedio >= 9) nivel = "Excelente";
        else if (promedio >= 8) nivel = "Bueno";
        else if (promedio >= 7) nivel = "Aceptable";
        else if (promedio >= 6) nivel = "Regular";

        return { puntaje: promedio.toFixed(1), nivel };
    };

    const { puntaje, nivel } = calcularResultado();

    const enviarActualizacion = async (estatusFinal) => {
        setErrorMsg("");
        setLoading(true);
        setLoadingMessage(estatusFinal === "cerrada" ? "Cerrando evaluación..." : "Guardando cambios...");

        try {
            const payload = {
                detalle: detalleEditable.map(item => ({
                    indicador_id: Number(item.indicador_id ?? item.indicadorId ?? item.id),
                    calificacion: item.calificacion ? Number(item.calificacion) : null,
                    comentario: item.comentario?.trim() || null,
                })),
                retroalimentacion: retroLocal.trim() || null,
                estatus: estatusFinal.toLowerCase(),
            };


            // Solo visible en desarrollo local
            if (import.meta.env?.DEV || process.env.NODE_ENV === "development") {
                console.log("Payload enviado:", JSON.stringify(payload, null, 2));
            }

            await actualizarEvaluacion(evaluacionActual.evaluacionId, payload);

            setModalDetalle(false);
            showInfo("Éxito", "Evaluación guardada con comentarios.", "success");
            cargarEvaluaciones();
        } catch (err) {
            console.error("Error:", err);
            showInfo("Error", "No se pudo guardar. ¿El backend acepta 'comentario'?", "error");
        } finally {
            setLoading(false);
        }
    };

    const guardarEvaluacion = async (cerrar = false) => {
        if (!evaluacionActual) return;

        if (cerrar) {
            const sinCalificar = detalleEditable.some(d => !d.calificacion || d.calificacion < 1);
            const sinRetro = !retroLocal.trim();
            if (sinCalificar || sinRetro) {
                setErrorMsg(sinCalificar
                    ? "Todos los indicadores deben tener calificación (1-10)."
                    : "La retroalimentación general es obligatoria."
                );
                return;
            }
            setModalConfirmCerrar(true);
            return;
        }
        await enviarActualizacion("en_proceso");
    };

    const evaluacionesFiltradas = evaluaciones.filter(ev =>
        ev.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // === PAGINACIÓN ===
    const itemsPorPagina = 6;
    const totalPaginas = Math.ceil(evaluacionesFiltradas.length / itemsPorPagina);
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const evaluacionesPaginadas = evaluacionesFiltradas.slice(inicio, inicio + itemsPorPagina);

    return (
        <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sistema de Evaluaciones</h1>
                <button
                    onClick={abrirModalCrear}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    + Nueva evaluación
                </button>
            </div>

            {/* FILTROS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar empleado..."
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1); // Reiniciar página al buscar
                    }}
                />
                <select className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                    <option value="">Todas las áreas</option>
                    <option value="1">Recursos Humanos</option>
                    <option value="2">Ventas</option>
                    <option value="3">TI</option>
                </select>
                <select className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={estatus} onChange={(e) => setEstatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="cerrada">Cerrada</option>
                </select>
            </div>

            {/* TABLA RESPONSIVE + SKELETON */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Empleado</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Área</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Plantilla</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Puntaje</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {cargandoLista ? (
                            Array(6).fill().map((_, i) => <SkeletonRow key={i} />)
                        ) : evaluacionesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-16 text-gray-500">
                                    <span className="text-6xl block mb-4">No hay evaluaciones</span>
                                </td>
                            </tr>
                        ) : (
                            evaluacionesPaginadas.map((ev) => (
                                <tr key={ev.evaluacionId} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium">{ev.nombreEmpleado}</td>
                                    <td className="px-6 py-4">{ev.nombreArea}</td>
                                    <td className="px-6 py-4">{ev.nombrePlantilla}</td>
                                    <td className="px-6 py-4 text-center">{ev.puntajeTotal ?? "-"}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-4 py-2 rounded-full text-xs font-medium ${ev.estatus === "cerrada" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {ev.estatus === "cerrada" ? "Cerrada" : "En proceso"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-5 h-full min-h-[4rem]">
                                            <button
                                                onClick={() => abrirDetalle(ev.evaluacionId, false)}
                                                title="Ver detalle"
                                                className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            {ev.estatus === "en_proceso" && (
                                                <button
                                                    onClick={() => abrirDetalle(ev.evaluacionId, true)}
                                                    title="Editar evaluación"
                                                    className="text-amber-600 hover:text-amber-800 transition-transform hover:scale-110"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINADO EXACTO COMO TU IMAGEN */}
            {evaluacionesFiltradas.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    <div className="mb-3 sm:mb-0">
                        Mostrando <strong>{evaluacionesPaginadas.length}</strong> de <strong>{evaluacionesFiltradas.length}</strong> evaluaciones
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Anterior
                        </button>

                        <span className="font-medium">
                            Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
                        </span>

                        <button
                            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* MODALES (100% IGUALES A TU CÓDIGO ORIGINAL) */}
            {modalCrear && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Nueva Evaluación</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block font-semibold mb-2">Plantilla</label>
                                <select className="w-full px-4 py-3 border rounded-lg" value={plantillaSel} onChange={(e) => seleccionarPlantilla(e.target.value)}>
                                    <option value="">Seleccione plantilla</option>
                                    {plantillas.map(p => <option key={p.plantilla_id} value={p.plantilla_id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Empleado</label>
                                <select className="w-full px-4 py-3 border rounded-lg" value={empleadoSel} onChange={(e) => setEmpleadoSel(e.target.value)} disabled={!plantillaSel}>
                                    <option value="">Seleccione empleado</option>
                                    {empleados.map(e => <option key={e.empleadoId} value={e.empleadoId}>{e.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setModalCrear(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button onClick={crearEvaluacionHandler} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Iniciar evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE */}
            {modalDetalle && evaluacionActual && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        {/* Header fijo */}
                        <div className="p-6 sticky top-0 bg-white border-b z-10 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Detalle de Evaluación</h2>
                                <button
                                    onClick={() => setModalDetalle(false)}
                                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                                    title="Cerrar"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Contenido con scroll */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div><span className="text-gray-500">Empleado:</span> <strong>{evaluacionActual.empleado}</strong></div>
                                <div><span className="text-gray-500">Área:</span> <strong>{evaluacionActual.nombreArea}</strong></div>
                                <div><span className="text-gray-500">Plantilla:</span> <strong>{evaluacionActual.plantilla}</strong></div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full text-sm min-w-[800px]">
                                    {/* ... tu tabla igual ... */}
                                    {detalleEditable.map(row => (
                                        <tr key={row._key}>
                                            <td className="px-4 py-3">{row.indicador}</td>
                                            <td className="px-4 py-3 text-center">{row.ponderacion}%</td>
                                            <td className="px-4 py-3 text-center">
                                                {modoEdicion ? (
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        className="w-20 px-2 py-1 border rounded text-center"
                                                        value={row.calificacion}
                                                        onChange={(e) => actualizarCampo(row._key, "calificacion", e.target.value)}
                                                    />
                                                ) : row.calificacion || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </table>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center font-bold text-xl">
                                Puntaje Final: <span className="text-blue-700">{puntaje}</span> → Nivel: <span className="text-blue-700">{nivel}</span>
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Retroalimentación general:</label>
                                {modoEdicion ? (
                                    <textarea className="w-full px-4 py-3 border rounded-lg min-h-32" value={retroLocal} onChange={e => setRetroLocal(e.target.value)} placeholder="Observaciones generales..." />
                                ) : (
                                    <div className="bg-gray-50 border rounded-lg px-4 py-3 min-h-32 whitespace-pre-line">{retroLocal || "Sin retroalimentación."}</div>
                                )}
                            </div>

                            {errorMsg && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">{errorMsg}</div>}
                        </div>

                        {/* Footer fijo con botones siempre visibles */}
                        <div className="p-6 border-t bg-white rounded-b-2xl sticky bottom-0 z-10">
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setModalDetalle(false)}
                                    className="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow hover:shadow-md"
                                >
                                    Cerrar
                                </button>
                                {modoEdicion && (
                                    <>
                                        <button onClick={() => guardarEvaluacion(false)} disabled={loading} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50">
                                            Guardar borrador
                                        </button>
                                        <button onClick={() => guardarEvaluacion(true)} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                            Finalizar evaluación
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMACIÓN */}
            {modalConfirmCerrar && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
                        <h3 className="text-2xl font-bold text-red-700 mb-4">¿Finalizar evaluación?</h3>
                        <p className="text-gray-700 mb-8">Esta acción es <strong>permanente</strong>. No podrás editarla después.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setModalConfirmCerrar(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button onClick={() => { setModalConfirmCerrar(false); enviarActualizacion("cerrada"); }} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Sí, cerrar permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INFO */}
            {modalInfo.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm text-center">
                        <h3 className={`text-2xl font-bold mb-4 ${modalInfo.type === "error" ? "text-red-700" : "text-green-700"}`}>
                            {modalInfo.title}
                        </h3>
                        <p className="text-gray-700 mb-8">{modalInfo.message}</p>
                        <button onClick={() => setModalInfo({ ...modalInfo, open: false })} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

            {/* CARGANDO GLOBAL */}
            {loading && <LoadingOverlay message={loadingMessage} />}
        </div>
    );
}