// services/evaluationService.js
const API_BASE_URL = "https://rhplus.somee.com/api/Evaluaciones";

const getToken = () => localStorage.getItem("token") || "";
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ========== EVALUACIONES (Empleado) ==========

// Obtener mis evaluaciones (empleado autenticado)
export async function getMyEvaluations(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.estatus) params.append("estatus", filters.estatus);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/me?${queryString}` : `${API_BASE_URL}/me`;

    console.log("URL de solicitud:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener tus evaluaciones");
    }

    const data = await response.json();
    console.log("Evaluaciones recibidas:", data);
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// Obtener detalle de una evaluación específica
export async function getEvaluationDetail(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el detalle de la evaluación");
    }

    const data = await response.json();
    console.log("Detalle de evaluación:", data);
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// ========== EVALUACIONES (Admin/Evaluador) ==========

// Obtener todas las evaluaciones con filtros
export async function getAllEvaluations(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.area_id) params.append("area_id", filters.area_id);
    if (filters.estatus) params.append("estatus", filters.estatus);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las evaluaciones");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}