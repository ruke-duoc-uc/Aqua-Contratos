/**
 * Cliente HTTP del Frontend para la API REST de Aqua-Contratos
 * Conecta con el backend Express y la base de datos persistente SQLite.
 */

const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:4000/api";

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

    // ==================== AUTENTICACIÓN Y USUARIOS ====================
    async getUsuarios() {
        const res = await request("/auth/usuarios");
        return res.datos;
    },

    async login({ email, password }) {
        const res = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        return res.datos;
    },

    async registroCandidato(datos) {
        const res = await request("/auth/registro-candidato", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    // ==================== PUESTOS DE TRABAJO (Ofertas Laborales) ====================
    async getPuestos({ busqueda, planta, familiaCargo, estado } = {}) {
        const params = new URLSearchParams();
        if (busqueda) params.append("busqueda", busqueda);
        if (planta && planta !== "todas") params.append("planta", planta);
        if (familiaCargo && familiaCargo !== "todas") params.append("familiaCargo", familiaCargo);
        if (estado && estado !== "todos") params.append("estado", estado);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await request(`/puestos${query}`);
        return res.datos;
    },

    async getPuestoPorId(id) {
        const res = await request(`/puestos/${id}`);
        return res.datos;
    },

    async crearPuesto(datos) {
        const res = await request("/puestos", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async actualizarPuesto(id, datos) {
        const res = await request(`/puestos/${id}`, {
            method: "PUT",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async cambiarEstadoPuesto(id, nuevoEstado) {
        const res = await request(`/puestos/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        return res.datos;
    },

    async eliminarPuesto(id) {
        return request(`/puestos/${id}`, {
            method: "DELETE",
        });
    },

    // ==================== POSTULACIONES ====================
    async getPostulaciones({ candidatoId, puestoTrabajoId, estado, evaluador } = {}) {
        const params = new URLSearchParams();
        if (candidatoId) params.append("candidatoId", candidatoId);
        if (puestoTrabajoId) params.append("puestoTrabajoId", puestoTrabajoId);
        if (estado && estado !== "todos") params.append("estado", estado);
        if (evaluador && evaluador !== "todos") params.append("evaluador", evaluador);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await request(`/postulaciones${query}`);
        return res.datos;
    },

    async getPostulacionPorId(id) {
        const res = await request(`/postulaciones/${id}`);
        return res.datos;
    },

    async crearPostulacion(datos) {
        const res = await request("/postulaciones", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async cambiarEstadoPostulacion(id, nuevoEstado) {
        const res = await request(`/postulaciones/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        return res.datos;
    },

    async agendarEntrevistaPostulacion(id, { fechaEntrevista, evaluadorAsignado, observaciones }) {
        const res = await request(`/postulaciones/${id}/agendar`, {
            method: "PATCH",
            body: JSON.stringify({ fechaEntrevista, evaluadorAsignado, observaciones }),
        });
        return res.datos;
    },

    async responderCandidatoPostulacion(id, { respuesta, sugerenciaFecha }) {
        const res = await request(`/postulaciones/${id}/respuesta-candidato`, {
            method: "PATCH",
            body: JSON.stringify({ respuesta, sugerenciaFecha }),
        });
        return res.datos;
    },

    async guardarEvaluacionPostulacion(id, evaluacionData) {
        const res = await request(`/postulaciones/${id}/evaluacion`, {
            method: "PATCH",
            body: JSON.stringify(evaluacionData),
        });
        return res.datos;
    },

    async decidirContratacionPostulacion(id, decisionFinal) {
        const res = await request(`/postulaciones/${id}/decision-final`, {
            method: "PATCH",
            body: JSON.stringify({ decisionFinal }),
        });
        return res.datos;
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

    // ==================== SOLICITUDES (Legacy) ====================
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

    // ==================== SOLICITUDES DE INFORME ====================
    async getSolicitudesInforme({ busqueda, estado, candidatoId, puestoTrabajoId, urgencia, tipo } = {}) {
        const params = new URLSearchParams();
        if (busqueda) params.append("busqueda", busqueda);
        if (estado && estado !== "todos") params.append("estado", estado);
        if (candidatoId) params.append("candidatoId", candidatoId);
        if (puestoTrabajoId) params.append("puestoTrabajoId", puestoTrabajoId);
        if (tipo && tipo !== "todos") params.append("tipo", tipo);
        if (urgencia && urgencia !== "todas") params.append("urgencia", urgencia);

        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await request(`/solicitudes-informe${query}`);
        return res.datos;
    },

    async getSolicitudInformePorId(id) {
        const res = await request(`/solicitudes-informe/${id}`);
        return res.datos;
    },

    async crearSolicitudInforme(datos) {
        const res = await request("/solicitudes-informe", {
            method: "POST",
            body: JSON.stringify(datos),
        });
        return res.datos;
    },

    async agregarPreguntaInforme(id, { texto, creadaPor }) {
        const res = await request(`/solicitudes-informe/${id}/preguntas`, {
            method: "POST",
            body: JSON.stringify({ texto, creadaPor }),
        });
        return res.datos;
    },

    async agregarRespuestaInforme(id, preguntaId, { autor, rol, texto }) {
        const res = await request(`/solicitudes-informe/${id}/preguntas/${preguntaId}/respuestas`, {
            method: "POST",
            body: JSON.stringify({ autor, rol, texto }),
        });
        return res.datos;
    },

    async cambiarEstadoSolicitudInforme(id, nuevoEstado) {
        const res = await request(`/solicitudes-informe/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        return res.datos;
    },
};
