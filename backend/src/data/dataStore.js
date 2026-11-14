/**
 * Capa de almacenamiento y reglas de datos para el MVP Aqua-Contratos
 * Conecta los controladores con la base de datos MongoDB (Mongoose) / Fallback.
 */
import { db } from "./db.js";

export const dataStore = {
    // ==================== CANDIDATOS ====================
    async obtenerCandidatos({ busqueda, planta } = {}) {
        const todos = await db.obtenerTodos();
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

    async obtenerCandidatoPorId(id) {
        return db.obtenerPorId(id);
    },

    async buscarCandidatoPorRut(rut) {
        return db.buscarPorRut(rut);
    },

    async crearCandidato(datos) {
        return db.insertarCandidato(datos);
    },

    async actualizarCandidato(id, datosActualizados) {
        return db.actualizarCandidato(id, datosActualizados);
    },

    async eliminarCandidato(id) {
        return db.eliminarCandidato(id);
    },

    // ==================== PUESTOS DE TRABAJO (Ofertas Laborales) ====================
    async obtenerPuestos(filtros) {
        return db.obtenerPuestos(filtros);
    },

    async obtenerPuestoPorId(id) {
        return db.obtenerPuestoPorId(id);
    },

    async crearPuesto(datos) {
        return db.insertarPuesto(datos);
    },

    async actualizarPuesto(id, datos) {
        return db.actualizarPuesto(id, datos);
    },

    async cambiarEstadoPuesto(id, nuevoEstado) {
        return db.actualizarPuesto(id, { estado: nuevoEstado });
    },

    async eliminarPuesto(id) {
        return db.eliminarPuesto(id);
    },

    // ==================== POSTULACIONES ====================
    async obtenerPostulaciones(filtros) {
        return db.obtenerPostulaciones(filtros);
    },

    async obtenerPostulacionPorId(id) {
        return db.obtenerPostulacionPorId(id);
    },

    async crearPostulacion(datos) {
        return db.insertarPostulacion(datos);
    },

    async actualizarPostulacion(id, datos) {
        return db.actualizarPostulacion(id, datos);
    },

    async actualizarEstadoPostulacion(id, nuevoEstado) {
        return db.actualizarPostulacion(id, { estado: nuevoEstado });
    },

    async agendarEntrevistaPostulacion(id, { fechaEntrevista, evaluadorAsignado, observaciones }) {
        const payload = {
            fechaEntrevista,
            estado: "Entrevista agendada",
            respuestaCandidato: "Pendiente",
        };
        if (evaluadorAsignado) payload.evaluadorAsignado = evaluadorAsignado;
        if (observaciones) payload.observaciones = observaciones;
        return db.actualizarPostulacion(id, payload);
    },

    async responderCandidatoPostulacion(id, { respuesta, sugerenciaFecha }) {
        const payload = {
            respuestaCandidato: respuesta, // "Aceptada" | "Sugerir cambio"
        };
        if (sugerenciaFecha) payload.sugerenciaFecha = sugerenciaFecha;
        if (respuesta === "Aceptada") {
            payload.estado = "En proceso";
        }
        return db.actualizarPostulacion(id, payload);
    },

    async evaluarPostulacion(id, { dictamenPsicologico, observaciones, conclusiones }) {
        return db.actualizarPostulacion(id, {
            dictamenPsicologico,
            observaciones,
            conclusiones,
            estado: "Finalizado",
        });
    },

    async decidirContratacionPostulacion(id, decisionFinal) {
        return db.actualizarPostulacion(id, {
            decisionFinal, // "Contratado" | "No contratado"
        });
    },

    // ==================== USUARIOS / AUTENTICACIÓN ====================
    async obtenerUsuarios() {
        return db.obtenerUsuarios();
    },

    async obtenerUsuarioPorId(id) {
        return db.obtenerUsuarioPorId(id);
    },

    async obtenerUsuarioPorEmail(email) {
        return db.obtenerUsuarioPorEmail(email);
    },

    async registrarUsuario(datos) {
        return db.insertarUsuario(datos);
    },

    async loginUsuario({ email, rut, identificador, password }) {
        return db.autenticarUsuario({ email, rut, identificador, password });
    },

    // ==================== SOLICITUDES (Compatibilidad Legacy) ====================
    async obtenerSolicitudes({ busqueda, estado, planta, evaluador } = {}) {
        const todos = await db.obtenerTodos();
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

    async obtenerSolicitudPorId(id) {
        return this.obtenerCandidatoPorId(id);
    },

    async actualizarEstadoSolicitud(id, nuevoEstado) {
        return db.actualizarCandidato(id, { estado: nuevoEstado });
    },

    async actualizarEvaluacionSolicitud(id, { resultadoPsicologico, fechaEvaluacion, conclusiones, estado }) {
        const payload = {};
        if (resultadoPsicologico !== undefined) payload.resultadoPsicologico = resultadoPsicologico;
        if (fechaEvaluacion !== undefined) payload.fechaEvaluacion = fechaEvaluacion;
        if (conclusiones !== undefined) payload.conclusiones = conclusiones;
        if (estado !== undefined) payload.estado = estado;

        return db.actualizarCandidato(id, payload);
    },

    // ==================== DASHBOARD / KPIS ====================
    async obtenerKPIs() {
        const [todos, puestos, postulaciones] = await Promise.all([
            db.obtenerTodos(),
            db.obtenerPuestos(),
            db.obtenerPostulaciones(),
        ]);

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
    async obtenerSolicitudesInforme(filtros) {
        return db.obtenerSolicitudesInforme(filtros);
    },

    async obtenerSolicitudInformePorId(id) {
        return db.obtenerSolicitudInformePorId(id);
    },

    async crearSolicitudInforme(datos) {
        return db.insertarSolicitudInforme(datos);
    },

    async agregarPreguntaInforme(id, datosPregunta) {
        return db.agregarPreguntaInforme(id, datosPregunta);
    },

    async agregarRespuestaInforme(id, preguntaId, datosRespuesta) {
        return db.agregarRespuestaInforme(id, preguntaId, datosRespuesta);
    },

    async actualizarEstadoSolicitudInforme(id, estado) {
        return db.actualizarEstadoSolicitudInforme(id, estado);
    },

    // ==================== REINICIO PARA DEMOSTRACIÓN (Admin Académico) ====================
    async restablecerDatosDemo() {
        const resultado = await db.restablecerDemo();
        return {
            mensaje: "Base de datos persistente restablecida con los datos iniciales de demostración.",
            totales: resultado,
            motorBD: db.isUsingMongo() ? `MongoDB (${db.getMongoUri()})` : "Archivo JSON (Fallback)",
        };
    },
};
