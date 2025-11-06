// services/attendanceService.js
const API_BASE_URL = "https://rhplus.somee.com/api/Asistencias";

// Obtener todas las asistencias con filtros (Admin/Gestor)
export async function getAllAttendances(filters = {}) {
  try {
    const token = localStorage.getItem("token");
    
    // Construir query params - solo agregar los que tienen valor
    const params = new URLSearchParams();
    
    // IMPORTANTE: Asegurarnos de enviar las fechas en formato correcto
    if (filters.fechaDesde) {
      params.append("fechaDesde", filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      params.append("fechaHasta", filters.fechaHasta);
    }
    if (filters.turnoId) {
      params.append("turnoId", filters.turnoId);
    }
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    
    console.log("URL de solicitud:", url); // Para debugging
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las asistencias");
    }

    const data = await response.json();
    console.log("Datos recibidos:", data); // Para debugging
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// Registrar entrada o salida (Empleado)
export async function registerAttendance(tipoRegistro) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tipoRegistro }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al registrar asistencia");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// Actualizar asistencia (Admin/Gestor)
export async function updateAttendance(asistenciaId, data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/${asistenciaId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar asistencia");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// Obtener reporte mensual (Admin/Gestor)
export async function getAttendanceReport(fechaInicio, fechaFin) {
  try {
    const token = localStorage.getItem("token");
    
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fechaInicio", fechaInicio);
    if (fechaFin) params.append("fechaFin", fechaFin);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/reporte-mensual${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el reporte");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}