/**
 * Capa de almacenamiento y reglas de datos para el MVP
 * Conecta los controladores con la base de datos persistente (SQLite).
 */
import { db } from "./db.js";

export const dataStore = {
    // ==================== CANDIDATOS ====================
    obtenerCandidatos({ busqueda, planta } = {}) {
        const todos = db.obtenerTodos();
        return todos.filter((c) => {
            const coincideTexto =
                !busqueda ||
                c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
                (c.especialidad && c.especialidad.toLowerCase().includes(busqueda.toLowerCase()));

            const coincidePlanta =
                !planta ||
                planta === "todas" ||
                (c.planta && c.planta.toLowerCase() === planta.toLowerCase());

            return coincideTexto && coincidePlanta;
        });
    },

    obtenerCandidatoPorId(id) {
        return db.obtenerPorId(id);
    },

    buscarCandidatoPorRut(rut) {
        return db.buscarPorRut(rut);
    },

    crearCandidato(datos) {
        return db.insertarCandidato(datos);
    },

    actualizarCandidato(id, datosActualizados) {
        return db.actualizarCandidato(id, datosActualizados);
    },

    eliminarCandidato(id) {
        return db.eliminarCandidato(id);
    },

    // ==================== SOLICITUDES ====================
    obtenerSolicitudes({ busqueda, estado, planta, evaluador } = {}) {
        const todos = db.obtenerTodos();
        return todos.filter((c) => {
            const termino = busqueda ? busqueda.toLowerCase().trim() : "";
            const coincideTexto =
                !termino ||
                c.nombre.toLowerCase().includes(termino) ||
                c.rut.toLowerCase().includes(termino) ||
                (c.cargo && c.cargo.toLowerCase().includes(termino)) ||
                (c.especialidad && c.especialidad.toLowerCase().includes(termino)) ||
                (c.evaluador && c.evaluador.toLowerCase().includes(termino));

            const coincideEstado =
                !estado ||
                estado === "todos" ||
                (c.estado && c.estado.toLowerCase() === estado.toLowerCase());

            const coincidePlanta =
                !planta ||
                planta === "todas" ||
                (c.planta && c.planta.toLowerCase() === planta.toLowerCase());

            const coincideEvaluador =
                !evaluador ||
                evaluador === "todos" ||
                (c.evaluador && c.evaluador.toLowerCase() === evaluador.toLowerCase());

            return coincideTexto && coincideEstado && coincidePlanta && coincideEvaluador;
        });
    },

    obtenerSolicitudPorId(id) {
        return this.obtenerCandidatoPorId(id);
    },

    actualizarEstadoSolicitud(id, nuevoEstado) {
        return db.actualizarCandidato(id, { estado: nuevoEstado });
    },

    actualizarEvaluacionSolicitud(id, { resultadoPsicologico, fechaEvaluacion, conclusiones, estado }) {
        const payload = {};
        if (resultadoPsicologico !== undefined) payload.resultadoPsicologico = resultadoPsicologico;
        if (fechaEvaluacion !== undefined) payload.fechaEvaluacion = fechaEvaluacion;
        if (conclusiones !== undefined) payload.conclusiones = conclusiones;
        if (estado !== undefined) payload.estado = estado;

        return db.actualizarCandidato(id, payload);
    },

    // ==================== DASHBOARD / KPIS ====================
    obtenerKPIs() {
        const todos = db.obtenerTodos();
        const total = todos.length;
        const pendientes = todos.filter(
            (c) => c.estado === "Pendiente" || c.estado === "En revisión"
        ).length;
        const enProceso = todos.filter((c) => c.estado === "En proceso").length;
        const finalizadas = todos.filter(
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
        return db.obtenerCatalogos();
    },

    // ==================== SOLICITUDES DE INFORME ====================
    obtenerSolicitudesInforme(filtros) {
        return db.obtenerSolicitudesInforme(filtros);
    },

    obtenerSolicitudInformePorId(id) {
        return db.obtenerSolicitudInformePorId(id);
    },

    crearSolicitudInforme(datos) {
        return db.insertarSolicitudInforme(datos);
    },

    agregarPreguntaInforme(id, datosPregunta) {
        return db.agregarPreguntaInforme(id, datosPregunta);
    },

    agregarRespuestaInforme(id, preguntaId, datosRespuesta) {
        return db.agregarRespuestaInforme(id, preguntaId, datosRespuesta);
    },

    actualizarEstadoSolicitudInforme(id, estado) {
        return db.actualizarEstadoSolicitudInforme(id, estado);
    },

    // ==================== REINICIO PARA DEMOSTRACIÓN (Admin Académico) ====================
    restablecerDatosDemo() {
        const resultado = db.restablecerDemo();
        return {
            mensaje: "Base de datos persistente restablecida con los datos iniciales de demostración.",
            totalRegistros: resultado.totalRegistros,
            motorBD: db.isUsingSQLite() ? "SQLite (archivo persistente)" : "Archivo JSON",
        };
    },
};
