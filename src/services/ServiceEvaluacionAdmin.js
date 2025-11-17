// src/services/ServiceEvaluacionAdmin.js
import axios from "axios";
import { getUserInfo } from "./authService";

const API_BASE = "https://rhplus.somee.com/api";

// Obtener token del usuario autenticado
const getAuthHeaders = () => {
  const user = getUserInfo();
  const token = user?.token || localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ServiceEvaluacionAdmin = {
  // Obtener catálogo de indicadores
  getIndicadoresCatalogo: async () => {
    const response = await axios.get(`${API_BASE}/IndicadoresCatalogo`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Obtener plantillas con filtros
  getPlantillas: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.vigente !== undefined)
      params.append("vigente", filtros.vigente);

    if (filtros.area_id)
      params.append("area_id", filtros.area_id);

    const response = await axios.get(
      `${API_BASE}/Plantillas?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Obtener detalle de plantilla
  getPlantillaById: async (id) => {
    const response = await axios.get(`${API_BASE}/Plantillas/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Crear o editar plantilla
  crearPlantilla: async (data) => {
    const response = await axios.post(`${API_BASE}/Plantillas`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // Obtener áreas desde RRHH
  getAreas: async () => {
    const res = await axios.get(`${API_BASE}/Employees/areas`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Cambiar vigencia
  actualizarVigencia: async (id, vigente) => {
    const response = await axios.put(
      `${API_BASE}/Plantillas/${id}/Vigencia`,
      { vigente },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};
