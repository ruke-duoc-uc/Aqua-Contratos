/**
 * Capa de almacenamiento y reglas de datos para el MVP Aqua-Contratos
 * Conecta los controladores con la base de datos persistente (SQLite/JSON).
 */
import { db } from "./db.js";

export const dataStore = {
    // ==================== CANDIDATOS ====================
    obtenerCandidatos({ busqueda, planta } = {}) {
        const todos = db.obtenerTodos();
        return todos.filter((c) => {
            const termino = busqueda ? busqueda.toLowerCase().trim() : "";
            const coincideTexto =
                !termino ||
                c.nombre.toLowerCase().includes(termino) ||
                c.rut.toLowerCase().includes(termino) ||
                (c.email && c.email.toLowerCase().includes(termino)) ||
                (c.especialidad && c.especialidad.toLowerCase().includes(termino));

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

    // ==================== PUESTOS DE TRABAJO (Ofertas Laborales) ====================
    obtenerPuestos(filtros) {
        return db.obtenerPuestos(filtros);
    },

    obtenerPuestoPorId(id) {
        return db.obtenerPuestoPorId(id);
    },

    crearPuesto(datos) {
        return db.insertarPuesto(datos);
    },

    actualizarPuesto(id, datos) {
        return db.actualizarPuesto(id, datos);
    },

    cambiarEstadoPuesto(id, nuevoEstado) {
        return db.actualizarPuesto(id, { estado: nuevoEstado });
    },

    eliminarPuesto(id) {
        return db.eliminarPuesto(id);
    },

    // ==================== POSTULACIONES ====================
    obtenerPostulaciones(filtros) {
        return db.obtenerPostulaciones(filtros);
    },

    obtenerPostulacionPorId(id) {
        return db.obtenerPostulacionPorId(id);
    },

    crearPostulacion(datos) {
        return db.insertarPostulacion(datos);
    },

    actualizarPostulacion(id, datos) {
        return db.actualizarPostulacion(id, datos);
    },

    actualizarEstadoPostulacion(id, nuevoEstado) {
        return db.actualizarPostulacion(id, { estado: nuevoEstado });
    },

    agendarEntrevistaPostulacion(id, { fechaEntrevista, evaluadorAsignado, observaciones }) {
        const payload = {
            fechaEntrevista,
            estado: "Entrevista agendada",
            respuestaCandidato: "Pendiente",
        };
        if (evaluadorAsignado) payload.evaluadorAsignado = evaluadorAsignado;
        if (observaciones) payload.observaciones = observaciones;
        return db.actualizarPostulacion(id, payload);
    },

    responderCandidatoPostulacion(id, { respuesta, sugerenciaFecha }) {
        const payload = {
            respuestaCandidato: respuesta, // "Aceptada" | "Sugerir cambio"
        };
        if (sugerenciaFecha) payload.sugerenciaFecha = sugerenciaFecha;
        if (respuesta === "Aceptada") {
            payload.estado = "En proceso";
        }
        return db.actualizarPostulacion(id, payload);
    },

    evaluarPostulacion(id, { dictamenPsicologico, observaciones, conclusiones }) {
        return db.actualizarPostulacion(id, {
            dictamenPsicologico,
            observaciones,
            conclusiones,
            estado: "Finalizado",
        });
    },

    decidirContratacionPostulacion(id, decisionFinal) {
        return db.actualizarPostulacion(id, {
            decisionFinal, // "Contratado" | "No contratado"
        });
    },

    // ==================== USUARIOS / AUTENTICACIÓN ====================
    obtenerUsuarios() {
        return db.obtenerUsuarios();
    },

    obtenerUsuarioPorId(id) {
        return db.obtenerUsuarioPorId(id);
    },

    obtenerUsuarioPorEmail(email) {
        return db.obtenerUsuarioPorEmail(email);
    },

    registrarUsuario(datos) {
        return db.insertarUsuario(datos);
    },

    loginUsuario({ email, password }) {
        return db.autenticarUsuario({ email, password });
    },

    // ==================== SOLICITUDES (Compatibilidad Legacy) ====================
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

        // Métricas extendidas de puestos y postulaciones
        const puestos = db.obtenerPuestos();
        const postulaciones = db.obtenerPostulaciones();

        return {
            totalCandidatos: total,
            pendientes,
            enProceso,
            finalizadas,
            totalPuestosAbiertos: puestos.filter((p) => p.estado === "Abierto").length,
            totalPostulaciones: postulaciones.length,
            postulacionesEnProceso: postulaciones.filter((p) => p.estado === "En proceso" || p.estado === "Entrevista agendada").length,
            contratados: postulaciones.filter((p) => p.decisionFinal === "Contratado").length,
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
            totales: resultado,
            motorBD: db.isUsingSQLite() ? "SQLite (archivo persistente)" : "Archivo JSON",
        };
    },
};
