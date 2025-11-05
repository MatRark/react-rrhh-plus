import { useState, useEffect } from "react";
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

  const base = `w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
    error ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
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
 * - onClose: () => void
 * - onSuccess: (result) => void
 * - onContractCreated?: (result) => void
 */
export default function CreateContractForm({
  mode = "create",
  contractId,
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [employees, types] = await Promise.all([
          getAvailableEmployees(),
          getContractTypes(),
        ]);
        setAvailableEmployees(employees);
        setContractTypes(types);

        if ((mode === "edit" || mode === "renew") && contractId) {
          const c = await getContractById(contractId);
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
        }
      } catch (e) {
        setMessage(`Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, contractId]);

  // ✅ Solo "Determinado" requiere fecha fin
  const requiresEndDate = () => {
    const sel = contractTypes.find(
      (t) => t.tipoContratoId === parseInt(formData.tipoContratoId)
    );
    if (!sel) return false;
    const name = sel.nombreContrato.toLowerCase().trim();
    return name === "determinado";
  };

  const validateForm = () => {
    const errs = {};
    if (mode === "create" && !formData.empleadoId)
      errs.empleadoId = "Selecciona un empleado";
    if (!formData.tipoContratoId)
      errs.tipoContratoId = "Selecciona un tipo de contrato";
    if (!formData.fechaInicio)
      errs.fechaInicio = "La fecha de inicio es requerida";

    if (requiresEndDate() && !formData.fechaFin)
      errs.fechaFin = "La fecha de fin es requerida para contratos determinados";

    if (formData.fechaInicio && formData.fechaFin) {
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
    if (!renewData.nuevaFechaFin)
      errs.nuevaFechaFin = "La nueva fecha de fin es requerida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      if (mode === "renew") {
        if (!validateRenew()) return;
        const payload = {
          fechaRenovacion: renewData.fechaRenovacion,
          nuevaFechaFin: renewData.nuevaFechaFin,
          comentario: renewData.comentario || "",
        };
        const res = await renewContract(contractId, payload);
        setMessage("¡Contrato renovado exitosamente!");
        setTimeout(() => {
          onSuccess && onSuccess(res);
          onClose && onClose();
        }, 1000);
        return;
      }

      if (!validateForm()) return;

      const data = {
        tipoContratoId: parseInt(formData.tipoContratoId),
        fechaInicio: formData.fechaInicio,
        salarioBase: parseFloat(formData.salarioBase),
        observaciones: formData.observaciones || "",
      };
      if (formData.fechaFin) data.fechaFin = formData.fechaFin;
      if (mode === "create")
        data.empleadoId = parseInt(formData.empleadoId);

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
        if (onContractCreated) onContractCreated(res);
        onClose && onClose();
      }, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = contractTypes.find(
    (t) => t.tipoContratoId === parseInt(formData.tipoContratoId)
  );
  const endDateRequired = requiresEndDate();

  const title =
    mode === "create"
      ? "Nuevo Contrato"
      : mode === "edit"
      ? "Editar Contrato"
      : "Renovar Contrato";
  const subtitle =
    mode === "create"
      ? "Completa la información del contrato"
      : mode === "edit"
      ? "Actualiza los datos del contrato"
      : "Registra una renovación para este contrato";

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
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Mensaje */}
        {message && (
          <div
            className={`mx-5 my-4 rounded-lg border px-4 py-3 text-sm ${
              message.includes("Error")
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

              {/* Tipo de contrato */}
              <FormField
                as="select"
                label="Tipo de Contrato"
                required
                icon="assignment"
                name="tipoContratoId"
                value={formData.tipoContratoId}
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

              {/* Aviso azul */}
              {selectedType && !endDateRequired && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[20px]">info</span>
                    <p>
                      Para contratos de tipo{" "}
                      <strong>{selectedType.nombreContrato}</strong>, la fecha
                      de fin es opcional. Puedes dejarla vacía si el contrato no
                      tiene una fecha de término definida.
                    </p>
                  </div>
                </div>
              )}

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
                <FormField
                  label="Fecha de Fin"
                  required={endDateRequired}
                  icon="event"
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  error={errors.fechaFin}
                />
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
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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
