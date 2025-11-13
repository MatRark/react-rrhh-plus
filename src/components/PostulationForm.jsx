// components/PostulationForm.jsx
import { useState } from "react";

// Campo de formulario reutilizable - FUERA del componente principal
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

export default function PostulationForm({ onClose, onPostulationCreated }) {
  const [formData, setFormData] = useState({
    vacanteId: "",
    nombreContacto: "",
    emailContacto: "",
    telefonoContacto: "",
    cvFile: null,
    observacion: ""
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Datos estáticos - Vacantes disponibles
  const availableVacancies = [
    { id: 1, titulo: "Desarrollador Full Stack", area: "Tecnología" },
    { id: 2, titulo: "Diseñador UI/UX", area: "Diseño" },
    { id: 3, titulo: "Gerente de Ventas", area: "Ventas" },
    { id: 4, titulo: "Analista de Datos", area: "Análisis" },
  ];

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.vacanteId) newErrors.vacanteId = "Selecciona una vacante";
    if (!formData.nombreContacto.trim()) newErrors.nombreContacto = "El nombre es obligatorio";
    
    // Email es opcional, pero si se proporciona debe ser válido
    if (formData.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContacto)) {
      newErrors.emailContacto = "Formato de email inválido";
    }

    // Teléfono es opcional, pero si se proporciona debe ser válido
    if (formData.telefonoContacto && !/^\+?\d[\d\s-]{6,}$/.test(formData.telefonoContacto)) {
      newErrors.telefonoContacto = "Formato de teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        setErrors(prev => ({ ...prev, cvFile: "Solo se permiten archivos PDF" }));
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cvFile: "El archivo no debe superar los 5MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, cvFile: file }));
      setErrors(prev => ({ ...prev, cvFile: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage("");

    try {
      // Simular envío (aquí irá la llamada al API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage("¡Postulación creada exitosamente!");
      
      setTimeout(() => {
        if (onPostulationCreated) onPostulationCreated(formData);
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
      
      {/* Side Sheet */}
      <aside 
        className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">person_add</span>
            <div>
              <h2 className="text-lg font-semibold">Nueva Postulación</h2>
              <p className="text-white/80 text-sm">Registra una nueva postulación</p>
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

            {/* Sección: Información de la Vacante */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Vacante</h3>
              <FormField
                as="select"
                label="Vacante"
                required
                icon="work"
                name="vacanteId"
                value={formData.vacanteId}
                onChange={handleChange}
                error={errors.vacanteId}
              >
                <option value="">Selecciona una vacante</option>
                {availableVacancies.map(vac => (
                  <option key={vac.id} value={vac.id}>
                    {vac.titulo} - {vac.area}
                  </option>
                ))}
              </FormField>
            </section>

            {/* Sección: Datos del Contacto */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos del Contacto</h3>
              <div className="space-y-4">
                <FormField
                  label="Nombre Completo"
                  required
                  icon="person"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez García"
                  error={errors.nombreContacto}
                />

                <FormField
                  label="Correo Electrónico"
                  icon="mail"
                  type="email"
                  name="emailContacto"
                  value={formData.emailContacto}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  error={errors.emailContacto}
                />

                <FormField
                  label="Teléfono"
                  icon="call"
                  name="telefonoContacto"
                  value={formData.telefonoContacto}
                  onChange={handleChange}
                  placeholder="Ej. 771 123 4567"
                  error={errors.telefonoContacto}
                />
              </div>
            </section>

            {/* Sección: Currículum */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Currículum Vitae</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CV (PDF)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-slate-400">upload_file</span>
                    <span className="text-sm text-slate-600">
                      {formData.cvFile ? formData.cvFile.name : "Haz clic para adjuntar CV (PDF)"}
                    </span>
                  </label>
                </div>
                {errors.cvFile && (
                  <p className="mt-1 text-xs text-red-600">{errors.cvFile}</p>
                )}
                {formData.cvFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Archivo cargado: {formData.cvFile.name}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Sección: Observaciones */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Observaciones</h3>
              <FormField
                as="textarea"
                label="Observaciones"
                icon="notes"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                rows="4"
                placeholder="Notas o comentarios adicionales..."
                className="resize-none"
              />
            </section>
          </div>

          {/* Footer */}
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
              {submitting ? "Creando..." : "Crear Postulación"}
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