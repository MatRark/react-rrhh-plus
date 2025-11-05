const API_BASE_URL = "https://rhplus.somee.com/api/Contracts";

/* ============================
   HELPERS
============================ */
function authHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}
async function parseOrThrow(response, fallbackMsg) {
  if (response.ok) {
    // 204 No Content (DELETE)
    if (response.status === 204) return true;
    return await response.json();
  }
  let message = fallbackMsg || "Error en la solicitud";
  try {
    const err = await response.json();
    message = err?.message || message;
  } catch {
    message = `${fallbackMsg} (HTTP ${response.status})`;
  }
  throw new Error(message);
}

/* ============================
   LISTAR / FILTRAR
============================ */
export async function getAllContracts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.tipoContratoId) params.append("tipoContratoId", filters.tipoContratoId);
    if (filters.estatusContratoId) params.append("estatusContratoId", filters.estatusContratoId);
    if (filters.fechaInicioDesde) params.append("fechaInicioDesde", filters.fechaInicioDesde);
    if (filters.fechaFinHasta) params.append("fechaFinHasta", filters.fechaFinHasta);

    const url = params.toString()
      ? `${API_BASE_URL}?${params.toString()}`
      : API_BASE_URL;

    const resp = await fetch(url, { method: "GET", headers: authHeaders() });
    return await parseOrThrow(resp, "Error al obtener la lista de contratos");
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   DETALLE
============================ */
export async function getContractById(id) {
  try {
    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });
    return await parseOrThrow(resp, "Error al obtener el detalle del contrato");
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   CREAR (mantiene tu lógica)
============================ */
export async function createContract(contractData) {
  try {
    const token = localStorage.getItem("token");

    console.log("Enviando datos al servidor:", contractData);

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contractData),
    });

    console.log("Respuesta del servidor - Status:", response.status);

    if (!response.ok) {
      let errorMessage = "Error al crear contrato";

      try {
        const errorData = await response.json();
        console.log("Error detallado del servidor:", errorData);
        errorMessage = errorData.message || errorMessage;

        if (response.status === 400) {
          errorMessage = errorData.message || "Datos inválidos enviados al servidor";
        } else if (response.status === 500) {
          errorMessage = "Error interno del servidor. Por favor, contacta al administrador.";
        }
      } catch (parseError) {
        console.log("No se pudo parsear la respuesta de error:", parseError);
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Contrato creado exitosamente:", result);
    return result;

  } catch (error) {
    console.error("Error completo en createContract:", error);
    throw new Error(error.message || "Error de conexión con el servidor");
  }
}

/* ============================
   ACTUALIZAR
============================ */
export async function updateContract(id, updatedData) {
  try {
    console.log("📝 Actualizando contrato:", id, updatedData);

    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedData),
    });
    return await parseOrThrow(resp, "Error al actualizar contrato");
  } catch (error) {
    console.error("❌ Error en updateContract:", error);
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   ELIMINAR
============================ */
export async function deleteContract(id) {
  try {
    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    await parseOrThrow(resp, "Error al eliminar contrato");
    console.log("🗑️ Contrato eliminado:", id);
    return true;
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   RENOVAR
============================ */
export async function renewContract(id, renewalData) {
  try {
    console.log("🔁 Renovando contrato:", id, renewalData);

    const resp = await fetch(`${API_BASE_URL}/${id}/renewals`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(renewalData),
    });
    return await parseOrThrow(resp, "Error al renovar contrato");
  } catch (error) {
    console.error("❌ Error en renewContract:", error);
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   AUXILIARES
============================ */
export async function getAvailableEmployees() {
  try {
    const resp = await fetch(`${API_BASE_URL}/available-employees`, {
      method: "GET",
      headers: authHeaders(),
    });
    return await parseOrThrow(resp, "Error al obtener empleados disponibles");
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

export async function getContractTypes() {
  try {
    const resp = await fetch(`${API_BASE_URL}/types`, {
      method: "GET",
      headers: authHeaders(),
    });
    return await parseOrThrow(resp, "Error al obtener tipos de contrato");
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

export async function getMyContract() {
  try {
    const resp = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!resp.ok) {
      if (resp.status === 404) throw new Error("No tienes un contrato registrado");
      throw new Error("Error al obtener tu contrato");
    }
    return await resp.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}
