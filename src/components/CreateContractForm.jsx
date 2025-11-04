import { useState, useEffect } from "react";
import { getAvailableEmployees, getContractTypes, createContract } from "../services/contractService";

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

export default function CreateContractForm({ onClose, onContractCreated }) {
  const [formData, setFormData] = useState({
    empleadoId: "",
    tipoContratoId: "",
    fechaInicio: "",
    fechaFin: "",
    salarioBase: "",
    observaciones: ""
  });
  
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [employeesData, typesData] = await Promise.all([
        getAvailableEmployees(),
        getContractTypes()
      ]);
      
      setAvailableEmployees(employeesData);
      setContractTypes(typesData);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.empleadoId) newErrors.empleadoId = "Selecciona un empleado";
    if (!formData.tipoContratoId) newErrors.tipoContratoId = "Selecciona un tipo de contrato";
    if (!formData.fechaInicio) newErrors.fechaInicio = "La fecha de inicio es requerida";
    if (!formData.fechaFin) newErrors.fechaFin = "La fecha de fin es requerida";
    
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (fin <= inicio) {
        newErrors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }

    if (!formData.salarioBase || formData.salarioBase <= 0) {
      newErrors.salarioBase = "El salario debe ser un valor positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage("");

    try {
      const contractData = {
        ...formData,
        empleadoId: parseInt(formData.empleadoId),
        tipoContratoId: parseInt(formData.tipoContratoId),
        salarioBase: parseFloat(formData.salarioBase)
      };

      const result = await createContract(contractData);
      
      setMessage("¡Contrato creado exitosamente!");
      
      // Notificar al componente padre y cerrar después de un momento
      setTimeout(() => {
        if (onContractCreated) onContractCreated(result);
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-blue-600 animate-spin">refresh</span>
            <p className="mt-4 text-slate-600">Cargando datos...</p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop/Overlay */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
      
      {/* Side Sheet */}
      <aside 
        className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">description</span>
            <div>
              <h2 className="text-lg font-semibold">Nuevo Contrato</h2>
              <p className="text-white/80 text-sm">Completa la información del contrato</p>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="h-[calc(100%-7rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {message && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${
                message.includes("Error") 
                  ? "bg-red-50 border-red-200 text-red-700" 
                  : "bg-green-50 border-green-200 text-green-700"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    {message.includes("Error") ? "error" : "check_circle"}
                  </span>
                  {message}
                </div>
              </div>
            )}

            {/* Sección: Información del Contrato */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Información del Contrato</h3>
              <div className="space-y-4">
                {/* Empleado */}
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
                  {availableEmployees.map(emp => (
                    <option key={emp.empleadoId} value={emp.empleadoId}>
                      {emp.nombreEmpleado} - {emp.puesto} ({emp.area})
                    </option>
                  ))}
                </FormField>

                {/* Tipo de Contrato */}
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
                  {contractTypes.map(type => (
                    <option key={type.tipoContratoId} value={type.tipoContratoId}>
                      {type.nombreContrato}
                    </option>
                  ))}
                </FormField>
              </div>
            </section>

            {/* Sección: Fechas */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Periodo del Contrato</h3>
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
                  required
                  icon="event"
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  error={errors.fechaFin}
                />
              </div>
            </section>

            {/* Sección: Salario */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Compensación</h3>
              <FormField
                label="Salario Base"
                required
                icon="payments"
                type="number"
                step="0.01"
                min="0"
                name="salarioBase"
                value={formData.salarioBase}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.salarioBase}
              />
            </section>

            {/* Sección: Observaciones */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Observaciones</h3>
              <FormField
                as="textarea"
                label="Observaciones"
                icon="notes"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="4"
                placeholder="Observaciones adicionales sobre el contrato..."
                className="resize-none"
              />
            </section>
          </div>

          {/* Footer con botones */}
          <div className="sticky bottom-0 border-t bg-white p-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white inline-flex items-center gap-2 transition-colors ${
                submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {submitting ? "hourglass_top" : "save"}
              </span>
              {submitting ? "Creando..." : "Crear Contrato"}
            </button>
          </div>
        </form>
      </aside>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}