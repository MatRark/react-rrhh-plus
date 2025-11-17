const API_BASE = "https://rhplus.somee.com/api/reclutamiento/vacantes";

const getToken = () => localStorage.getItem("token") || "";

// LISTAR
export async function getVacantes(filters = {}) {
  const params = new URLSearchParams(filters);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al obtener vacantes");
  }

  return res.json();
}

// CREAR
export async function createVacante(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al crear vacante");
  }

  return res.json();
}

// DETALLE
export async function getVacanteById(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al obtener la vacante");
  }

  return res.json();
}

// ACTUALIZAR
export async function updateVacante(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
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
    throw new Error(err?.message || "Error al actualizar vacante");
  }

  return res.json();
}