import { useState, useEffect, useMemo } from "react";
import {
  getAvailableEmployees,
  getContractTypes,
  createContract,
  updateContract,
  getContractById,
  renewContract,
} from "../services/contractService";

// Campo de formulario reutilizable
function FormField({ label, required, error, icon, children, className = "", ...props }) {
  const isSelect = props.as === "select";
  const isTextarea = props.as === "textarea";
  const FieldTag = isSelect ? "select" : isTextarea ? "textarea" : "input";

  const base = `w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 ${error ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
    }`;

  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            {icon}
          </span>
        )}
        <FieldTag className={`${base} ${className}`} {...props}>
          {children}
        </FieldTag>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

/**
 * Props:
 * - mode: "create" | "edit" | "renew"
 * - contractId?: number
 * - contractType?: string  // opcional; el form ahora resuelve el tipo desde contractId
 * - onClose: () => void
 * - onSuccess: (result) => void
 * - onContractCreated?: (result) => void
 */
export default function CreateContractForm({
  mode = "create",
  contractId,
  contractType, // opcional; fallback
  onClose,
  onSuccess,
  onContractCreated,
}) {
  const [formData, setFormData] = useState({
    empleadoId: "",
    tipoContratoId: "",
    fechaInicio: "",
    fechaFin: "",
    salarioBase: "",
    observaciones: "",
  });

  const [renewData, setRenewData] = useState({
    fechaRenovacion: new Date().toISOString().substring(0, 10),
    nuevaFechaFin: "",
    comentario: "",
  });

  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);

  const [resolvedTypeName, setResolvedTypeName] = useState(""); // <- tipo detectado por contractId
  const [resolvedTypeId, setResolvedTypeId] = useState(null);    // <- id detectado por contractId

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // ------------------------------------------------------------
  // Carga inicial (empleados, tipos, y contrato si edit/renew)
  // ------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // En crear, sí necesitas empleados y tipos; en editar/renovar también para mapa id->nombre
        const [employees, types] = await Promise.all([
          getAvailableEmployees().catch(() => []),
          getContractTypes().catch(() => []),
        ]);
        setAvailableEmployees(employees || []);
        setContractTypes(types || []);

        if ((mode === "edit" || mode === "renew") && contractId) {
          const c = await getContractById(contractId);

          // Rellenar cuando se edita
          if (mode === "edit") {
            setFormData({
              empleadoId: c.empleadoId ?? "",
              tipoContratoId: c.tipoContratoId ?? "",
              fechaInicio: c.fechaInicio?.substring(0, 10) ?? "",
              fechaFin: c.fechaFin?.substring(0, 10) ?? "",
              salarioBase: c.salarioBase ?? "",
              observaciones: c.observaciones ?? "",
            });
          }

          // Resolver tipo (nombre + id) para usarlo en TODA la lógica
          // Intenta obtenerlo del propio contrato; si no, usa el prop como fallback
          const detectedName =
            (c.tipoContratoNombre || c.tipoContrato || "").toString().trim() ||
            (contractType || "");
          const detectedId = c.tipoContratoId ?? null;

          setResolvedTypeName(detectedName);
          setResolvedTypeId(detectedId);

          // Si venimos a renovar y el backend no da tipoContratoId,
          // intenta inferirlo contra el catálogo de tipos por nombre:
          if (!detectedId && types?.length && detectedName) {
            const match = types.find(
              (t) => t.nombreContrato?.toLowerCase().trim() === detectedName.toLowerCase().trim()
            );
            if (match) {
              setResolvedTypeId(match.tipoContratoId);
            }
          }
        } else {
          // En crear, todavía no hay tipo resuelto
          setResolvedTypeName("");
          setResolvedTypeId(null);
        }
      } catch (e) {
        setMessage(`Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, contractId]);

  // ------------------------------------------------------------
  // Helpers de tipo y reglas de negocio
  // ------------------------------------------------------------
  // Tipo elegido por el usuario (en crear/editar) o resuelto por contrato
  const currentTypeId = useMemo(() => {
    // prioriza lo seleccionado en el form; si no hay, usa lo detectado
    const idFromForm = parseInt(formData.tipoContratoId);
    return Number.isFinite(idFromForm) && idFromForm > 0 ? idFromForm : resolvedTypeId;
  }, [formData.tipoContratoId, resolvedTypeId]);

  const currentTypeName = useMemo(() => {
    // si hay selección en el form, tradúcela a nombre; si no, usa resolvedTypeName
    if (currentTypeId && contractTypes?.length) {
      const t = contractTypes.find((x) => x.tipoContratoId === currentTypeId);
      if (t?.nombreContrato) return t.nombreContrato;
    }
    return resolvedTypeName || contractType || ""; // último fallback
  }, [currentTypeId, contractTypes, resolvedTypeName, contractType]);

  const isDeterminado = useMemo(
    () => currentTypeName?.toLowerCase().trim() === "determinado",
    [currentTypeName]
  );
  const isIndeterminado = useMemo(
    () => currentTypeName?.toLowerCase().trim() === "indeterminado",
    [currentTypeName]
  );
  const isHonorarios = useMemo(
    () => currentTypeName?.toLowerCase().trim() === "honorarios",
    [currentTypeName]
  );

  const requiresEndDate = () => isDeterminado;
  const isIndefinidoOrHonorarios = () => isIndeterminado || isHonorarios;

  // ------------------------------------------------------------
  // Validaciones
  // ------------------------------------------------------------
  const validateForm = () => {
    const errs = {};
    if (mode === "create" && !formData.empleadoId)
      errs.empleadoId = "Selecciona un empleado";
    if (!currentTypeId)
      errs.tipoContratoId = "Selecciona un tipo de contrato";
    if (!formData.fechaInicio)
      errs.fechaInicio = "La fecha de inicio es requerida";

    if (requiresEndDate() && !formData.fechaFin)
      errs.fechaFin = "La fecha de fin es requerida para contratos determinados";

    if (formData.fechaInicio && formData.fechaFin && requiresEndDate()) {
      const i = new Date(formData.fechaInicio);
      const f = new Date(formData.fechaFin);
      if (f <= i)
        errs.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    if (!formData.salarioBase || Number(formData.salarioBase) <= 0)
      errs.salarioBase = "El salario debe ser un valor positivo";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRenew = () => {
    const errs = {};
    if (!renewData.fechaRenovacion)
      errs.fechaRenovacion = "La fecha de renovación es requerida";

    if (isDeterminado && !renewData.nuevaFechaFin)
      errs.nuevaFechaFin = "La nueva fecha de fin es requerida para contratos determinados";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleRenewChange = (e) => {
    const { name, value } = e.target;
    setRenewData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ------------------------------------------------------------
  // Envío
  // ------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      // ---------- RENOVAR ----------
      if (mode === "renew") {
        if (!validateRenew()) return;

        // Para Determinado: el backend debe actualizar inicio=fechaRenovacion y fin=nuevaFechaFin (según tus reglas)
        // Para Indeterminado/Honorarios: solo registrar la renovación (sin fecha fin)
        const payload = {
          fechaRenovacion: renewData.fechaRenovacion,
          nuevaFechaFin: isDeterminado
            ? renewData.nuevaFechaFin
            : renewData.fechaRenovacion, // 🔹 clave para renovar honorarios / indeterminados
          comentario: renewData.comentario || "",
        };


        const res = await renewContract(contractId, payload);
        setMessage("¡Contrato renovado exitosamente!");
        setTimeout(() => {
          onSuccess && onSuccess(res);
          onClose && onClose();
        }, 800);
        return;
      }

      // ---------- CREAR / EDITAR ----------
      if (!validateForm()) return;

      const data = {
        tipoContratoId: currentTypeId,                          // <- siempre el ID vigente
        fechaInicio: formData.fechaInicio,
        salarioBase: parseFloat(formData.salarioBase),
        observaciones: formData.observaciones || "",
      };

      // Solo enviar fechaFin si es Determinado
      if (requiresEndDate() && formData.fechaFin) {
        data.fechaFin = formData.fechaFin;
      }

      // Limpiar fecha fin para indeterminado/honorarios (evita "1/1/1")
      if (isIndefinidoOrHonorarios()) {
        data.fechaFin = null;
      }

      if (mode === "create") data.empleadoId = parseInt(formData.empleadoId);

      const res =
        mode === "create"
          ? await createContract(data)
          : await updateContract(contractId, data);

      setMessage(
        mode === "create"
          ? "¡Contrato creado exitosamente!"
          : "¡Contrato actualizado exitosamente!"
      );

      setTimeout(() => {
        onSuccess && onSuccess(res);
        onContractCreated && onContractCreated(res);
        onClose && onClose();
      }, 1000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // UI helpers
  // ------------------------------------------------------------
  const title =
    mode === "create" ? "Nuevo Contrato" :
      mode === "edit" ? "Editar Contrato" :
        "Renovar Contrato";

  const subtitle =
    mode === "create" ? "Completa la información del contrato" :
      mode === "edit" ? "Actualiza los datos del contrato" :
        "Registra una renovación para este contrato";

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-blue-600">
            progress_activity
          </span>
          <span>Cargando...</span>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-white/80 text-sm">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Mensaje */}
        {message && (
          <div
            className={`mx-5 my-4 rounded-lg border px-4 py-3 text-sm ${message.includes("Error")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
              }`}
          >
            {message}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto h-[calc(100%-8rem)]">
          {mode !== "renew" ? (
            <>
              {/* Empleado solo en crear */}
              {mode === "create" && (
                <FormField
                  as="select"
                  label="Empleado"
                  required
                  icon="person"
                  name="empleadoId"
                  value={formData.empleadoId}
                  onChange={handleChange}
                  error={errors.empleadoId}
                >
                  <option value="">Selecciona un empleado</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.empleadoId} value={emp.empleadoId}>
                      {emp.nombreEmpleado} - {emp.puesto} ({emp.area})
                    </option>
                  ))}
                </FormField>
              )}

              {/* Tipo de contrato (si estás editando puedes permitir cambiarlo o bloquearlo según negocio) */}
              <FormField
                as="select"
                label="Tipo de Contrato"
                required
                icon="assignment"
                name="tipoContratoId"
                value={formData.tipoContratoId || currentTypeId || ""}
                onChange={handleChange}
                error={errors.tipoContratoId}
              >
                <option value="">Selecciona un tipo de contrato</option>
                {contractTypes.map((t) => (
                  <option key={t.tipoContratoId} value={t.tipoContratoId}>
                    {t.nombreContrato}
                  </option>
                ))}
              </FormField>

              {/* Aviso para contratos sin fecha fin */}
              {isIndefinidoOrHonorarios() && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[20px]">info</span>
                    <p>
                      Este tipo de contrato (<strong>{currentTypeName || "—"}</strong>) no tiene fecha de término.
                      La fecha de fin se omitirá automáticamente.
                    </p>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Fecha de Inicio"
                  required
                  icon="event"
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  error={errors.fechaInicio}
                />

                {/* Solo mostrar fin si aplica */}
                {requiresEndDate() && (
                  <FormField
                    label="Fecha de Fin"
                    required
                    icon="event"
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    error={errors.fechaFin}
                  />
                )}
              </div>

              <FormField
                label="Salario Base"
                required
                icon="payments"
                type="number"
                min="0"
                step="0.01"
                name="salarioBase"
                value={formData.salarioBase}
                onChange={handleChange}
                error={errors.salarioBase}
              />

              <FormField
                as="textarea"
                label="Observaciones"
                icon="notes"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
              />
            </>
          ) : (
            <>
              {/* Renovación */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[20px]">info</span>
                  <p>
                    Tipo de contrato: <strong>{currentTypeName || "—"}</strong>
                  </p>
                </div>
              </div>

              <FormField
                label="Fecha de Renovación"
                required
                icon="event"
                type="date"
                name="fechaRenovacion"
                value={renewData.fechaRenovacion}
                onChange={handleRenewChange}
                error={errors.fechaRenovacion}
              />

              {isDeterminado ? (
                <FormField
                  label="Nueva Fecha de Fin"
                  required
                  icon="event"
                  type="date"
                  name="nuevaFechaFin"
                  value={renewData.nuevaFechaFin}
                  onChange={handleRenewChange}
                  error={errors.nuevaFechaFin}
                />
              ) : (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[20px]">info</span>
                    <p>
                      Este tipo de contrato no tiene fecha de fin.
                      Solo se registrará la renovación con la nueva fecha de renovación.
                    </p>
                  </div>
                </div>
              )}

              <FormField
                as="textarea"
                label="Comentario"
                icon="notes"
                name="comentario"
                value={renewData.comentario}
                onChange={handleRenewChange}
                rows="3"
              />
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <span className="material-symbols-outlined">
                {submitting ? "hourglass_top" : mode === "renew" ? "autorenew" : "save"}
              </span>
              {submitting
                ? mode === "renew"
                  ? "Renovando..."
                  : mode === "edit"
                    ? "Actualizando..."
                    : "Creando..."
                : mode === "renew"
                  ? "Renovar"
                  : mode === "edit"
                    ? "Actualizar"
                    : "Crear Contrato"}
            </button>
          </div>
        </form>
      </aside>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
