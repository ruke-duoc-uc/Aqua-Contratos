/**
 * Cliente HTTP del Frontend para la API REST de Aqua-Contratos
 * Conecta con el backend Express y la base de datos persistente SQLite.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMsg = data.mensaje || `Error HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const api = {
    baseUrl: API_BASE_URL,

    /**
     * Comprueba si el backend está en línea
     */
    async checkHealth() {
        return request("");
    },

    // ==================== CANDIDATOS ====================
    async getCandidatos({ busqueda, planta } = {}) {
        const params = new URLSearchParams();
        if (busqueda) params.append("busqueda", busqueda);
        if (planta && planta !== "todas") params.append("planta", planta);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await request(`/candidatos${query}`);
        return res.datos;
    },

    async getCandidatoPorId(id) {
        const res = await request(`/candidatos/${id}`);
        return res.datos;
    },

    async crearCandidato(datos) {
        const res = await request("/candidatos", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async actualizarCandidato(id, datos) {
        const res = await request(`/candidatos/${id}`, {
            method: "PUT",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async eliminarCandidato(id) {
        return request(`/candidatos/${id}`, {
            method: "DELETE",
        });
    },

    // ==================== SOLICITUDES ====================
    async getSolicitudes({ busqueda, estado, planta, evaluador } = {}) {
        const params = new URLSearchParams();
        if (busqueda) params.append("busqueda", busqueda);
        if (estado && estado !== "todos") params.append("estado", estado);
        if (planta && planta !== "todas") params.append("planta", planta);
        if (evaluador && evaluador !== "todos") params.append("evaluador", evaluador);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await request(`/solicitudes${query}`);
        return res.datos;
    },

    async getSolicitudPorId(id) {
        const res = await request(`/solicitudes/${id}`);
        return res.datos;
    },

    async crearSolicitud(datos) {
        const res = await request("/solicitudes", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async cambiarEstadoSolicitud(id, nuevoEstado) {
        const res = await request(`/solicitudes/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        return res.datos;
    },

    async guardarEvaluacionSolicitud(id, evaluacionData) {
        const res = await request(`/solicitudes/${id}/evaluacion`, {
            method: "PATCH",
            body: JSON.stringify(evaluacionData),
        });
        return res.datos;
    },

    // ==================== DASHBOARD & CATÁLOGOS ====================
    async getKPIs() {
        const res = await request("/dashboard/kpis");
        return res.datos;
    },

    async getCatalogos() {
        const res = await request("/dashboard/catalogos");
        return res.datos;
    },

    async resetDemo() {
        const res = await request("/dashboard/reset-demo", {
            method: "POST",
        });
        return res;
    },
};
