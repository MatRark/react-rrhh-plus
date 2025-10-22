import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

/* =========================================
   Config / Helpers
========================================= */
const API = {
  base:   "https://rhplus.somee.com/api/Employees",              // GET list, POST, PUT {id}, DELETE {id}
  detail: (id) => `https://rhplus.somee.com/api/Employees/${id}/detalle`,
};
const getToken = () => localStorage.getItem("token") || "";
const authHeaders = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});
const acceptJSON = { Accept: "application/json" };

/* Helpers de red robustos */
const okOrThrow = async (res) => {
  if (res.ok) return res;
  const txt = await res.text().catch(() => "");
  throw new Error(txt || `HTTP ${res.status}`);
};
const readJSONSafe = async (res) => {
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    // si no mandan content-type correcto, igual intento parsear
    return ct.includes("application/json") ? JSON.parse(text) : JSON.parse(text);
  } catch {
    return null;
  }
};
const mapRow = (it) => ({
  id: String(it.id),
  name: it.nombre ?? "",
  email: it.email ?? it.correo ?? "",
  role: it.puesto ?? it.puestoNombre ?? "",
  dept: it.area ?? it.areaNombre ?? "",
  status: it.estatus ?? it.estatusNombre ?? "",
  shift: it.turno ?? it.turnoNombre ?? "",
  areaId: it.areaId ?? null,
  puestoId: it.puestoId ?? null,
  turnoId: it.turnoId ?? null,
  estatusId: it.estatusId ?? null,
});

/* =========================================
   UI: Badges, Inputs, Dialog, Toast
========================================= */
const StatusBadge = ({ status }) => {
  const val = String(status ?? "").trim().toLowerCase();
  const isActive = val === "activo" || val === "active" || val === "1" || val === "true";
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
};

function LabeledInput({ label, icon, required, className = "", ...props }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      <div className="mt-1 relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
      </div>
    </label>
  );
}

