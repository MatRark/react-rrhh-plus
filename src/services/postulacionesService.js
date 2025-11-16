const API_BASE = "https://rhplus.somee.com/api/reclutamiento/vacantes";

const getToken = () => localStorage.getItem("token") || "";

// LISTAR POSTULACIONES (con filtros y paginación)
export async function getPostulaciones(filters = {}) {
  const params = new URLSearchParams();
  
  // Añadir filtros si existen
  if (filters.vacanteNombre) params.append("vacanteNombre", filters.vacanteNombre);
  if (filters.estatus) params.append("estatus", filters.estatus);
  if (filters.page) params.append("page", filters.page);
  if (filters.pageSize) params.append("pageSize", filters.pageSize);

  const res = await fetch(`${API_BASE}/postulaciones?${params.toString()}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al obtener postulaciones");
  }

  return res.json();
}

// CREAR POSTULACIÓN (con archivo CV)
export async function createPostulacion(data) {
  const formData = new FormData();
  
  formData.append("vacanteId", data.vacanteId);
  formData.append("nombreContacto", data.nombreContacto);
  
  if (data.emailContacto) {
    formData.append("emailContacto", data.emailContacto);
  }
  
  if (data.telefonoContacto) {
    formData.append("telefonoContacto", data.telefonoContacto);
  }
  
  if (data.cvFile) {
    formData.append("cvFile", data.cvFile);
  }
  
  if (data.observacion) {
    formData.append("observacion", data.observacion);
  }

  const res = await fetch(`${API_BASE}/postulaciones`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al crear postulación");
  }

  return res.json();
}

// DETALLE DE POSTULACIÓN
export async function getPostulacionById(id) {
  const res = await fetch(`${API_BASE}/postulaciones/${id}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al obtener la postulación");
  }

  return res.json();
}

// ACTUALIZAR ESTATUS DE POSTULACIÓN
export async function updatePostulacionEstatus(id, data) {
  const res = await fetch(`${API_BASE}/postulaciones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al actualizar postulación");
  }

  return res.json();
}