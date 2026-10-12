/**
 * Capa de almacenamiento en memoria para el MVP
 * Centraliza las operaciones CRUD sobre candidatos y solicitudes,
 * permitiendo una transición limpia a bases de datos (MongoDB, PostgreSQL, etc.) en etapas posteriores.
 */
import { CANDIDATOS_SEED, CATALOGOS_SEED } from "./seedData.js";

// Copia mutable en memoria de los registros
let candidatosStore = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
let catalogosStore = JSON.parse(JSON.stringify(CATALOGOS_SEED));

export const dataStore = {
    // ==================== CANDIDATOS ====================
    obtenerCandidatos({ busqueda, planta } = {}) {
        return candidatosStore.filter((c) => {
            const coincideTexto =
                !busqueda ||
                c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.especialidad.toLowerCase().includes(busqueda.toLowerCase());

            const coincidePlanta =
                !planta ||
                planta === "todas" ||
                c.planta.toLowerCase() === planta.toLowerCase();

            return coincideTexto && coincidePlanta;
        });
    },

    obtenerCandidatoPorId(id) {
        return candidatosStore.find((c) => c.id === Number(id));
    },

    buscarCandidatoPorRut(rut) {
        if (!rut) return null;
        const rutLimpio = rut.replace(/[\.\-]/g, "").trim().toLowerCase();
        return candidatosStore.find((c) => {
            const rutActual = c.rut.replace(/[\.\-]/g, "").trim().toLowerCase();
            return rutActual === rutLimpio;
        });
    },

    crearCandidato(datos) {
        const nuevoId =
            candidatosStore.length > 0
                ? Math.max(...candidatosStore.map((c) => c.id)) + 1
                : 1;

        const nuevoCandidato = {
            id: nuevoId,
            nombre: datos.nombre.trim(),
            rut: datos.rut.trim(),
            especialidad: datos.especialidad.trim(),
            planta: datos.planta.trim(),
            cargo: datos.cargo?.trim() || "Postulante General",
            familiaCargo: datos.familiaCargo?.trim() || "Operaciones Productivas",
            fecha: datos.fecha ? new Date(datos.fecha).toISOString() : new Date().toISOString(),
            evaluador: datos.evaluador?.trim() || "Sin Asignar",
            estado: datos.estado?.trim() || "Pendiente",
            antecedentes: datos.antecedentes?.trim() || "",
            resultadoPsicologico: datos.resultadoPsicologico || "Pendiente",
        };

        candidatosStore.unshift(nuevoCandidato);
        return nuevoCandidato;
    },

    actualizarCandidato(id, datosActualizados) {
        const index = candidatosStore.findIndex((c) => c.id === Number(id));
        if (index === -1) return null;

        candidatosStore[index] = {
            ...candidatosStore[index],
            ...datosActualizados,
            id: Number(id), // Preserva el identificador original
        };

        return candidatosStore[index];
    },

    eliminarCandidato(id) {
        const index = candidatosStore.findIndex((c) => c.id === Number(id));
        if (index === -1) return false;
        candidatosStore.splice(index, 1);
        return true;
    },

    // ==================== SOLICITUDES ====================
    obtenerSolicitudes({ busqueda, estado, planta, evaluador } = {}) {
        return candidatosStore.filter((c) => {
            const termino = busqueda ? busqueda.toLowerCase().trim() : "";
            const coincideTexto =
                !termino ||
                c.nombre.toLowerCase().includes(termino) ||
                c.rut.toLowerCase().includes(termino) ||
                (c.cargo && c.cargo.toLowerCase().includes(termino)) ||
                c.especialidad.toLowerCase().includes(termino) ||
                c.evaluador.toLowerCase().includes(termino);

            const coincideEstado =
                !estado ||
                estado === "todos" ||
                c.estado.toLowerCase() === estado.toLowerCase();

            const coincidePlanta =
                !planta ||
                planta === "todas" ||
                c.planta.toLowerCase() === planta.toLowerCase();

            const coincideEvaluador =
                !evaluador ||
                evaluador === "todos" ||
                c.evaluador.toLowerCase() === evaluador.toLowerCase();

            return coincideTexto && coincideEstado && coincidePlanta && coincideEvaluador;
        });
    },

    obtenerSolicitudPorId(id) {
        return this.obtenerCandidatoPorId(id);
    },

    actualizarEstadoSolicitud(id, nuevoEstado) {
        const index = candidatosStore.findIndex((c) => c.id === Number(id));
        if (index === -1) return null;

        candidatosStore[index].estado = nuevoEstado;
        return candidatosStore[index];
    },

    actualizarEvaluacionSolicitud(id, { resultadoPsicologico, fechaEvaluacion, conclusiones, estado }) {
        const index = candidatosStore.findIndex((c) => c.id === Number(id));
        if (index === -1) return null;

        candidatosStore[index] = {
            ...candidatosStore[index],
            ...(resultadoPsicologico !== undefined && { resultadoPsicologico }),
            ...(fechaEvaluacion !== undefined && { fechaEvaluacion }),
            ...(conclusiones !== undefined && { conclusiones }),
            ...(estado !== undefined && { estado }),
        };

        return candidatosStore[index];
    },

    // ==================== DASHBOARD / KPIS ====================
    obtenerKPIs() {
        const total = candidatosStore.length;
        const pendientes = candidatosStore.filter(
            (c) => c.estado === "Pendiente" || c.estado === "En revisión"
        ).length;
        const enProceso = candidatosStore.filter(
            (c) => c.estado === "En proceso"
        ).length;
        const finalizadas = candidatosStore.filter(
            (c) => c.estado === "Finalizado" || c.estado === "Finalizada"
        ).length;

        return {
            totalCandidatos: total,
            pendientes,
            enProceso,
            finalizadas,
        };
    },

    // ==================== CATÁLOGOS BASE ====================
    obtenerCatalogos() {
        return catalogosStore;
    },

    // ==================== REINICIO PARA DEMOSTRACIÓN (Admin Académico) ====================
    restablecerDatosDemo() {
        candidatosStore = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
        catalogosStore = JSON.parse(JSON.stringify(CATALOGOS_SEED));
        return {
            mensaje: "Datos de demostración restablecidos con éxito.",
            totalRegistros: candidatosStore.length,
        };
    },
};
