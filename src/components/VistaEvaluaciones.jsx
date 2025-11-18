// src/pages/VistaEvaluaciones.jsx
import { useEffect, useState } from "react";
import {
  getPlantillasVigentes,
  getEmpleadosDisponibles,
  getEvaluaciones,
  crearEvaluacion,
  getEvaluacionById,
  actualizarEvaluacion,
} from "../services/evaluacionesService";

export default function VistaEvaluaciones() {
  // ESTADOS PRINCIPALES
  const [areaId, setAreaId] = useState("");
  const [estatus, setEstatus] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // MODALES DE CONFIRMACIÓN E INFO
  const [modalInfo, setModalInfo] = useState({ open: false, title: "", message: "", type: "success" });
  const [modalConfirmCerrar, setModalConfirmCerrar] = useState(false);

  const showInfo = (title, message, type = "success") => {
    setModalInfo({ open: true, title, message, type });
  };

  // CARGAR EVALUACIONES
  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const filtros = { area_id: areaId || undefined, estatus: estatus || undefined };
      const data = await getEvaluaciones(filtros);
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      showInfo("Error", "No se pudieron cargar las evaluaciones.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvaluaciones();
  }, [areaId, estatus]);

  // CREAR EVALUACIÓN
  const abrirModalCrear = async () => {
    try {
      const data = await getPlantillasVigentes(areaId || undefined);
      setPlantillas(Array.isArray(data) ? data : []);
      setPlantillaSel("");
      setEmpleadoSel("");
      setEmpleados([]);
      setModalCrear(true);
    } catch (err) {
      showInfo("Error", "No se pudieron cargar las plantillas.", "error");
    }
  };

  const seleccionarPlantilla = async (id) => {
    setPlantillaSel(id);
    setEmpleadoSel("");
    setEmpleados([]);
    if (!id) return;
    try {
      const lista = await getEmpleadosDisponibles(id);
      setEmpleados(Array.isArray(lista) ? lista : []);
    } catch (err) {
      showInfo("Error", "No se pudieron cargar empleados.", "error");
    }
  };

  const crearEvaluacionHandler = async () => {
    if (!plantillaSel || !empleadoSel) {
      showInfo("Faltan datos", "Selecciona plantilla y empleado.", "warning");
      return;
    }
    try {
      await crearEvaluacion({
        plantilla_id: Number(plantillaSel),
        empleado_id: Number(empleadoSel),
      });
      setModalCrear(false);
      showInfo("Evaluación creada", "La evaluación ha sido iniciada. Ya puedes comenzar a calificar los indicadores.", "success");
      cargarEvaluaciones();
    } catch (err) {
      showInfo("Error", "No se pudo crear la evaluación.", "error");
    }
  };

  // DETALLE Y EDICIÓN
  const abrirDetalle = async (id, editable) => {
    try {
      const data = await getEvaluacionById(id);
      console.log("DETALLE DEL BACKEND:", data.detalle);

      setEvaluacionActual(data);
      setRetroLocal(data.retroalimentacion || "");
      setModoEdicion(editable && data.estatus === "en_proceso");

      const detalle = Array.isArray(data.detalle) ? data.detalle : [];
      const conKeys = detalle.map((item, i) => ({
        ...item,
        calificacion: item.calificacion ?? "",
        comentario: item.comentario || "",
        _key: i,
      }));
      setDetalleEditable(conKeys);
      setErrorMsg("");
      setModalDetalle(true);
    } catch (err) {
      showInfo("Error", "No se pudo cargar la evaluación.", "error");
    }
  };

  const actualizarCampo = (key, campo, valor) => {
    setDetalleEditable((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [campo]: valor } : item))
    );
  };

  // CÁLCULO DE SUMA PONDERADA Y NIVEL
  const calcularResultado = () => {
    let totalPonderado = 0;
    let totalPonderacion = 0;

    detalleEditable.forEach((item) => {
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

  // GUARDAR Y CERRAR
  const guardarEvaluacion = async (cerrar = false) => {
    if (!evaluacionActual) return;

    if (cerrar) {
      const sinCalificar = detalleEditable.some((d) => !d.calificacion || d.calificacion < 1);
      const sinRetro = !retroLocal.trim();

      if (sinCalificar || sinRetro) {
        setErrorMsg(
          sinCalificar
            ? "Todos los indicadores deben tener calificación (1-10) para cerrar."
            : "La retroalimentación general es obligatoria para cerrar la evaluación."
        );
        return;
      }
      setModalConfirmCerrar(true);
      return;
    }

    await enviarActualizacion("en_proceso");
  };

  const confirmarCerrar = async () => {
    setModalConfirmCerrar(false);
    await enviarActualizacion("cerrada");
  };

const enviarActualizacion = async (estatusFinal) => {
  setErrorMsg("");

  try {
    setGuardando(true);

    // =============== ARMAR PAYLOAD ===============
    const payload = {
      detalle: detalleEditable.map((item) => ({
        // 🔥 AQUÍ SE GARANTIZA QUE SIEMPRE SE ENVÍA EL ID
        indicador_id: 
          item.indicador_id ?? 
          item.indicadorId ?? 
          item.id ?? 
          null, // si tu backend no lo manda, al menos sabrás que llega null

        calificacion: item.calificacion ? Number(item.calificacion) : null,
        comentario: item.comentario || null,
      })),

      retroalimentacion: retroLocal || null,
      estatus: estatusFinal.toLowerCase(),
    };

    // =============== DEBUG - VER PAYLOAD EN CONSOLA ===============
    console.log(
      "📤 Payload enviado al backend (PUT /Evaluaciones):",
      JSON.stringify(payload, null, 2)
    );

    // =============== LLAMAR API ===============
    await actualizarEvaluacion(evaluacionActual.evaluacionId, payload);

    // =============== UI ===============
    setModalDetalle(false);

    if (estatusFinal === "cerrada") {
      showInfo(
        "Evaluación cerrada",
        "La evaluación ha sido finalizada permanentemente y ya no se puede modificar.",
        "success"
      );
    } else {
      showInfo("Cambios guardados", "Se guardó el borrador correctamente.", "success");
    }

    cargarEvaluaciones();
  } catch (err) {
    showInfo("Error", "No se pudieron guardar los cambios.", "error");
  } finally {
    setGuardando(false);
  }
};


  const evaluacionesFiltradas = evaluaciones.filter((ev) =>
    ev.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sistema de Evaluaciones</h1>
        <button
          onClick={abrirModalCrear}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          + Nueva evaluación
        </button>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA RESPONSIVE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Empleado</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Área</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Plantilla</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Puntaje</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Cargando...</td></tr>
            ) : evaluacionesFiltradas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No hay evaluaciones</td></tr>
            ) : (
              evaluacionesFiltradas.map((ev) => (
                <tr key={ev.evaluacionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{ev.nombreEmpleado}</td>
                  <td className="px-4 py-3">{ev.nombreArea}</td>
                  <td className="px-4 py-3">{ev.nombrePlantilla}</td>
                  <td className="px-4 py-3">{ev.puntajeTotal ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ev.estatus === "cerrada" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {ev.estatus === "cerrada" ? "Cerrada" : "En proceso"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => abrirDetalle(ev.evaluacionId, false)} title="Ver">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {ev.estatus === "en_proceso" && (
                        <button onClick={() => abrirDetalle(ev.evaluacionId, true)} title="Editar">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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

      {/* MODAL CREAR */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Nueva Evaluación</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Plantilla</label>
                <select className="w-full px-4 py-3 border rounded-lg" value={plantillaSel} onChange={(e) => seleccionarPlantilla(e.target.value)}>
                  <option value="">Seleccione plantilla</option>
                  {plantillas.map((p) => (
                    <option key={p.plantilla_id} value={p.plantilla_id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Empleado</label>
                <select className="w-full px-4 py-3 border rounded-lg" value={empleadoSel} onChange={(e) => setEmpleadoSel(e.target.value)} disabled={!plantillaSel}>
                  <option value="">Seleccione empleado</option>
                  {empleados.map((e) => (
                    <option key={e.empleadoId} value={e.empleadoId}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModalCrear(false)} className="px-5 py-3 border rounded-lg">Cancelar</button>
              <button onClick={crearEvaluacionHandler} className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Iniciar evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE - AHORA CON TODO LO DE TU FOTO */}
      {modalDetalle && evaluacionActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Detalle de Evaluación</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500">Empleado:</span> <strong>{evaluacionActual.empleado}</strong></div>
                <div><span className="text-gray-500">Área:</span> <strong>{evaluacionActual.nombreArea}</strong></div>
                <div><span className="text-gray-500">Plantilla:</span> <strong>{evaluacionActual.plantilla}</strong></div>
              </div>

              <div className="border rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Indicador</th>
                      <th className="px-4 py-3 text-center font-bold">Ponderación (%)</th>
                      <th className="px-4 py-3 text-center font-bold">Calificación</th>
                      <th className="px-4 py-3 text-left font-bold">Comentario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detalleEditable.map((row) => (
                      <tr key={row._key}>
                        <td className="px-4 py-3">{row.indicador}</td>
                        <td className="px-4 py-3 text-center">{row.ponderacion}</td>
                        <td className="px-4 py-3 text-center">
                          {modoEdicion ? (
                            <input
                              type="number"
                              min="1"
                              max="10"
                              step="0.1"
                              className="w-20 px-2 py-1 border rounded text-center"
                              value={row.calificacion}
                              onChange={(e) => actualizarCampo(row._key, "calificacion", e.target.value)}
                            />
                          ) : (
                            row.calificacion || "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {modoEdicion ? (
                            <input
                              type="text"
                              className="w-full px-3 py-1 border rounded text-sm"
                              value={row.comentario}
                              onChange={(e) => actualizarCampo(row._key, "comentario", e.target.value)}
                              placeholder="Comentario opcional..."
                            />
                          ) : (
                            row.comentario || <span className="text-gray-400">Sin comentario</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RESULTADO FINAL */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 font-bold text-lg">
                Suma ponderada: <span className="text-blue-700">{puntaje}</span> (≈ {Math.round(puntaje * 10)}%) → Nivel: <span className="text-blue-700">{nivel}</span>
              </div>

              {/* RETROALIMENTACIÓN */}
              <div className="mb-6">
                <label className="block font-bold mb-2">Retroalimentación general:</label>
                {modoEdicion ? (
                  <textarea
                    className="w-full px-4 py-3 border rounded-lg min-h-32"
                    value={retroLocal}
                    onChange={(e) => setRetroLocal(e.target.value)}
                    placeholder="Escribe aquí tus observaciones generales..."
                  />
                ) : (
                  <div className="bg-gray-50 border rounded-lg px-4 py-3 min-h-32 whitespace-pre-line">
                    {retroLocal || "Sin retroalimentación."}
                  </div>
                )}
              </div>

              {errorMsg && <div className="text-red-600 font-medium mb-4">{errorMsg}</div>}

              <div className="flex justify-end gap-4">
                <button onClick={() => setModalDetalle(false)} className="px-6 py-3 border rounded-lg">
                  Cerrar
                </button>
                {modoEdicion && (
                  <>
                    <button
                      onClick={() => guardarEvaluacion(false)}
                      disabled={guardando}
                      className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      Guardar borrador
                    </button>
                    <button
                      onClick={() => guardarEvaluacion(true)}
                      disabled={guardando}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Finalizar evaluación
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN CERRAR */}
      {modalConfirmCerrar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md">
            <h3 className="text-xl font-bold text-red-700 mb-4">¿Finalizar evaluación?</h3>
            <p className="text-gray-700 mb-6">
              Una vez cerrada la evaluación, <strong>ya no podrás modificarla nunca más</strong>.
              ¿Estás seguro de que deseas continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalConfirmCerrar(false)} className="px-5 py-3 border rounded-lg">
                Cancelar
              </button>
<button
  onClick={confirmarCerrar}
  className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
>
  Sí, cerrar permanentemente
</button>

            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO GENERAL */}
      {modalInfo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm">
            <h3 className={`text-xl font-bold mb-3 ${modalInfo.type === "error" ? "text-red-700" : modalInfo.type === "warning" ? "text-yellow-700" : "text-green-700"}`}>
              {modalInfo.title}
            </h3>
            <p className="text-gray-700 mb-6">{modalInfo.message}</p>
            <button
              onClick={() => setModalInfo({ ...modalInfo, open: false })}
              className="w-full px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}