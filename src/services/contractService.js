const API_BASE_URL = "https://rhplus.somee.com/api/Contracts";

/* ============================
   HELPERS
============================ */
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

async function parseOrThrow(response, fallbackMsg) {
  if (response.ok) {
    if (response.status === 204) return true; // DELETE sin contenido
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
   UTILIDADES DE FORMATO
============================ */
function limpiarFechasYEstado(contract) {
  if (!contract) return contract;
  const hoy = new Date();

  // Limpia fechas inválidas tipo 0001-01-01 o 1/1/1
  if (contract.fechaInicio?.startsWith("0001")) contract.fechaInicio = null;
  if (contract.fechaFin?.startsWith("0001") || contract.fechaFin === "1/1/1")
    contract.fechaFin = null;

  // Lógica de estado según fecha y tipo
  if (
    contract.tipoContrato === "Determinado" &&
    contract.fechaFin &&
    new Date(contract.fechaFin) < hoy
  ) {
    contract.estatusContrato = "Vencido";
  } else {
    contract.estatusContrato = "Vigente";
  }

  return contract;
}

function aplicarLimpiezaLista(lista) {
  if (!Array.isArray(lista)) return lista;
  return lista.map(limpiarFechasYEstado);
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
    const data = await parseOrThrow(resp, "Error al obtener la lista de contratos");
    return aplicarLimpiezaLista(data);
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
    const data = await parseOrThrow(resp, "Error al obtener el detalle del contrato");
    return limpiarFechasYEstado(data);
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

/* ============================
   CREAR
============================ */
export async function createContract(contractData) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      let errorMessage = "Error al crear contrato";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        if (response.status === 400) {
          errorMessage = "Datos inválidos enviados al servidor";
        } else if (response.status === 500) {
          errorMessage = "Error interno del servidor.";
        }
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return limpiarFechasYEstado(result);
  } catch (error) {
    throw new Error(error.message || "Error de conexión con el servidor");
  }
}

/* ============================
   ACTUALIZAR
============================ */
export async function updateContract(id, updatedData) {
  try {
    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedData),
    });
    const data = await parseOrThrow(resp, "Error al actualizar contrato");
    return limpiarFechasYEstado(data);
  } catch (error) {
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
    // Evita null que rompe backend
    if (!renewalData.nuevaFechaFin)
      renewalData.nuevaFechaFin = renewalData.fechaRenovacion;

    const resp = await fetch(`${API_BASE_URL}/${id}/renewals`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(renewalData),
    });
    const data = await parseOrThrow(resp, "Error al renovar contrato");
    return limpiarFechasYEstado(data);
  } catch (error) {
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
    const data = await resp.json();
    return limpiarFechasYEstado(data);
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}
