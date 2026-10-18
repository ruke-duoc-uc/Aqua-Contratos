/**
 * Controlador de Solicitudes de Informes de Candidatos
 * Permite a la Jefatura solicitar información adicional a evaluadores y analistas,
 * formular preguntas múltiples, repreguntar y responder manteniendo la trazabilidad.
 */
import { dataStore } from "../data/dataStore.js";

export const informesController = {
    /**
     * GET /api/solicitudes-informe
     * Lista todas las solicitudes de informe con filtros opcionales.
     */
    listar(req, res) {
        try {
            const { busqueda, estado, candidatoId, urgencia } = req.query;
            const informes = dataStore.obtenerSolicitudesInforme({
                busqueda,
                estado,
                candidatoId,
                urgencia,
            });

            return res.status(200).json({
                ok: true,
                total: informes.length,
                datos: informes,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar las solicitudes de informe.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/solicitudes-informe/:id
     * Obtiene el detalle de la solicitud de informe junto con la ficha del candidato.
     */
    obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const informe = dataStore.obtenerSolicitudInformePorId(id);

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de informe con ID ${id}.`,
                });
            }

            const candidato = dataStore.obtenerCandidatoPorId(informe.candidatoId);

            return res.status(200).json({
                ok: true,
                datos: {
                    ...informe,
                    candidatoPerfil: candidato || null,
                },
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al consultar la solicitud de informe.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes-informe
     * Crea una nueva solicitud de informe emitida por Jefatura.
     */
    crear(req, res) {
        try {
            const {
                candidatoId,
                candidatoNombre,
                solicitante,
                urgencia,
                fechaLimite,
                destinatarios,
                preguntas,
            } = req.body;

            if (!candidatoId) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe seleccionar un candidato existente para emitir la solicitud de informe.",
                });
            }

            const candidato = dataStore.obtenerCandidatoPorId(candidatoId);
            if (!candidato) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el candidato con ID ${candidatoId}.`,
                });
            }

            const nuevoInforme = dataStore.crearSolicitudInforme({
                candidatoId,
                candidatoNombre: candidatoNombre || candidato.nombre,
                solicitante: solicitante || "Jefe de Área",
                urgencia: urgencia || "Media",
                fechaLimite: fechaLimite || null,
                destinatarios: destinatarios || ["analista", "evaluador"],
                preguntas: Array.isArray(preguntas) && preguntas.length > 0 ? preguntas : ["Información general requerida"],
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Solicitud de informe creada exitosamente.",
                datos: nuevoInforme,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al emitir la solicitud de informe.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes-informe/:id/preguntas
     * Agrega una nueva pregunta al hilo de la solicitud (repregunta de Jefatura).
     */
    agregarPregunta(req, res) {
        try {
            const { id } = req.params;
            const { texto, creadaPor } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El texto de la pregunta no puede estar vacío.",
                });
            }

            const actualizado = dataStore.agregarPreguntaInforme(id, {
                texto,
                creadaPor: creadaPor || "Jefe de Área",
            });

            if (!actualizado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de informe con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Pregunta añadida exitosamente a la solicitud de informe.",
                datos: actualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al agregar la pregunta.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes-informe/:id/preguntas/:preguntaId/respuestas
     * Registra una respuesta de un analista o evaluador a una pregunta específica.
     */
    agregarRespuesta(req, res) {
        try {
            const { id, preguntaId } = req.params;
            const { autor, rol, texto } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El comentario de respuesta no puede estar vacío.",
                });
            }

            const actualizado = dataStore.agregarRespuestaInforme(id, preguntaId, {
                autor,
                rol: rol || "evaluador",
                texto,
            });

            if (!actualizado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud o la pregunta indicada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Comentario registrado con éxito.",
                datos: actualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al guardar la respuesta.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/solicitudes-informe/:id/estado
     * Permite cerrar o reabrir la solicitud de informe.
     */
    cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado || !["Abierta", "Cerrada"].includes(estado)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El estado debe ser 'Abierta' o 'Cerrada'.",
                });
            }

            const actualizado = dataStore.actualizarEstadoSolicitudInforme(id, estado);
            if (!actualizado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de informe con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Solicitud de informe marcada como ${estado}.`,
                datos: actualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar el estado de la solicitud.",
                error: error.message,
            });
        }
    },
};
