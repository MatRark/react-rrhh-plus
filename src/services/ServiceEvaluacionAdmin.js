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
    // GET: Catálogo de indicadores
    getIndicadoresCatalogo: async () => {
        const response = await axios.get(`${API_BASE}/IndicadoresCatalogo`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    // GET: Lista de plantillas con filtros
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

    // GET: Plantilla por ID
    getPlantillaById: async (id) => {
        const response = await axios.get(`${API_BASE}/Plantillas/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    // POST: Crear plantilla
    crearPlantilla: async (data) => {
        const response = await axios.post(`${API_BASE}/Plantillas`, data, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },
    
    // GET: Áreas de empleados
    getAreas: async () => {
        const res = await axios.get(`https://rhplus.somee.com/api/Employees/areas`, {
            headers: getAuthHeaders(),
        });
        return res.data;
    },

    // PUT: Actualizar vigencia
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
