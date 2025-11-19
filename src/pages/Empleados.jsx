import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

/* =====================================================
   CONFIG / HELPERS (reutilizables y robustos)
===================================================== */
const API = {
  base: "https://rhplus.somee.com/api/Employees",
  detail: (id) => `https://rhplus.somee.com/api/Employees/${id}/detalle`,
  areas: "https://rhplus.somee.com/api/Employees/areas",
  turnos: "https://rhplus.somee.com/api/Employees/turnos",
  puestos: "https://rhplus.somee.com/api/Employees/puestos",
  estatus: "https://rhplus.somee.com/api/Employees/estatus",
};


const getToken = () => localStorage.getItem("token") || "";
const authHeaders = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});

const ACCEPT_JSON = { Accept: "application/json" };
const JSON_HEADERS = { "Content-Type": "application/json", ...ACCEPT_JSON };

async function fetchJSON(url, options = {}) {
  let res;
  try {
    res = await fetch(url, { ...options });
  } catch (e) {
    // “Failed to fetch”, “NetworkError…”, CORS bloqueado, offline, etc.
    const err = new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
    err.cause = e;
    throw err;
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      const err = new Error("AUTH");
      err.status = res.status;
      throw err;
    }
    const txt = await res.text().catch(() => "");
    const err = new Error(txt || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}


function safeString(v, def = "") { return (v ?? def) + ""; }
function isPositiveInt(v) { const n = Number(v); return Number.isInteger(n) && n > 0; }
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim()); }
function isPhone(v) { return /^\+?\d[\d\s-]{6,}$/.test(String(v || "").trim()); }
function isDateISO(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")); }

const PLACEHOLDERS = {
  nombre: "Ej. Juan Pérez",
  email: "ejemplo@correo.com",
  telefono: "Ej. 771 123 4567",
  fecha: "AAAA-MM-DD",
  areaId: "Ej. Tic's",
  puestoId: "Ej. Jefe TI",
  turnoId: "Ej. Noct",
  estatusId: "Ej. Activo",
  password: "Mínimo 8 caracteres",
  rol: "Selecciona un rol",
  domicilio: {
    calle: "Ej. Av. Reforma",
    numero: "123",
    colonia: "Centro",
    ciudad: "Pachuca",
    estado: "Hidalgo",
    codigoPostal: "42000",
  },
  contacto: {
    nombre: "Ej. María Pérez",
    parentesco: "Madre",
    telefono: "Ej. 771 987 6543",
  },
};

// Normaliza una fila proveniente del backend a una estructura estable
function mapRow(it = {}) {
  return {
    id: String(it.id ?? it.empleadoId ?? ""),
    name: safeString(it.nombre),
    email: safeString(it.email ?? it.correo),
    role: safeString(it.puesto ?? it.puestoNombre),
    dept: safeString(it.area ?? it.areaNombre),
    status: safeString(it.estatus ?? it.estatusNombre),
    shift: safeString(it.turno ?? it.turnoNombre),
    areaId: it.areaId ?? null,
    puestoId: it.puestoId ?? null,
    turnoId: it.turnoId ?? null,
    estatusId: it.estatusId ?? null,
  };
}

/* =====================================================
   UI PRIMITIVOS
===================================================== */
function StatusBadge({ status }) {
  const val = String(status ?? "").trim().toLowerCase();
  const isActive = ["activo", "active", "1", "true"].includes(val);
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}

// Campo de formulario universal (input/select/textarea)
function FormField({
  as = "input", // "input" | "select" | "textarea"
  label,
  icon,
  required,
  error,
  helper,
  children,
  className = "",
  ...props
}) {
  const FieldTag = as;
  const base = `w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 ${error ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`;
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      <div className="mt-1 relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" aria-hidden="true">
            {icon}
          </span>
        )}
        <FieldTag className={`${base} ${className}`} {...props}>
          {as === "select" ? children : null}
        </FieldTag>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </label>
  );
}

