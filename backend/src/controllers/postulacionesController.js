/**
 * Controlador de Postulaciones (Vínculo Candidato + Puesto de Trabajo)
 * Gestiona el ciclo completo: postulación, citación a entrevista, respuesta del candidato,
 * dictamen psicolaboral y decisión final de contratación.
 */
import { dataStore } from "../data/dataStore.js";

export const postulacionesController = {
    /**
     * GET /api/postulaciones
     */
    listar(req, res) {
        try {
            const { candidatoId, puestoTrabajoId, estado, evaluador } = req.query;
            const postulaciones = dataStore.obtenerPostulaciones({
                candidatoId,
                puestoTrabajoId,
                estado,
                evaluador,
            });

            return res.status(200).json({
                ok: true,
                total: postulaciones.length,
                datos: postulaciones,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar las postulaciones.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/postulaciones/:id
     */
    obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const postulacion = dataStore.obtenerPostulacionPorId(id);

            if (!postulacion) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                datos: postulacion,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener la postulación.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/postulaciones (Candidato se postula a un puesto de trabajo)
     */
    crear(req, res) {
        try {
            const { candidatoId, puestoTrabajoId, evaluadorAsignado } = req.body;

            if (!candidatoId) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El ID del candidato es obligatorio.",
                });
            }

            if (!puestoTrabajoId) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El ID del puesto de trabajo es obligatorio.",
                });
            }

            const candidato = dataStore.obtenerCandidatoPorId(candidatoId);
            if (!candidato) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Candidato con ID ${candidatoId} no existe.`,
                });
            }

            const puesto = dataStore.obtenerPuestoPorId(puestoTrabajoId);
            if (!puesto) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Puesto de trabajo con ID ${puestoTrabajoId} no existe.`,
                });
            }

            if (puesto.estado !== "Abierto") {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El puesto de trabajo '${puesto.titulo}' no está abierto para nuevas postulaciones.`,
                });
            }

            const nueva = dataStore.crearPostulacion({
                candidatoId,
                puestoTrabajoId,
                evaluadorAsignado,
            });

            return res.status(201).json({
                ok: true,
                mensaje: `Postulación registrada exitosamente para el cargo '${puesto.titulo}' en planta '${puesto.planta}'.`,
                datos: nueva,
            });
        } catch (error) {
            if (error.codigo === "POSTULACION_DUPLICADA") {
                return res.status(409).json({
                    ok: false,
                    mensaje: error.message,
                });
            }
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar la postulación.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/postulaciones/:id/estado
     */
    cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe especificar el nuevo estado de la postulación.",
                });
            }

            const actualizada = dataStore.actualizarEstadoPostulacion(id, estado);
            if (!actualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Estado de postulación actualizado a '${estado}'.`,
                datos: actualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al cambiar estado de la postulación.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/postulaciones/:id/agendar (Evaluador/Analista agenda entrevista)
     */
    agendarEntrevista(req, res) {
        try {
            const { id } = req.params;
            const { fechaEntrevista, evaluadorAsignado, observaciones } = req.body;

            if (!fechaEntrevista) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe indicar la fecha y hora de la entrevista.",
                });
            }

            const actualizada = dataStore.agendarEntrevistaPostulacion(id, {
                fechaEntrevista,
                evaluadorAsignado,
                observaciones,
            });

            if (!actualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Entrevista agendada correctamente. Se notificó al candidato para su confirmación.",
                datos: actualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al agendar entrevista.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/postulaciones/:id/respuesta-candidato (Candidato responde Aceptar o Sugerir cambio)
     */
    responderCandidato(req, res) {
        try {
            const { id } = req.params;
            const { respuesta, sugerenciaFecha } = req.body;

            if (!respuesta || !["Aceptada", "Sugerir cambio"].includes(respuesta)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La respuesta debe ser 'Aceptada' o 'Sugerir cambio'.",
                });
            }

            if (respuesta === "Sugerir cambio" && (!sugerenciaFecha || !sugerenciaFecha.trim())) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe incluir una fecha sugerida o mensaje explicativo al sugerir cambio de fecha.",
                });
            }

            const actualizada = dataStore.responderCandidatoPostulacion(id, {
                respuesta,
                sugerenciaFecha,
            });

            if (!actualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: respuesta === "Aceptada"
                    ? "✓ Has confirmado la fecha de tu entrevista laboral."
                    : "✓ Tu sugerencia de cambio de fecha ha sido enviada al equipo de reclutamiento.",
                datos: actualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al procesar la respuesta del candidato.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/postulaciones/:id/evaluacion (Evaluador registra dictamen y rúbrica)
     */
    registrarEvaluacion(req, res) {
        try {
            const { id } = req.params;
            const { dictamenPsicologico, observaciones, conclusiones } = req.body;

            if (!dictamenPsicologico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe registrar un dictamen psicolaboral formal.",
                });
            }

            const actualizada = dataStore.evaluarPostulacion(id, {
                dictamenPsicologico,
                observaciones,
                conclusiones,
            });

            if (!actualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Dictamen psicolaboral registrado y postulación finalizada.",
                datos: actualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar evaluación psicolaboral.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/postulaciones/:id/decision-final (Analista decide Contratar o No Contratar)
     */
    decidirContratacion(req, res) {
        try {
            const { id } = req.params;
            const { decisionFinal } = req.body;

            if (!decisionFinal || !["Contratado", "No contratado"].includes(decisionFinal)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La decisión final debe ser 'Contratado' o 'No contratado'.",
                });
            }

            const actualizada = dataStore.decidirContratacionPostulacion(id, decisionFinal);
            if (!actualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Decisión final registrada: el candidato ha sido clasificado como '${decisionFinal}'.`,
                datos: actualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar la decisión final de contratación.",
                error: error.message,
            });
        }
    },
};
