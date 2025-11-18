// src/services/evaluacionesService.js

const BASE_URL = "https://rhplus.somee.com";

/**
 * Cabeceras con token siempre fresco desde localStorage
 */
function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

/* ======================================================
   PLANTILLAS VIGENTES
   GET /api/Plantillas?vigente=true[&area_id=...]
====================================================== */
export async function getPlantillasVigentes(areaId) {
  const params = new URLSearchParams();
  params.append("vigente", "true");
  if (areaId) params.append("area_id", areaId);

  const res = await fetch(`${BASE_URL}/api/Plantillas?${params.toString()}`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Error obteniendo plantillas vigentes");
  }

  return res.json();
}

/* ======================================================
   EMPLEADOS DISPONIBLES POR PLANTILLA
   GET /api/Evaluaciones/empleados-disponibles?plantilla_id=ID
====================================================== */
export async function getEmpleadosDisponibles(plantillaId) {
  const url = `${BASE_URL}/api/Evaluaciones/empleados-disponibles?plantilla_id=${plantillaId}`;

  const res = await fetch(url, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Error obteniendo empleados disponibles");
  }

  return res.json();
}

/* ======================================================
   LISTAR EVALUACIONES
   GET /api/Evaluaciones?area_id=&estatus=
====================================================== */
export async function getEvaluaciones(filters = {}) {
  const params = new URLSearchParams();

  if (filters.area_id) params.append("area_id", filters.area_id);
  if (filters.estatus) params.append("estatus", filters.estatus);

  const url = `${BASE_URL}/api/Evaluaciones?${params.toString()}`;

  const res = await fetch(url, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Error obteniendo evaluaciones");
  }

  return res.json();
}

/* ======================================================
   CREAR EVALUACIÓN
   POST /api/Evaluaciones
   Body: { empleadoId: number, plantillaId: number }
====================================================== */
export async function crearEvaluacion(payload) {
  const res = await fetch(`${BASE_URL}/api/Evaluaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}


/* ======================================================
   OBTENER DETALLE DE UNA EVALUACIÓN
   GET /api/Evaluaciones/{id}
====================================================== */
export async function getEvaluacionById(id) {
  const res = await fetch(`${BASE_URL}/api/Evaluaciones/${id}`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Error obteniendo detalle de la evaluación");
  }

  return res.json();
}

/* ======================================================
   ACTUALIZAR / CERRAR EVALUACIÓN
   PUT /api/Evaluaciones/{id}
====================================================== */
export async function actualizarEvaluacion(id, payload) {
  const res = await fetch(`${BASE_URL}/api/Evaluaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error actualizando evaluación");
  }

  return res.json();
}
