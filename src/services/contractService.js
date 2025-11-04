const API_BASE_URL = "https://rhplus.somee.com/api/Contracts";

export async function getAvailableEmployees() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/available-employees`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener empleados disponibles");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

export async function getContractTypes() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/types`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener tipos de contrato");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

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
        
        // Mensajes específicos basados en el status code
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

// Obtener mi propio contrato (para empleados)
export async function getMyContract() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("No tienes un contrato registrado");
      }
      throw new Error("Error al obtener tu contrato");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}

// Obtener todos los contratos (para admin/gestor)
export async function getAllContracts(filters = {}) {
  try {
    const token = localStorage.getItem("token");
    
    // Construir query params si hay filtros
    const params = new URLSearchParams();
    if (filters.tipoContratoId) params.append("tipoContratoId", filters.tipoContratoId);
    if (filters.estatusContratoId) params.append("estatusContratoId", filters.estatusContratoId);
    if (filters.fechaInicioDesde) params.append("fechaInicioDesde", filters.fechaInicioDesde);
    if (filters.fechaFinHasta) params.append("fechaFinHasta", filters.fechaFinHasta);
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener la lista de contratos");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error de conexión");
  }
}