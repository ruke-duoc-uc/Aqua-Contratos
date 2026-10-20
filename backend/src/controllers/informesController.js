/**
 * Controlador de Solicitudes de Informes (por Candidato o por Puesto de Trabajo)
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
            const { busqueda, estado, candidatoId, puestoTrabajoId, urgencia, tipo } = req.query;
            const informes = dataStore.obtenerSolicitudesInforme({
                busqueda,
                estado,
                candidatoId,
                puestoTrabajoId,
                urgencia,
                tipo,
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
     * Obtiene el detalle de la solicitud de informe junto con la ficha del candidato y del puesto.
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

            let candidato = null;
            if (informe.candidatoId) {
                candidato = dataStore.obtenerCandidatoPorId(informe.candidatoId);
            }

            let puesto = null;
            if (informe.puestoTrabajoId) {
                puesto = dataStore.obtenerPuestoPorId(informe.puestoTrabajoId);
            }

            return res.status(200).json({
                ok: true,
                datos: {
                    ...informe,
                    candidatoPerfil: candidato || null,
                    puestoPerfil: puesto || null,
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
     * Crea una nueva solicitud de informe emitida por Jefatura (por candidato o por puesto).
     */
    crear(req, res) {
        try {
            const {
                candidatoId,
                candidatoNombre,
                puestoTrabajoId,
                tipo,
                solicitante,
                urgencia,
                fechaLimite,
                destinatarios,
                preguntas,
            } = req.body;

            if (!candidatoId && !puestoTrabajoId) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe asociar la solicitud de informe a un candidato o a un puesto de trabajo.",
                });
            }

            let nombreFinal = candidatoNombre;
            if (candidatoId) {
                const candidato = dataStore.obtenerCandidatoPorId(candidatoId);
                if (!candidato) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: `No se encontró el candidato con ID ${candidatoId}.`,
                    });
                }
                nombreFinal = candidato.nombre;
            }

            if (puestoTrabajoId) {
                const puesto = dataStore.obtenerPuestoPorId(puestoTrabajoId);
                if (!puesto) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: `No se encontró el puesto de trabajo con ID ${puestoTrabajoId}.`,
                    });
                }
            }

            const preguntasLimpias = (preguntas || [])
                .map((p) => (typeof p === "string" ? p.trim() : p.texto?.trim()))
                .filter(Boolean);

            if (preguntasLimpias.length === 0) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar al menos una pregunta para generar la solicitud de informe.",
                });
            }

            const nuevaSolicitud = dataStore.crearSolicitudInforme({
                candidatoId: candidatoId ? Number(candidatoId) : null,
                candidatoNombre: nombreFinal || "Solicitud por Puesto",
                puestoTrabajoId: puestoTrabajoId ? Number(puestoTrabajoId) : null,
                tipo: tipo || (puestoTrabajoId && !candidatoId ? "puesto" : "candidato"),
                solicitante: solicitante || "Jefe de Área",
                urgencia: urgencia || "Media",
                fechaLimite: fechaLimite || null,
                destinatarios: destinatarios || ["analista", "evaluador"],
                preguntas: preguntasLimpias,
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Solicitud de informe emitida exitosamente.",
                datos: nuevaSolicitud,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al crear la solicitud de informe.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes-informe/:id/preguntas
     * Agrega una repregunta o nueva pregunta formulada por Jefatura.
     */
    agregarPregunta(req, res) {
        try {
            const { id } = req.params;
            const { texto, creadaPor } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El texto de la pregunta es obligatorio.",
                });
            }

            const informe = dataStore.agregarPreguntaInforme(id, {
                texto: texto.trim(),
                creadaPor: creadaPor || "Jefe de Área",
            });

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de informe con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Pregunta añadida exitosamente.",
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al agregar pregunta a la solicitud de informe.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes-informe/:id/preguntas/:preguntaId/respuestas
     * Registra una respuesta de Analista o Evaluador con comentarios técnicos.
     */
    agregarRespuesta(req, res) {
        try {
            const { id, preguntaId } = req.params;
            const { autor, rol, texto } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El texto de la respuesta no puede estar vacío.",
                });
            }

            const informe = dataStore.agregarRespuestaInforme(id, preguntaId, {
                autor,
                rol: rol || "evaluador",
                texto: texto.trim(),
            });

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el informe #${id} o la pregunta #${preguntaId}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Respuesta registrada y vinculada a la trazabilidad del informe.",
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al registrar la respuesta a la pregunta.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/solicitudes-informe/:id/estado
     * Permite cerrar o reactivar la solicitud de informe.
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

            const informe = dataStore.actualizarEstadoSolicitudInforme(id, estado);
            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de informe con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Solicitud de informe #${id} actualizada a estado '${estado}'.`,
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar el estado de la solicitud de informe.",
                error: error.message,
            });
        }
    },
};
