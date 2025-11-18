// src/services/ServiceEvaluacionAdmin.js
import axios from "axios";
import { getUserInfo } from "./authService";

const API_BASE = "https://rhplus.somee.com/api";

const getAuthHeaders = () => {
    const user = getUserInfo();
    const token = user?.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ServiceEvaluacionAdmin = {
    getIndicadoresCatalogo: async () => {
        const r = await axios.get(`${API_BASE}/IndicadoresCatalogo`, {
            headers: getAuthHeaders(),
        });
        return r.data;
    },

    getAreas: async () => {
        const r = await axios.get(`${API_BASE}/Employees/areas`, {
            headers: getAuthHeaders(),
        });
        return r.data;
    },

    getPlantillas: async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.vigente !== undefined) params.append("vigente", filtros.vigente);
        if (filtros.area_id) params.append("area_id", filtros.area_id);

        const r = await axios.get(`${API_BASE}/Plantillas?${params}`, {
            headers: getAuthHeaders(),
        });
        return r.data;
    },

    getPlantillaById: async (id) => {
        const r = await axios.get(`${API_BASE}/Plantillas/${id}`, {
            headers: getAuthHeaders(),
        });
        return r.data;
    },

    crearPlantilla: async (data) => {
        const r = await axios.post(`${API_BASE}/Plantillas`, data, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
        });
        return r.data;
    },

    actualizarVigencia: async (id, vigente) => {
        const r = await axios.put(
            `${API_BASE}/Plantillas/${id}/Vigencia`,
            { vigente },
            {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
            }
        );
        return r.data;
    },
};
