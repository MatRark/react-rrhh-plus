// components/PostulationForm.jsx
import { useState, useEffect } from "react";
import { createPostulacion } from "../services/postulacionesService";
import { getVacantes } from "../services/vacantesService";

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
  
  // Estados para vacantes
  const [vacantes, setVacantes] = useState([]);
  const [loadingVacantes, setLoadingVacantes] = useState(true);

  // Cargar vacantes al montar el componente
  useEffect(() => {
    const fetchVacantes = async () => {
      try {
        setLoadingVacantes(true);
        const data = await getVacantes();
        
        // Asegurarse de que sea un array
        const vacantesArray = Array.isArray(data) ? data : (data.data || data.items || []);
        
        // Filtrar solo vacantes abiertas
        const vacantesAbiertas = vacantesArray.filter(v => v.estatus === "abierta");
        setVacantes(vacantesAbiertas);
      } catch (error) {
        console.error("Error al cargar vacantes:", error);
        setMessage(`Error al cargar vacantes: ${error.message}`);
        setVacantes([]); // Asegurar que sea un array vacío en caso de error
      } finally {
        setLoadingVacantes(false);
      }
    };

    fetchVacantes();
  }, []);

  // Función para validar y formatear teléfono
  const formatPhoneInput = (value) => {
    // Permitir solo números, espacios, +, -, (, )
    const cleaned = value.replace(/[^\d\s+\-()]/g, '');
    return cleaned;
  };

  // Validaciones MEJORADAS - TODOS LOS CAMPOS OBLIGATORIOS
  const validateForm = () => {
    const newErrors = {};

    // Validación de vacante
    if (!formData.vacanteId) newErrors.vacanteId = "Selecciona una vacante";
    
    // Validación de nombre
    if (!formData.nombreContacto.trim()) {
      newErrors.nombreContacto = "El nombre completo es obligatorio";
    } else if (formData.nombreContacto.trim().length < 2) {
      newErrors.nombreContacto = "El nombre debe tener al menos 2 caracteres";
    }
    
    // Validación de email (OBLIGATORIO)
    if (!formData.emailContacto.trim()) {
      newErrors.emailContacto = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContacto)) {
      newErrors.emailContacto = "Formato de email inválido (ejemplo: usuario@correo.com)";
    }

    // Validación de teléfono (OBLIGATORIO)
    if (!formData.telefonoContacto.trim()) {
      newErrors.telefonoContacto = "El teléfono es obligatorio";
    } else {
      // Limpiar espacios para validar solo los dígitos
      const digitsOnly = formData.telefonoContacto.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        newErrors.telefonoContacto = "El teléfono debe tener al menos 10 dígitos";
      }
    }

    // Validación de CV (OBLIGATORIO)
    if (!formData.cvFile) {
      newErrors.cvFile = "El currículum vitae (PDF) es obligatorio";
    }

    // Validación de observaciones (OBLIGATORIO) - SOLO QUE NO ESTÉ VACÍO
    if (!formData.observacion.trim()) {
      newErrors.observacion = "Las observaciones son obligatorias";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Aplicar formato especial para teléfono
    if (name === 'telefonoContacto') {
      processedValue = formatPhoneInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
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
      // Llamada real al API
      await createPostulacion(formData);
      
      setMessage("¡Postulación creada exitosamente!");
      
      setTimeout(() => {
        if (onPostulationCreated) onPostulationCreated();
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
        className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl animate-slide-in overflow-hidden"
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
        <form onSubmit={handleSubmit} className="h-[calc(100%-5rem)] flex flex-col">
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
                disabled={loadingVacantes}
              >
                <option value="">
                  {loadingVacantes ? "Cargando vacantes..." : "Selecciona una vacante"}
                </option>
                {vacantes.map(vac => (
                  <option key={vac.vacanteId} value={vac.vacanteId}>
                    {vac.titulo} - {vac.nombreArea}
                  </option>
                ))}
              </FormField>
              {vacantes.length === 0 && !loadingVacantes && (
                <p className="mt-2 text-xs text-amber-600">
                  No hay vacantes abiertas disponibles
                </p>
              )}
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
                  required
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
                  required
                  icon="call"
                  name="telefonoContacto"
                  value={formData.telefonoContacto}
                  onChange={handleChange}
                  placeholder="Ej. 771 123 4567 o +52 771 123 4567"
                  error={errors.telefonoContacto}
                />
              </div>
            </section>

            {/* Sección: Currículum */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Currículum Vitae</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CV (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                    required
                  />
                  <label
                    htmlFor="cv-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                      errors.cvFile 
                        ? "border-red-300 bg-red-50" 
                        : formData.cvFile 
                        ? "border-green-300 bg-green-50" 
                        : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span className={`material-symbols-outlined ${
                      errors.cvFile ? "text-red-400" : formData.cvFile ? "text-green-500" : "text-slate-400"
                    }`}>
                      {formData.cvFile ? "check_circle" : "upload_file"}
                    </span>
                    <span className={`text-sm ${
                      errors.cvFile ? "text-red-600" : formData.cvFile ? "text-green-700" : "text-slate-600"
                    }`}>
                      {formData.cvFile 
                        ? formData.cvFile.name 
                        : "Haz clic para adjuntar CV (PDF) - Obligatorio"
                      }
                    </span>
                  </label>
                </div>
                {errors.cvFile && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.cvFile}
                  </p>
                )}
                {formData.cvFile && !errors.cvFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Archivo PDF cargado correctamente</span>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  • Formato aceptado: PDF<br/>
                  • Tamaño máximo: 5MB<br/>
                </p>
              </div>
            </section>

            {/* Sección: Observaciones */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Observaciones</h3>
              <FormField
                as="textarea"
                label="Observaciones"
                required
                icon="notes"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                rows="4"
                placeholder="Describe su experiencia, habilidades o motivos para la postulación..."
                className="resize-none"
                error={errors.observacion}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-500">
                  Campo obligatorio
                </p>
                <p className="text-xs text-slate-400">
                  {formData.observacion.length} caracteres
                </p>
              </div>
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
              disabled={submitting || vacantes.length === 0}
              className={`px-4 py-2 rounded-lg text-white inline-flex items-center gap-2 transition-colors ${
                submitting || vacantes.length === 0 ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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