function LabeledSelect({ label, icon, children, required, className = "", ...props }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      <div className="mt-1 relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" aria-hidden="true">
            {icon}
          </span>
        )}
        <select
          {...props}
          className={`w-full ${icon ? "pl-10" : "pl-3"} pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        >
          {children}
        </select>
      </div>
    </label>
  );
}

/* Dialog de Confirmación Bonito (con portal + ESC + overlay) */
function ConfirmDialog({ open, title, message, confirmText = "Eliminar", cancelText = "Cancelar", tone = "danger", onConfirm, onCancel }) {
  if (!open) return null;
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
        >
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

/* Toast sencillo bottom-right */
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

/* =========================================
   Sheet: Añadir Empleado (IDs + password)
========================================= */
function AddEmployeeSheet({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
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
    contacto: { nombre: "", parentesco: "", telefono: "" }
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setErr(""); setBusy(false);
      setForm({
        nombre: "", email: "", telefono: "", fechaIngreso: "",
        areaId: "", puestoId: "", turnoId: "", estatusId: "",
        password: "", rol: "empleado",
        domicilio: { calle:"", numero:"", colonia:"", ciudad:"", estado:"", codigoPostal:"" },
        contacto: { nombre:"", parentesco:"", telefono:"" }
      });
    }
  }, [open]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const updateDom = (k) => (e) => setForm((f) => ({ ...f, domicilio: { ...f.domicilio, [k]: e.target.value }}));
  const updateCtc = (k) => (e) => setForm((f) => ({ ...f, contacto: { ...f.contacto, [k]: e.target.value }}));

  const requiredOk = [
    "nombre","email","areaId","puestoId","turnoId","estatusId","password",
    "domicilio.calle","domicilio.colonia","domicilio.ciudad","domicilio.estado","domicilio.codigoPostal",
    "contacto.nombre","contacto.parentesco","contacto.telefono"
  ].every((key) => {
    const val = key.split(".").reduce((acc,k)=>acc?.[k], form);
    return String(val ?? "").trim().length > 0;
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!requiredOk || busy) return;
    setErr(""); setBusy(true);
    try {
      await onCreate({
        ...form,
        areaId: Number(form.areaId),
        puestoId: Number(form.puestoId),
        turnoId: Number(form.turnoId),
        estatusId: Number(form.estatusId),
      });
      onClose(); // cerrar al crear OK
    } catch (ex) {
      setErr(ex.message || "No se pudo crear el empleado.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`} onClick={(e)=>e.stopPropagation()}>
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">person_add</span>
            <div><h2 className="text-lg font-semibold">Nuevo empleado</h2><p className="text-white/80 text-sm">Completa la información</p></div>
          </div>
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </header>

        <form onSubmit={submit} autoComplete="off" className="h-[calc(100%-7rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Identidad */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Identidad</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Nombre" required icon="person" autoComplete="off" value={form.nombre} onChange={update("nombre")} />
                <LabeledInput label="Correo" required icon="mail" type="email" autoComplete="off" value={form.email} onChange={update("email")} />
                <LabeledInput label="Teléfono" icon="call" autoComplete="off" value={form.telefono} onChange={update("telefono")} />
                <LabeledInput label="Fecha de ingreso" icon="event" type="date" autoComplete="off" value={form.fechaIngreso} onChange={update("fechaIngreso")} />
              </div>
            </section>

            {/* IDs */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Asignación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Área ID" required icon="apartment" type="number" min="1" step="1" value={form.areaId} onChange={update("areaId")} />
                <LabeledInput label="Puesto ID" required icon="workspace_premium" type="number" min="1" step="1" value={form.puestoId} onChange={update("puestoId")} />
                <LabeledInput label="Turno ID" required icon="schedule" type="number" min="1" step="1" value={form.turnoId} onChange={update("turnoId")} />
                <LabeledInput label="Estatus ID" required icon="verified_user" type="number" min="1" step="1" value={form.estatusId} onChange={update("estatusId")} />
              </div>
            </section>

            {/* Acceso */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Acceso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Contraseña" required icon="password" type="password" name="new-password" autoComplete="new-password" value={form.password} onChange={update("password")} />
                <LabeledSelect label="Rol" required icon="badge" value={form.rol} onChange={update("rol")}>
                  <option value="empleado">empleado</option>
                  <option value="admin">admin</option>
                </LabeledSelect>
              </div>
            </section>

            {/* Domicilio */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Domicilio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Calle" required icon="home" value={form.domicilio.calle} onChange={updateDom("calle")} />
                <LabeledInput label="Número" icon="tag" value={form.domicilio.numero} onChange={updateDom("numero")} />
                <LabeledInput label="Colonia" required icon="location_city" value={form.domicilio.colonia} onChange={updateDom("colonia")} />
                <LabeledInput label="Ciudad" required icon="location_on" value={form.domicilio.ciudad} onChange={updateDom("ciudad")} />
                <LabeledInput label="Estado" required icon="map" value={form.domicilio.estado} onChange={updateDom("estado")} />
                <LabeledInput label="Código Postal" required icon="markunread_mailbox" value={form.domicilio.codigoPostal} onChange={updateDom("codigoPostal")} />
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Contacto de emergencia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Nombre" required icon="person" value={form.contacto.nombre} onChange={updateCtc("nombre")} />
                <LabeledInput label="Parentesco" required icon="group" value={form.contacto.parentesco} onChange={updateCtc("parentesco")} />
                <LabeledInput label="Teléfono" required icon="call" value={form.contacto.telefono} onChange={updateCtc("telefono")} />
              </div>
            </section>

            {err && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}
          </div>

          <div className="sticky bottom-0 border-t bg-white p-4 flex items-center justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={!requiredOk || busy} className={`px-4 py-2 rounded-lg text-white inline-flex items-center gap-2 ${!requiredOk || busy ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
              <span className="material-symbols-outlined text-[20px]">{busy ? "hourglass_top" : "save"}</span>
              {busy ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* =========================================
   Drawer: Detalle / Editar (PUT con IDs)
========================================= */
function EmployeeDetailSheet({ open, onClose, detail, setDetail, onSave, loading, error }) {
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) { setEditMode(false); setBusy(false); setErr(""); }
  }, [open]);

  const update = (k) => (e) => setDetail((d) => ({ ...d, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await onSave(detail);   // PUT con IDs
      setEditMode(false);
    } catch (ex) {
      setErr(ex.message || "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true" aria-label="Detalle de empleado" onClick={(e) => e.stopPropagation()}>
        <header className="h-14 px-5 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">{editMode ? "Editar empleado" : "Detalle del empleado"}</h2>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button className="p-2 rounded hover:bg-slate-100" onClick={() => setEditMode(true)} title="Editar">
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
              <form className="space-y-4" onSubmit={submit}>
                {err && <p className="text-sm text-red-600">{err}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LabeledInput label="Nombre" required icon="person" autoComplete="off" value={detail.nombre || ""} onChange={update("nombre")} />
                  <LabeledInput label="Correo" required icon="mail" type="email" autoComplete="off" value={detail.email || detail.correo || ""} onChange={update("email")} />
                  <LabeledInput label="Teléfono" icon="call" autoComplete="off" value={detail.telefono || ""} onChange={update("telefono")} />
                  <LabeledInput label="Fecha de ingreso" icon="event" type="date" autoComplete="off" value={detail.fechaIngreso || ""} onChange={update("fechaIngreso")} />

                  {/* IDs numéricos para PUT */}
                  <LabeledInput label="Área ID"     required icon="apartment"         type="number" min="1" step="1" value={detail.areaId ?? ""}    onChange={update("areaId")} />
                  <LabeledInput label="Puesto ID"   required icon="workspace_premium" type="number" min="1" step="1" value={detail.puestoId ?? ""}  onChange={update("puestoId")} />
                  <LabeledInput label="Turno ID"    required icon="schedule"          type="number" min="1" step="1" value={detail.turnoId ?? ""}   onChange={update("turnoId")} />
                  <LabeledInput label="Estatus ID"  required icon="verified_user"     type="number" min="1" step="1" value={detail.estatusId ?? ""} onChange={update("estatusId")} />
                </div>

                {/* Hints con nombres actuales */}
                <p className="text-xs text-slate-500">
                  {detail.area && <>Área actual: <b>{detail.area}</b> · </>}
                  {detail.puesto && <>Puesto actual: <b>{detail.puesto}</b> · </>}
                  {detail.turno && <>Turno actual: <b>{detail.turno}</b> · </>}
                  {detail.estatus && <>Estatus actual: <b>{detail.estatus}</b></>}
                </p>

                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={() => setEditMode(false)}>Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" disabled={busy}>{busy ? "Guardando..." : "Guardar"}</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Info label="ID" value={detail.id} />
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

/* =========================================
   Componente principal
========================================= */
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

  /* util: recargar lista */
  const reloadList = async () => {
    const res = await fetch(API.base, { headers: { ...acceptJSON, ...authHeaders() } });
    await okOrThrow(res);
    const json = await readJSONSafe(res);
    const mapped = (Array.isArray(json) ? json : []).map(mapRow);
    setData(mapped);
  };

  /* util: refrescar un registro (detalle) y sincronizar tabla */
  const refreshRow = async (id) => {
    const res = await fetch(API.detail(id), { headers: { ...acceptJSON, ...authHeaders() } });
    await okOrThrow(res);
    const it = await readJSONSafe(res);
    if (!it) return;
    const row = mapRow(it);
    setData((prev) => prev.map((x) => (x.id === row.id ? row : x)));
    setDetail({
      id: it.id,
      nombre: it.nombre ?? "",
      email: it.email ?? it.correo ?? "",
      telefono: it.telefono ?? "",
      fechaIngreso: it.fechaIngreso ?? "",
      area: row.dept,
      puesto: row.role,
      turno: row.shift,
      estatus: row.status,
      areaId: row.areaId, puestoId: row.puestoId, turnoId: row.turnoId, estatusId: row.estatusId,
    });
  };

  /* Cargar lista */
  useEffect(() => {
    let alive = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(API.base, {
          headers: { ...acceptJSON, ...authHeaders() },
          signal: ac.signal,
        });
        await okOrThrow(res);
        const json = await readJSONSafe(res);
        const mapped = (Array.isArray(json) ? json : []).map(mapRow);
        if (alive) setData(mapped);
      } catch {
        if (alive) setError("No se pudo cargar la lista de empleados.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; ac.abort(); };
  }, []);

  /* Al seleccionar fila: traer detalle {id}/detalle */
  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    const ac = new AbortController();

    // Prefill con datos de la fila para que se vea algo inmediato
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
        const res = await fetch(API.detail(selectedId), {
          headers: { ...acceptJSON, ...authHeaders() },
          signal: ac.signal,
        });
        await okOrThrow(res);
        const it = await readJSONSafe(res);
        if (!alive || !it) return;
        setDetail((prev) => ({
          ...prev,
          id: it.id,
          nombre: it.nombre ?? prev?.nombre ?? "",
          email: it.email ?? it.correo ?? prev?.email ?? "",
          telefono: it.telefono ?? "",
          fechaIngreso: it.fechaIngreso ?? "",
          area: it.area ?? it.areaNombre ?? prev?.area ?? "",
          puesto: it.puesto ?? it.puestoNombre ?? prev?.puesto ?? "",
          turno: it.turno ?? it.turnoNombre ?? prev?.turno ?? "",
          estatus: it.estatus ?? it.estatusNombre ?? prev?.estatus ?? "",
          areaId:    it.areaId    ?? prev?.areaId ?? "",
          puestoId:  it.puestoId  ?? prev?.puestoId ?? "",
          turnoId:   it.turnoId   ?? prev?.turnoId ?? "",
          estatusId: it.estatusId ?? prev?.estatusId ?? "",
        }));
      } catch {
        if (alive) setDetailError("No se pudo cargar el detalle.");
      } finally {
        if (alive) setDetailLoading(false);
      }
    })();

    return () => { alive = false; ac.abort(); };
  }, [selectedId, data]);

  /* PUT empleado (IDs) */
  const saveDetail = async (d) => {
    const toInt = (v, name) => {
      const n = Number(v);
      if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} inválido`);
      return n;
    };
    const payload = {
      nombre: d.nombre,
      email: d.email ?? d.correo,
      telefono: d.telefono,
      areaId:    toInt(d.areaId,    "Área ID"),
      puestoId:  toInt(d.puestoId,  "Puesto ID"),
      turnoId:   toInt(d.turnoId,   "Turno ID"),
      estatusId: toInt(d.estatusId, "Estatus ID"),
    };

    const res = await fetch(`${API.base}/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...acceptJSON, ...authHeaders() },
      body: JSON.stringify(payload),
    });
    await okOrThrow(res);
    const updated = await readJSONSafe(res);

    if (updated?.id) {
      // actualizar con lo que venga
      setData((prev) =>
        prev.map((x) =>
          x.id === String(updated.id)
            ? {
                ...x,
                ...mapRow(updated),
                areaId: payload.areaId, puestoId: payload.puestoId, turnoId: payload.turnoId, estatusId: payload.estatusId,
              }
            : x
        )
      );
      setDetail((prev) => ({
        ...prev,
        nombre: updated.nombre ?? prev?.nombre,
        email: updated.email ?? updated.correo ?? prev?.email,
        telefono: updated.telefono ?? prev?.telefono,
        area: updated.area ?? updated.areaNombre ?? prev?.area,
        puesto: updated.puesto ?? updated.puestoNombre ?? prev?.puesto,
        turno: updated.turno ?? updated.turnoNombre ?? prev?.turno,
        estatus: updated.estatus ?? updated.estatusNombre ?? prev?.estatus,
        areaId: payload.areaId, puestoId: payload.puestoId, turnoId: payload.turnoId, estatusId: payload.estatusId,
      }));
    } else {
      // sin cuerpo => refrescamos desde {id}/detalle
      await refreshRow(d.id);
    }
  };

  /* POST empleado (IDs + password + domicilio + contacto) */
  const handleCreateEmployee = async (ui) => {
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
      contacto:  { ...ui.contacto  },
    };

    const res = await fetch(API.base, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...acceptJSON, ...authHeaders() },
      body: JSON.stringify(payload),
    });
    await okOrThrow(res);
    const created = await readJSONSafe(res);

    if (created?.id) {
      setData((prev) => [ mapRow(created), ...prev ]);
    } else {
      // si no regresan el objeto, recargo lista
      await reloadList();
    }
    setPage(1);
    setToast({ open: true, text: `Empleado "${created?.nombre ?? ui.nombre}" creado`, kind: "success" });
    return created ?? true;
  };

  /* Eliminar — abre diálogo y luego elimina */
  const askDelete = (id) => {
    const row = data.find((x) => x.id === id);
    setConfirmDel({ open: true, id, name: row?.name || "" });
  };

  const doDelete = async () => {
    const { id, name } = confirmDel;
    setConfirmDel((c) => ({ ...c, open: false })); // cerrar modal ya
    const res = await fetch(`${API.base}/${id}`, { method: "DELETE", headers: { ...acceptJSON, ...authHeaders() } });
    await okOrThrow(res);
    setData((prev) => prev.filter((x) => x.id !== id));
    if (selectedId === id) { setSelectedId(null); setDetailOpen(false); }
    setToast({ open: true, text: `Empleado "${name}" eliminado`, kind: "success" });
  };

  /* filtros + búsqueda */
  const [fDept, setFDept] = useState("Todos");
  const [fRole, setFRole] = useState("Todos");
  const [fShift, setFShift] = useState("Todos");
  const [fStatus, setFStatus] = useState("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data;
    if (q) list = list.filter((x) => [x.name, x.email, x.role, x.dept, x.status].some((v) => String(v).toLowerCase().includes(q)));
    if (fDept !== "Todos") list = list.filter((x) => x.dept === fDept);
    if (fRole !== "Todos") list = list.filter((x) => x.role === fRole);
    if (fShift !== "Todos") list = list.filter((x) => x.shift === fShift);
    if (fStatus !== "Todos") list = list.filter((x) => x.status === fStatus);
    return list;
  }, [data, query, fDept, fRole, fShift, fStatus]);

  const deptOpts  = useMemo(() => ["Todos", ...Array.from(new Set(data.map(d => d.dept).filter(Boolean)))], [data]);
  const roleOpts  = useMemo(() => ["Todos", ...Array.from(new Set(data.map(d => d.role).filter(Boolean)))], [data]);
  const shiftOpts = useMemo(() => ["Todos", ...Array.from(new Set(data.map(d => d.shift).filter(Boolean)))], [data]);

  /* paginación */
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const slice = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  /* CSV */
  const handleExport = () => {
    const headers = ["Nombre", "Correo", "Cargo", "Departamento", "Turno", "Estado"];
    const rows = filtered.map((r) => [r.name, r.email, r.role, r.dept, r.shift || "", r.status]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="empleados.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const goPrev=()=>setPage(p=>Math.max(1,p-1));
  const goNext=()=>setPage(p=>Math.min(totalPages,p+1));
  const jump=(n)=>setPage(n);

  /* auto-hide toast */
  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, open: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.open]);

  return (
    <div className="h-dvh overflow-y-auto bg-[#F5F7FB] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Empleados</h1>
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
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input id="search" type="text" placeholder="Buscar nombre, correo, cargo..." value={query} onChange={(e)=>{ setPage(1); setQuery(e.target.value); }} className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {/* Filtros compactos */}
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fDept} onChange={(e)=>{setPage(1); setFDept(e.target.value);}}>
            {deptOpts.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fRole} onChange={(e)=>{setPage(1); setFRole(e.target.value);}}>
            {roleOpts.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fShift} onChange={(e)=>{setPage(1); setFShift(e.target.value);}}>
            {shiftOpts.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={fStatus} onChange={(e)=>{setPage(1); setFStatus(e.target.value);}}>
            {["Todos","Activo","Inactivo"].map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                      <input type="radio" name="row" className="h-4 w-4 accent-blue-600" checked={row.id === selectedId} onChange={() => setSelectedId(row.id)} onClick={(e)=>e.stopPropagation()} />
                    </td>
                    <td className="py-4 px-4">{row.name}</td>
                    <td className="py-4 px-4">{row.email}</td>
                    <td className="py-4 px-4">{row.role}</td>
                    <td className="py-4 px-4">{row.dept}</td>
                    <td className="py-4 px-4">{row.shift || "—"}</td>
                    <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <button className="hover:text-blue-600" title="Editar" onClick={(e) => { e.stopPropagation(); setSelectedId(row.id); }}>
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="hover:text-red-600" title="Eliminar" onClick={(e) => { e.stopPropagation(); askDelete(row.id); }}>
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
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-slate-500">Mostrando {start + (slice.length ? 1 : 0)}-{start + slice.length} de {total} resultados</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50" onClick={goPrev} disabled={currentPage===1}>Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`px-3 py-1 rounded-lg text-sm ${n===currentPage ? "bg-blue-600 text-white shadow-sm" : "border border-slate-300 bg-white hover:bg-slate-50"}`} onClick={()=>jump(n)}>{n}</button>
              ))}
              <button className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-50" onClick={goNext} disabled={currentPage===totalPages}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets y Modales */}
      <AddEmployeeSheet open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateEmployee} />
      <EmployeeDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} detail={detail} setDetail={setDetail} onSave={saveDetail} loading={detailLoading} error={detailError} />
      <ConfirmDialog
        open={confirmDel.open}
        title="Eliminar empleado"
        message={<>¿Seguro que deseas eliminar a <b>{confirmDel.name || "este empleado"}</b>? Esta acción no se puede deshacer.</>}
        confirmText="Eliminar"
        tone="danger"
        onConfirm={doDelete}
        onCancel={() => setConfirmDel({ open: false, id: null, name: "" })}
      />
      <Toast open={toast.open} text={toast.text} kind={toast.kind} onClose={() => setToast((s)=>({ ...s, open:false }))} />
    </div>
  );
}