// Modal de confirmación
function ConfirmDialog({ open, title, message, confirmText = "Confirmar", cancelText = "Cancelar", tone = "danger", onConfirm, onCancel }) {
  if (!open) return null;
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
          <div className={`px-5 py-4 rounded-t-xl ${tone === "danger" ? "bg-red-50 border-b border-red-100" : "bg-slate-50 border-b"}`}>
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${tone === "danger" ? "text-red-600" : "text-slate-600"}`}>warning</span>
              <h3 className={`text-base font-semibold ${tone === "danger" ? "text-red-700" : "text-slate-800"}`}>{title}</h3>
            </div>
          </div>
          <div className="px-5 py-4 text-slate-700 text-sm">{message}</div>
          <div className="px-5 py-4 flex items-center justify-end gap-2 border-t">
            <button className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50" onClick={onCancel}>{cancelText}</button>
            <button className={`px-3 py-2 rounded-lg text-white ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Toast({ open, kind = "success", text, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[75] transition-all ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
      <div className={`flex items-start gap-3 rounded-xl shadow-lg border px-4 py-3 ${kind === "success" ? "bg-white border-green-200" : "bg-white border-slate-200"}`}>
        <span className={`material-symbols-outlined ${kind === "success" ? "text-green-600" : "text-slate-600"}`}>{kind === "success" ? "check_circle" : "info"}</span>
        <div className="text-sm text-slate-800">{text}</div>
        <button className="ml-2 text-slate-400 hover:text-slate-600" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   SHEET: ALTA DE EMPLEADO (dropdowns con Nombre, value=Id)
===================================================== */
function AddEmployeeSheet({ open, onClose, onCreate }) {
  const [form, setForm] = useState(() => ({
    nombre: "",
    email: "",
    telefono: "",
    fechaIngreso: "",
    areaId: "",
    puestoId: "",
    turnoId: "",
    estatusId: "",
    password: "",
    rol: "empleado",
    domicilio: { calle: "", numero: "", colonia: "", ciudad: "", estado: "", codigoPostal: "" },
    contacto: { nombre: "", parentesco: "", telefono: "" },
  }));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [errTop, setErrTop] = useState("");

  // ---- catálogos
  const [areas, setAreas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [estatus, setEstatus] = useState([]);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState("");

  // Normaliza items del API (usa Id / Nombre, con fallback)
  function toIdName(list = []) {
    return list.map((it) => {
      // Soporta número o string numérica
      if (typeof it === "number" || (typeof it === "string" && /^\d+$/.test(it))) {
        const id = String(it);
        return { id, name: id, areaId: null };
      }
      const id =
        it?.Id ?? it?.ID ?? it?.id ??
        it?.areaId ?? it?.puestoId ?? it?.turnoId ?? it?.estatusId ??
        it?.value ?? "";

      const name =
        it?.Nombre ?? it?.nombre ?? it?.Name ?? it?.name ??
        it?.Titulo ?? it?.titulo ?? it?.Descripcion ?? it?.descripcion ??
        String(id);

      const areaId = it?.AreaId ?? it?.areaId ?? null; // para filtrar puestos por área si viene
      return { id: String(id), name: String(name), areaId };
    });
  }

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setErrTop(""); setBusy(false); setErrors({});
      setForm({
        nombre: "", email: "", telefono: "", fechaIngreso: "",
        areaId: "", puestoId: "", turnoId: "", estatusId: "",
        password: "", rol: "empleado",
        domicilio: { calle: "", numero: "", colonia: "", ciudad: "", estado: "", codigoPostal: "" },
        contacto: { nombre: "", parentesco: "", telefono: "" },
      });
    }
  }, [open]);

  // Carga catálogos con token (Bearer) desde localStorage
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const ac = new AbortController();

    (async () => {
      setOptLoading(true);
      setOptError("");
      try {
        const headers = { ...ACCEPT_JSON, ...authHeaders() };
        const [a, t, p, e] = await Promise.all([
          fetchJSON(API.areas, { headers, signal: ac.signal }),
          fetchJSON(API.turnos, { headers, signal: ac.signal }),
          fetchJSON(API.puestos, { headers, signal: ac.signal }),
          fetchJSON(API.estatus, { headers, signal: ac.signal }),
        ]);
        if (!alive) return;
        setAreas(toIdName(Array.isArray(a) ? a : []));
        setTurnos(toIdName(Array.isArray(t) ? t : []));
        setPuestos(toIdName(Array.isArray(p) ? p : []));
        setEstatus(toIdName(Array.isArray(e) ? e : []));
      } catch (err) {
        if (alive) setOptError("No se pudieron cargar los catálogos.");
      } finally {
        if (alive) setOptLoading(false);
      }
    })();

    return () => { alive = false; ac.abort(); };
  }, [open]);

  // Puestos filtrados por área (si el API provee AreaId)
  const puestosFiltrados = useMemo(() => {
    if (!form.areaId) return puestos;
    return puestos.filter(p => String(p.areaId ?? "") === String(form.areaId));
  }, [puestos, form.areaId]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDom = (k, v) => setForm((f) => ({ ...f, domicilio: { ...f.domicilio, [k]: v } }));
  const setCtc = (k, v) => setForm((f) => ({ ...f, contacto: { ...f.contacto, [k]: v } }));

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    const email = String(form.email || "").trim();
    if (!isEmail(email)) e.email = "Correo inválido"; if (form.telefono && !isPhone(form.telefono)) e.telefono = "Teléfono inválido";
    if (form.fechaIngreso && !isDateISO(form.fechaIngreso)) e.fechaIngreso = "Fecha inválida (AAAA-MM-DD)";
    if (!isPositiveInt(form.areaId)) e.areaId = "Área inválido";
    if (!isPositiveInt(form.puestoId)) e.puestoId = "Puesto inválido";
    if (!isPositiveInt(form.turnoId)) e.turnoId = "Turno inválido";
    if (!isPositiveInt(form.estatusId)) e.estatusId = "Estatus inválido";
    if (!form.password || form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (!form.domicilio.calle.trim()) e["dom.calle"] = "Calle obligatoria";
    if (!form.domicilio.colonia.trim()) e["dom.colonia"] = "Colonia obligatoria";
    if (!form.domicilio.ciudad.trim()) e["dom.ciudad"] = "Ciudad obligatoria";
    if (!form.domicilio.estado.trim()) e["dom.estado"] = "Estado obligatorio";
    if (!form.domicilio.codigoPostal.trim()) e["dom.cp"] = "Código postal obligatorio";
    if (!form.contacto.nombre.trim()) e["ctc.nombre"] = "Nombre de contacto obligatorio";
    if (!form.contacto.parentesco.trim()) e["ctc.parentesco"] = "Parentesco obligatorio";
    if (!isPhone(form.contacto.telefono)) e["ctc.telefono"] = "Teléfono de contacto inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setErrTop("");
    if (!validate()) return;
    setBusy(true);
    try {
      await onCreate({
        ...form,
        areaId: Number(form.areaId),
        puestoId: Number(form.puestoId),
        turnoId: Number(form.turnoId),
        estatusId: Number(form.estatusId),
      });
      onClose();
    } catch (ex) {
      setErrTop(ex.message || "No se pudo crear el empleado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">person_add</span>
            <div>
              <h2 className="text-lg font-semibold">Nuevo empleado</h2>
              <p className="text-white/80 text-sm">Completa la información</p>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={submit} autoComplete="off" className="h-[calc(100%-7rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {errTop && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{errTop}</div>}

            {/* Identidad */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Identidad</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Nombre" required icon="person" placeholder={PLACEHOLDERS.nombre} value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} error={errors.nombre} />
                <FormField label="Correo" required icon="mail" type="email" placeholder={PLACEHOLDERS.email} value={form.email} onChange={(e) => setField("email", e.target.value)} error={errors.email} />
                <FormField label="Teléfono" icon="call" placeholder={PLACEHOLDERS.telefono} value={form.telefono} onChange={(e) => setField("telefono", e.target.value)} error={errors.telefono} />
                <FormField label="Fecha de ingreso" icon="event" type="date" placeholder={PLACEHOLDERS.fecha} value={form.fechaIngreso} onChange={(e) => setField("fechaIngreso", e.target.value)} error={errors.fechaIngreso} />
              </div>
            </section>

            {/* Asignación: dropdowns con Nombre, value=Id (fallback a numérico) */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Asignación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Área */}
                {areas.length ? (
                  <FormField
                    as="select"
                    label="Área"
                    required
                    icon="apartment"
                    value={form.areaId}
                    onChange={(e) => { setField("areaId", e.target.value); setField("puestoId", ""); }}
                    error={errors.areaId}
                  >
                    <option value="" disabled>{PLACEHOLDERS.areaId}</option>
                    {areas.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option> // muestra Nombre, envía Id
                    ))}
                  </FormField>
                ) : (
                  <FormField label="Área ID" required icon="apartment" type="number" inputMode="numeric" min="1" placeholder={PLACEHOLDERS.areaId} value={form.areaId} onChange={(e) => setField("areaId", e.target.value)} error={errors.areaId} />
                )}

                {/* Puesto */}
                {(puestosFiltrados.length || puestos.length) ? (
                  <FormField
                    as="select"
                    label="Puesto"
                    required
                    icon="workspace_premium"
                    value={form.puestoId}
                    onChange={(e) => setField("puestoId", e.target.value)}
                    error={errors.puestoId}
                    disabled={!form.areaId}
                  >
                    <option value="" disabled>{PLACEHOLDERS.puestoId}</option>
                    {(puestosFiltrados.length ? puestosFiltrados : puestos).map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </FormField>
                ) : (
                  <FormField label="Puesto ID" required icon="workspace_premium" type="number" inputMode="numeric" min="1" placeholder={PLACEHOLDERS.puestoId} value={form.puestoId} onChange={(e) => setField("puestoId", e.target.value)} error={errors.puestoId} />
                )}

                {/* Turno */}
                {turnos.length ? (
                  <FormField
                    as="select"
                    label="Turno"
                    required
                    icon="schedule"
                    value={form.turnoId}
                    onChange={(e) => setField("turnoId", e.target.value)}
                    error={errors.turnoId}
                  >
                    <option value="" disabled>{PLACEHOLDERS.turnoId}</option>
                    {turnos.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </FormField>
                ) : (
                  <FormField label="Turno ID" required icon="schedule" type="number" inputMode="numeric" min="1" placeholder={PLACEHOLDERS.turnoId} value={form.turnoId} onChange={(e) => setField("turnoId", e.target.value)} error={errors.turnoId} />
                )}

                {/* Estatus */}
                {estatus.length ? (
                  <FormField
                    as="select"
                    label="Estatus"
                    required
                    icon="verified_user"
                    value={form.estatusId}
                    onChange={(e) => setField("estatusId", e.target.value)}
                    error={errors.estatusId}
                  >
                    <option value="" disabled>{PLACEHOLDERS.estatusId}</option>
                    {estatus.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </FormField>
                ) : (
                  <FormField label="Estatus ID" required icon="verified_user" type="number" inputMode="numeric" min="1" placeholder={PLACEHOLDERS.estatusId} value={form.estatusId} onChange={(e) => setField("estatusId", e.target.value)} error={errors.estatusId} />
                )}
              </div>

              {optLoading && <p className="mt-2 text-xs text-slate-500">Cargando catálogos…</p>}
              {optError && <p className="mt-2 text-xs text-red-600">{optError}</p>}
            </section>

            {/* Acceso */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Acceso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Contraseña" required icon="password" type="password" name="new-password" autoComplete="new-password" placeholder={PLACEHOLDERS.password} value={form.password} onChange={(e) => setField("password", e.target.value)} error={errors.password} />
                <FormField as="select" label="Rol" required icon="badge" value={form.rol} onChange={(e) => setField("rol", e.target.value)}>
                  <option value="" disabled>{PLACEHOLDERS.rol}</option>
                  <option value="empleado">empleado</option>
                  <option value="admin">admin</option>
                </FormField>
              </div>
            </section>

            {/* Domicilio */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Domicilio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Calle" required icon="home" placeholder={PLACEHOLDERS.domicilio.calle} value={form.domicilio.calle} onChange={(e) => setDom("calle", e.target.value)} error={errors["dom.calle"]} />
                <FormField label="Número" icon="tag" placeholder={PLACEHOLDERS.domicilio.numero} value={form.domicilio.numero} onChange={(e) => setDom("numero", e.target.value)} />
                <FormField label="Colonia" required icon="location_city" placeholder={PLACEHOLDERS.domicilio.colonia} value={form.domicilio.colonia} onChange={(e) => setDom("colonia", e.target.value)} error={errors["dom.colonia"]} />
                <FormField label="Ciudad" required icon="location_on" placeholder={PLACEHOLDERS.domicilio.ciudad} value={form.domicilio.ciudad} onChange={(e) => setDom("ciudad", e.target.value)} error={errors["dom.ciudad"]} />
                <FormField label="Estado" required icon="map" placeholder={PLACEHOLDERS.domicilio.estado} value={form.domicilio.estado} onChange={(e) => setDom("estado", e.target.value)} error={errors["dom.estado"]} />
                <FormField label="Código Postal" required icon="markunread_mailbox" placeholder={PLACEHOLDERS.domicilio.codigoPostal} value={form.domicilio.codigoPostal} onChange={(e) => setDom("codigoPostal", e.target.value)} error={errors["dom.cp"]} />
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Contacto de emergencia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Nombre" required icon="person" placeholder={PLACEHOLDERS.contacto.nombre} value={form.contacto.nombre} onChange={(e) => setCtc("nombre", e.target.value)} error={errors["ctc.nombre"]} />
                <FormField label="Parentesco" required icon="group" placeholder={PLACEHOLDERS.contacto.parentesco} value={form.contacto.parentesco} onChange={(e) => setCtc("parentesco", e.target.value)} error={errors["ctc.parentesco"]} />
                <FormField label="Teléfono" required icon="call" placeholder={PLACEHOLDERS.contacto.telefono} value={form.contacto.telefono} onChange={(e) => setCtc("telefono", e.target.value)} error={errors["ctc.telefono"]} />
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 border-t bg-white p-4 flex items-center justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={busy} className={`px-4 py-2 rounded-lg text-white inline-flex items-center gap-2 ${busy ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
              <span className="material-symbols-outlined text-[20px]">{busy ? "hourglass_top" : "save"}</span>
              {busy ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}


/* =====================================================
   SHEET: DETALLE / EDICIÓN (con catálogos en dropdown)
===================================================== */
function EmployeeDetailSheet({ open, onClose, detail, setDetail, onSave, loading, error }) {
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ---- catálogos (mismo patrón que en AddEmployeeSheet)
  const [areas, setAreas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [estatus, setEstatus] = useState([]);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState("");

  useEffect(() => {
    if (open) { setEditMode(false); setBusy(false); setErr(""); setFieldErrors({}); }
  }, [open]);

  // normalizador defensivo (Id/Nombre y soporta variantes)
  function toIdName(list = []) {
    return list.map((it) => {
      if (typeof it === "number" || (typeof it === "string" && /^\d+$/.test(it))) {
        const id = String(it);
        return { id, name: id, areaId: null };
      }
      const id =
        it?.Id ?? it?.ID ?? it?.id ??
        it?.areaId ?? it?.puestoId ?? it?.turnoId ?? it?.estatusId ?? it?.value ?? "";
      const name =
        it?.Nombre ?? it?.nombre ?? it?.Name ?? it?.name ??
        it?.Titulo ?? it?.titulo ?? it?.Descripcion ?? it?.descripcion ?? String(id);
      const areaId = it?.AreaId ?? it?.areaId ?? null;
      return { id: String(id), name: String(name), areaId };
    });
  }

  // carga catálogos al abrir el sheet
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const ac = new AbortController();

    (async () => {
      setOptLoading(true);
      setOptError("");
      try {
        const headers = { ...ACCEPT_JSON, ...authHeaders() };
        const [a, t, p, e] = await Promise.all([
          fetchJSON(API.areas, { headers, signal: ac.signal }),
          fetchJSON(API.turnos, { headers, signal: ac.signal }),
          fetchJSON(API.puestos, { headers, signal: ac.signal }),
          fetchJSON(API.estatus, { headers, signal: ac.signal }),
        ]);
        if (!alive) return;
        setAreas(toIdName(Array.isArray(a) ? a : []));
        setTurnos(toIdName(Array.isArray(t) ? t : []));
        setPuestos(toIdName(Array.isArray(p) ? p : []));
        setEstatus(toIdName(Array.isArray(e) ? e : []));
      } catch (e) {
        if (alive) setOptError("No se pudieron cargar los catálogos.");
      } finally {
        if (alive) setOptLoading(false);
      }
    })();

    return () => { alive = false; ac.abort(); };
  }, [open]);

  // filtrar puestos por área (si catálogo trae AreaId)
  const puestosFiltrados = useMemo(() => {
    if (!detail?.areaId) return puestos;
    return puestos.filter(p => String(p.areaId ?? "") === String(detail.areaId));
  }, [puestos, detail?.areaId]);

  const setField = (k, v) => setDetail((d) => ({ ...d, [k]: v }));

  function validate(d) {
    const e = {};
    if (!d?.nombre || !d.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!(d?.email || d?.correo) || !isEmail(d.email || d.correo)) e.email = "Correo inválido";
    if (d.telefono && !isPhone(d.telefono)) e.telefono = "Teléfono inválido";
    if (!isPositiveInt(d.areaId)) e.areaId = "Área ID inválido";
    if (!isPositiveInt(d.puestoId)) e.puestoId = "Puesto ID inválido";
    if (!isPositiveInt(d.turnoId)) e.turnoId = "Turno ID inválido";
    if (!isPositiveInt(d.estatusId)) e.estatusId = "Estatus ID inválido";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!detail || busy) return;
    setErr("");
    if (!validate(detail)) return;
    setBusy(true);
    try {
      await onSave(detail); // tu saveDetail ya castea a Number(...)
      setEditMode(false);
    } catch (ex) {
      setErr(ex.message || "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true" aria-label="Detalle de empleado" onClick={(e) => e.stopPropagation()}>
        <header className="h-14 px-5 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">{editMode ? "Editar empleado" : "Detalle del empleado"}</h2>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button className="p-2 rounded hover:bg-slate-100" onClick={() => setEditMode(true)} title="Editar" aria-label="Editar">
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
            <button className="p-2 rounded hover:bg-slate-100" onClick={onClose} aria-label="Cerrar">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="p-5 space-y-4">
          {loading && <p className="text-slate-500">Cargando…</p>}
          {!loading && error && <p className="text-red-600">{error}</p>}

          {!loading && !error && detail && (
            editMode ? (
              <form className="space-y-4" onSubmit={submit} noValidate>
                {err && <p className="text-sm text-red-600">{err}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nombre" required icon="person" placeholder={PLACEHOLDERS.nombre} value={detail.nombre || ""} onChange={(e) => setField("nombre", e.target.value)} error={fieldErrors.nombre} />
                  <FormField label="Correo" required icon="mail" type="email" placeholder={PLACEHOLDERS.email} value={detail.email || detail.correo || ""} onChange={(e) => setField("email", e.target.value)} error={fieldErrors.email} />
                  <FormField label="Teléfono" icon="call" placeholder={PLACEHOLDERS.telefono} value={detail.telefono || ""} onChange={(e) => setField("telefono", e.target.value)} error={fieldErrors.telefono} />
                  <FormField label="Fecha de ingreso" icon="event" type="date" placeholder={PLACEHOLDERS.fecha} value={detail.fechaIngreso || ""} onChange={(e) => setField("fechaIngreso", e.target.value)} />

                  {/* === Dropdowns con Nombre (value=Id); fallback numérico === */}
                  {/* Área */}
                  {areas.length ? (
                    <FormField as="select" label="Área" required icon="apartment"
                      value={detail.areaId ?? ""} onChange={(e) => { setField("areaId", e.target.value); setField("puestoId", ""); }}
                      error={fieldErrors.areaId}>
                      <option value="" disabled>{PLACEHOLDERS.areaId}</option>
                      {areas.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </FormField>
                  ) : (
                    <FormField label="Área ID" required icon="apartment" type="number" inputMode="numeric" min="1"
                      placeholder={PLACEHOLDERS.areaId} value={detail.areaId ?? ""} onChange={(e) => setField("areaId", e.target.value)} error={fieldErrors.areaId} />
                  )}

                  {/* Puesto (filtrado por área si aplica) */}
                  {(puestosFiltrados.length || puestos.length) ? (
                    <FormField as="select" label="Puesto" required icon="workspace_premium"
                      value={detail.puestoId ?? ""} onChange={(e) => setField("puestoId", e.target.value)}
                      error={fieldErrors.puestoId} disabled={!detail.areaId}>
                      <option value="" disabled>{PLACEHOLDERS.puestoId}</option>
                      {(puestosFiltrados.length ? puestosFiltrados : puestos).map(o =>
                        <option key={o.id} value={o.id}>{o.name}</option>
                      )}
                    </FormField>
                  ) : (
                    <FormField label="Puesto ID" required icon="workspace_premium" type="number" inputMode="numeric" min="1"
                      placeholder={PLACEHOLDERS.puestoId} value={detail.puestoId ?? ""} onChange={(e) => setField("puestoId", e.target.value)} error={fieldErrors.puestoId} />
                  )}

                  {/* Turno */}
                  {turnos.length ? (
                    <FormField as="select" label="Turno" required icon="schedule"
                      value={detail.turnoId ?? ""} onChange={(e) => setField("turnoId", e.target.value)}
                      error={fieldErrors.turnoId}>
                      <option value="" disabled>{PLACEHOLDERS.turnoId}</option>
                      {turnos.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </FormField>
                  ) : (
                    <FormField label="Turno ID" required icon="schedule" type="number" inputMode="numeric" min="1"
                      placeholder={PLACEHOLDERS.turnoId} value={detail.turnoId ?? ""} onChange={(e) => setField("turnoId", e.target.value)} error={fieldErrors.turnoId} />
                  )}

                  {/* Estatus (Activo, Inactivo, Suspendido, Baja) */}
                  {estatus.length ? (
                    <FormField as="select" label="Estatus" required icon="verified_user"
                      value={detail.estatusId ?? ""} onChange={(e) => setField("estatusId", e.target.value)}
                      error={fieldErrors.estatusId}>
                      <option value="" disabled>{PLACEHOLDERS.estatusId}</option>
                      {estatus.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </FormField>
                  ) : (
                    <FormField label="Estatus ID" required icon="verified_user" type="number" inputMode="numeric" min="1"
                      placeholder={PLACEHOLDERS.estatusId} value={detail.estatusId ?? ""} onChange={(e) => setField("estatusId", e.target.value)} error={fieldErrors.estatusId} />
                  )}
                </div>

                {/* contexto de labels actuales */}
                <p className="text-xs text-slate-500">
                  {detail.area && <>Área actual: <b>{detail.area}</b> · </>}
                  {detail.puesto && <>Puesto actual: <b>{detail.puesto}</b> · </>}
                  {detail.turno && <>Turno actual: <b>{detail.turno}</b> · </>}
                  {detail.estatus && <>Estatus actual: <b>{detail.estatus}</b></>}
                </p>

                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={() => setEditMode(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" disabled={busy}>
                    {busy ? "Guardando..." : "Guardar"}
                  </button>
                </div>

                {optLoading && <p className="text-xs text-slate-500">Cargando catálogos…</p>}
                {optError && <p className="text-xs text-red-600">{optError}</p>}
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/*<Info label="ID" value={detail.id} />*/}
                <Info label="Nombre" value={detail.nombre} />
                <Info label="Correo" value={detail.email || detail.correo} />
                <Info label="Teléfono" value={detail.telefono || "—"} />
                <Info label="Fecha ingreso" value={detail.fechaIngreso || "—"} />
                <Info label="Área" value={detail.area || "—"} />
                <Info label="Puesto" value={detail.puesto || "—"} />
                <Info label="Turno" value={detail.turno || "—"} />
                <Info label="Estatus" value={<StatusBadge status={detail.estatus} />} />
              </div>
            )
          )}
        </div>
      </aside>
    </div>
  );
}


function Info({ label, value }) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */
export default function EmployeeTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [selectedId, setSelectedId] = useState(null);

  // detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // add
  const [addOpen, setAddOpen] = useState(false);

  // eliminar (confirm + toast)
  const [confirmDel, setConfirmDel] = useState({ open: false, id: null, name: "" });
  const [toast, setToast] = useState({ open: false, text: "", kind: "success" });

  // filtros
  const [fDept, setFDept] = useState("Departamento");
  const [fRole, setFRole] = useState("Cargo");
  const [fShift, setFShift] = useState("Turno");
  const [fStatus, setFStatus] = useState("Estado");

  // Cargar lista
  useEffect(() => {
    let alive = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true); setError("");
      try {
        const json = await fetchJSON(API.base, { headers: { ...ACCEPT_JSON, ...authHeaders() }, signal: ac.signal });
        const mapped = (Array.isArray(json) ? json : []).map(mapRow);
        if (alive) setData(mapped);
      } catch (ex) {
        if (alive) setError("No se pudo cargar la lista de empleados.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; ac.abort(); };
  }, []);

  // Al seleccionar fila: traer detalle {id}/detalle con prefill
  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    const ac = new AbortController();

    const row = data.find((x) => x.id === selectedId);
    if (row) {
      setDetail({
        id: row.id,
        nombre: row.name,
        email: row.email,
        telefono: "",
        fechaIngreso: "",
        area: row.dept,
        puesto: row.role,
        turno: row.shift,
        estatus: row.status,
        areaId: row.areaId,
        puestoId: row.puestoId,
        turnoId: row.turnoId,
        estatusId: row.estatusId,
      });
    }
    setDetailOpen(true);
    setDetailError("");
    setDetailLoading(true);

    (async () => {
      try {
        const it = await fetchJSON(API.detail(selectedId), { headers: { ...ACCEPT_JSON, ...authHeaders() }, signal: ac.signal });
        if (!alive || !it) return;
        const rowNorm = mapRow(it);
        setDetail((prev) => ({
          ...prev,
          id: it.id ?? prev?.id,
          nombre: it.nombre ?? prev?.nombre ?? "",
          email: it.email ?? it.correo ?? prev?.email ?? "",
          telefono: it.telefono ?? prev?.telefono ?? "",
          fechaIngreso: it.fechaIngreso ?? prev?.fechaIngreso ?? "",
          area: rowNorm.dept || prev?.area || "",
          puesto: rowNorm.role || prev?.puesto || "",
          turno: rowNorm.shift || prev?.turno || "",
          estatus: rowNorm.status || prev?.estatus || "",
          areaId: rowNorm.areaId ?? prev?.areaId ?? "",
          puestoId: rowNorm.puestoId ?? prev?.puestoId ?? "",
          turnoId: rowNorm.turnoId ?? prev?.turnoId ?? "",
          estatusId: rowNorm.estatusId ?? prev?.estatusId ?? "",
        }));
      } catch (ex) {
        if (alive) setDetailError("No se pudo cargar el detalle.");
      } finally {
        if (alive) setDetailLoading(false);
      }
    })();

    return () => { alive = false; ac.abort(); };
  }, [selectedId, data]);

  // Util: recargar lista entera
  async function reloadList() {
    const json = await fetchJSON(API.base, { headers: { ...ACCEPT_JSON, ...authHeaders() } });
    setData((Array.isArray(json) ? json : []).map(mapRow));
  }

  // Util: refrescar una fila concreta desde {id}/detalle
  async function refreshRow(id) {
    const it = await fetchJSON(API.detail(id), { headers: { ...ACCEPT_JSON, ...authHeaders() } });
    if (!it) return;
    const row = mapRow(it);
    setData((prev) => prev.map((x) => (x.id === row.id ? row : x)));
    setDetail((prev) => ({
      ...prev,
      id: it.id,
      nombre: it.nombre ?? prev?.nombre ?? "",
      email: it.email ?? it.correo ?? prev?.email ?? "",
      telefono: it.telefono ?? prev?.telefono ?? "",
      fechaIngreso: it.fechaIngreso ?? prev?.fechaIngreso ?? "",
      area: row.dept,
      puesto: row.role,
      turno: row.shift,
      estatus: row.status,
      areaId: row.areaId,
      puestoId: row.puestoId,
      turnoId: row.turnoId,
      estatusId: row.estatusId,
    }));
  }

  // Reemplaza tu saveDetail por este
  // PUT empleado (IDs + fechaIngreso normalizada + token)
  async function saveDetail(d) {
    const toInt = (v, name) => {
      if (!isPositiveInt(v)) throw new Error(`${name} inválido`);
      return Number(v);
    };

    // Normaliza AAAA-MM-DD (soporta "2025-11-06T00:00:00")
    const fechaIso = d.fechaIngreso ? String(d.fechaIngreso).slice(0, 10) : null;

    const payload = {
      nombre: d.nombre?.trim(),
      email: d.email ?? d.correo,    // compat con backend
      correo: d.email ?? d.correo,   // compat
      telefono: d.telefono || null,
      fechaIngreso: fechaIso,        // 👈 ahora sí se envía
      areaId: toInt(d.areaId, "Área ID"),
      puestoId: toInt(d.puestoId, "Puesto ID"),
      turnoId: toInt(d.turnoId, "Turno ID"),
      estatusId: toInt(d.estatusId, "Estatus ID"),
    };

    // Limpia nulos para no romper validadores del backend
    Object.keys(payload).forEach(k => (payload[k] == null) && delete payload[k]);

    let updated;
    try {
      updated = await fetchJSON(`${API.base}/${d.id}`, {
        method: "PUT",
        headers: { ...JSON_HEADERS, ...authHeaders() }, // 👈 token
        body: JSON.stringify(payload),
      });
    } catch (ex) {
      // Mensaje amable cuando sea red/CORS
      const msg = (ex?.message || "").toLowerCase();
      if (msg === "network_fail" || msg.includes("failed to fetch") || msg.includes("networkerror")) {
        throw new Error("No se pudo contactar al servidor (CORS o conexión). Intenta de nuevo.");
      }
      throw ex;
    }

    if (updated?.id) {
      // Refleja cambios en la tabla
      setData(prev =>
        prev.map(x =>
          x.id === String(updated.id)
            ? {
              ...x,
              ...mapRow(updated),
              areaId: payload.areaId,
              puestoId: payload.puestoId,
              turnoId: payload.turnoId,
              estatusId: payload.estatusId,
            }
            : x
        )
      );

      // Refleja cambios en el sheet
      setDetail(prev => ({
        ...prev,
        nombre: updated.nombre ?? prev?.nombre,
        email: updated.email ?? updated.correo ?? prev?.email,
        telefono: updated.telefono ?? prev?.telefono,
        fechaIngreso: updated.fechaIngreso ?? prev?.fechaIngreso,
        area: updated.area ?? updated.areaNombre ?? prev?.area,
        puesto: updated.puesto ?? updated.puestoNombre ?? prev?.puesto,
        turno: updated.turno ?? updated.turnoNombre ?? prev?.turno,
        estatus: updated.estatus ?? updated.estatusNombre ?? prev?.estatus,
        areaId: payload.areaId,
        puestoId: payload.puestoId,
        turnoId: payload.turnoId,
        estatusId: payload.estatusId,
      }));
    } else {
      // Si el API no devuelve el recurso completo, refresca
      await refreshRow(d.id);
    }
  }
  // POST empleado (IDs + password + domicilio + contacto)
  async function handleCreateEmployee(ui) {
    const payload = {
      nombre: ui.nombre,
      email: ui.email,
      telefono: ui.telefono,
      fechaIngreso: ui.fechaIngreso,
      areaId: Number(ui.areaId),
      puestoId: Number(ui.puestoId),
      turnoId: Number(ui.turnoId),
      estatusId: Number(ui.estatusId),
      password: ui.password,
      rol: ui.rol || "empleado",
      domicilio: { ...ui.domicilio },
      contacto: { ...ui.contacto },
    };
    const created = await fetchJSON(API.base, { method: "POST", headers: { ...JSON_HEADERS, ...authHeaders() }, body: JSON.stringify(payload) });
    if (created?.id) {
      setData((prev) => [mapRow(created), ...prev]);
    } else {
      await reloadList();
    }
    setPage(1);
    setToast({ open: true, text: `Empleado "${created?.nombre ?? ui.nombre}" creado`, kind: "success" });
    return created ?? true;
  }

  // Eliminar — confirma y elimina
  function askDelete(id) {
    const row = data.find((x) => x.id === id);
    setConfirmDel({ open: true, id, name: row?.name || "" });
  }
  
  async function doDelete() {
    const { id, name } = confirmDel;

    setConfirmDel({ open: false, id: null, name: "" });

    await fetchJSON(`${API.base}/${id}`, {
      method: "DELETE",
      headers: { ...ACCEPT_JSON, ...authHeaders() }
    });

    // recarga toda la lista del backend
    await reloadList();

    setPage(1);

    setToast({
      open: true,
      text: `Empleado "${name}" eliminado`,
      kind: "success"
    });
  }


  // Búsqueda + filtros
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data;
    if (q) list = list.filter((x) => [x.name, x.email, x.role, x.dept, x.status].some((v) => String(v).toLowerCase().includes(q)));
    if (fDept !== "Departamento") list = list.filter((x) => x.dept === fDept);
    if (fRole !== "Cargo") list = list.filter((x) => x.role === fRole);
    if (fShift !== "Turno") list = list.filter((x) => x.shift === fShift);
    if (fStatus !== "Estado") list = list.filter((x) => {
      const val = String(x.status).toLowerCase();
      return fStatus === "Activo" ? ["activo", "active", "1", "true"].includes(val) : !["activo", "active", "1", "true"].includes(val);
    });
    return list;
  }, [data, query, fDept, fRole, fShift, fStatus]);

  const deptOpts = useMemo(() => ["Departamento", ...Array.from(new Set(data.map((d) => d.dept).filter(Boolean)))], [data]);
  const roleOpts = useMemo(() => ["Cargo", ...Array.from(new Set(data.map((d) => d.role).filter(Boolean)))], [data]);
  const shiftOpts = useMemo(() => ["Turno", ...Array.from(new Set(data.map((d) => d.shift).filter(Boolean)))], [data]);

  // Paginación
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const slice = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  function goPrev() { setPage((p) => Math.max(1, p - 1)); }
  function goNext() { setPage((p) => Math.min(totalPages, p + 1)); }
  function jump(n) { setPage(n); }

  // CSV
  function handleExport() {
    const headers = ["Nombre", "Correo", "Cargo", "Departamento", "Turno", "Estado"];
    const rows = filtered.map((r) => [r.name, r.email, r.role, r.dept, r.shift || "", r.status]);
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "empleados.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // auto-hide toast
  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, open: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.open]);

  return (
    <div className="min-h-dvh h-full overflow-y-auto bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold">Empleados</h1>
          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" onClick={handleExport}>
              <span className="material-symbols-outlined text-[20px]">download</span> Exportar
            </button>
            <button type="button" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm" onClick={() => setAddOpen(true)}>
              <span className="material-symbols-outlined text-[20px]">person_add</span> Añadir
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">

          <div className="relative flex-1 min-w-[220px]">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input id="search" type="text" placeholder="Buscar nombre, correo, cargo..." value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fDept} onChange={(e) => { setPage(1); setFDept(e.target.value); }}>
              {deptOpts.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fRole} onChange={(e) => { setPage(1); setFRole(e.target.value); }}>
              {roleOpts.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fShift} onChange={(e) => { setPage(1); setFShift(e.target.value); }}>
              {shiftOpts.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fStatus} onChange={(e) => { setPage(1); setFStatus(e.target.value); }}>
              {["Estado", "Activo", "Inactivo"].map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="w-10 py-3 pl-4 pr-2 text-left font-semibold"><span className="sr-only">Sel</span></th>
                  <th className="py-3 px-4 text-left font-semibold">Nombre</th>
                  <th className="py-3 px-4 text-left font-semibold">Correo</th>
                  <th className="py-3 px-4 text-left font-semibold">Cargo</th>
                  <th className="py-3 px-4 text-left font-semibold">Departamento</th>
                  <th className="py-3 px-4 text-left font-semibold">Turno</th>
                  <th className="py-3 px-4 text-left font-semibold">Estado</th>
                  <th className="py-3 px-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading && <tr><td colSpan={8} className="p-8 text-center text-slate-500">Cargando…</td></tr>}
                {!loading && error && <tr><td colSpan={8} className="p-8 text-center text-red-600">{error}</td></tr>}

                {!loading && !error && slice.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50" onClick={() => setSelectedId(row.id)}>
                    <td className="py-4 pl-4 pr-2">
                      <button
                        className="text-slate-400 hover:text-blue-600"
                        title="Ver detalles"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(row.id);
                        }}
                        aria-label="Ver empleado"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-4">{row.name || "—"}</td>
                    <td className="py-4 px-4">{row.email || "—"}</td>
                    <td className="py-4 px-4">{row.role || "—"}</td>
                    <td className="py-4 px-4">{row.dept || "—"}</td>
                    <td className="py-4 px-4">{row.shift || "—"}</td>
                    <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <button className="hover:text-blue-600" title="Editar" onClick={(e) => { e.stopPropagation(); setSelectedId(row.id); }} aria-label="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="hover:text-red-600" title="Eliminar" onClick={(e) => { e.stopPropagation(); askDelete(row.id); }} aria-label="Eliminar">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && !error && slice.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-slate-500">Mostrando {start + (slice.length ? 1 : 0)}-{start + slice.length} de {total} resultados</span>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50" onClick={goPrev} disabled={currentPage === 1}>Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`px-3 py-1 rounded-lg text-sm ${n === currentPage ? "bg-blue-600 text-white shadow-sm" : "border border-slate-300 bg-white hover:bg-slate-50"}`} onClick={() => jump(n)}>{n}</button>
              ))}
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50" onClick={goNext} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets y Modales */}
      <AddEmployeeSheet open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateEmployee} />
      <EmployeeDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} detail={detail} setDetail={setDetail} onSave={saveDetail} loading={detailLoading} error={detailError} />
      <ConfirmDialog open={confirmDel.open} title="Eliminar empleado" message={<>¿Seguro que deseas eliminar a <b>{confirmDel.name || "este empleado"}</b>? Esta acción no se puede deshacer.</>} confirmText="Eliminar" tone="danger" onConfirm={doDelete} onCancel={() => setConfirmDel({ open: false, id: null, name: "" })} />
      <Toast open={toast.open} text={toast.text} kind={toast.kind} onClose={() => setToast((s) => ({ ...s, open: false }))} />
    </div>
  );
}
