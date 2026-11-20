/**
 * Controlador de Informes Psicolaborales
 *
 * El informe psicolaboral se genera automáticamente al crear una postulación.
 * Contiene:
 *   - La evaluación técnica del profesional evaluador (dictamen, conclusiones, fechaEvaluacion).
 *   - Las preguntas/repreguntas de jefatura (preguntasJefatura), que solo existen dentro del informe.
 */
import { dataStore } from "../data/dataStore.js";

export const informesController = {
    /**
     * GET /api/informes-psicolaborales
     */
    async listar(req, res) {
        try {
            const { busqueda, estado, candidatoId, puestoTrabajoId, postulacionId } = req.query;
            const informes = await dataStore.obtenerInformes({
                busqueda,
                estado,
                candidatoId,
                puestoTrabajoId,
                postulacionId,
            });

            return res.status(200).json({
                ok: true,
                total: informes.length,
                datos: informes,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar los informes psicolaborales.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/informes-psicolaborales/:id
     * Devuelve el informe completo: evaluación técnica + preguntas de jefatura.
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const informe = await dataStore.obtenerInformePorId(id);

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el informe psicolaboral con ID ${id}.`,
                });
            }

            const [candidato, puesto, postulacion] = await Promise.all([
                informe.candidatoId ? dataStore.obtenerCandidatoPorId(informe.candidatoId) : null,
                informe.puestoTrabajoId ? dataStore.obtenerPuestoPorId(informe.puestoTrabajoId) : null,
                informe.postulacionId ? dataStore.obtenerPostulacionPorId(informe.postulacionId) : null,
            ]);

            return res.status(200).json({
                ok: true,
                datos: {
                    ...informe,
                    candidatoPerfil: candidato || null,
                    puestoPerfil: puesto || null,
                    postulacion: postulacion || null,
                },
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al consultar el informe psicolaboral.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/informes-psicolaborales/:id/dictamen
     * El evaluador actualiza la evaluación técnica del informe.
     */
    async actualizarDictamen(req, res) {
        try {
            const { id } = req.params;
            const { evaluador, fechaEvaluacion, dictamen, conclusiones } = req.body;

            const dictamenesValidos = ["Pendiente", "Recomendable", "Con reservas", "No recomendable"];
            if (dictamen && !dictamenesValidos.includes(dictamen)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Dictamen inválido. Valores permitidos: ${dictamenesValidos.join(", ")}.`,
                });
            }

            const informe = await dataStore.actualizarDictamenInforme(id, {
                evaluador,
                fechaEvaluacion,
                dictamen,
                conclusiones,
            });

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el informe psicolaboral con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Dictamen psicolaboral actualizado correctamente.",
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar el dictamen del informe.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/informes-psicolaborales/:id/preguntas
     * Jefatura agrega una nueva pregunta al informe. La pregunta no existe fuera de él.
     */
    async agregarPregunta(req, res) {
        try {
            const { id } = req.params;
            const { texto, creadaPor } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El texto de la pregunta es obligatorio.",
                });
            }

            const informe = await dataStore.agregarPreguntaInforme(id, {
                texto: texto.trim(),
                creadaPor: creadaPor || "Jefe de Área",
            });

            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el informe psicolaboral con ID ${id}.`,
                });
            }

            if (informe.estado === "Cerrado") {
                return res.status(409).json({
                    ok: false,
                    mensaje: "No se pueden agregar preguntas a un informe cerrado.",
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Pregunta añadida al informe psicolaboral.",
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al agregar pregunta al informe psicolaboral.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/informes-psicolaborales/:id/preguntas/:preguntaId/respuestas
     * Analistas o evaluadores responden una pregunta del informe.
     */
    async agregarRespuesta(req, res) {
        try {
            const { id, preguntaId } = req.params;
            const { autor, rol, texto } = req.body;

            if (!texto || !texto.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El texto de la respuesta no puede estar vacío.",
                });
            }

            const informe = await dataStore.agregarRespuestaInforme(id, preguntaId, {
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
                mensaje: "Respuesta registrada en el informe psicolaboral.",
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al registrar la respuesta.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/informes-psicolaborales/:id/estado
     * Cierra o reabre el informe. Al cerrarlo no se pueden agregar más preguntas.
     */
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const estadosValidos = ["Pendiente", "En evaluación", "Emitido", "Cerrado"];
            if (!estado || !estadosValidos.includes(estado)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Estado inválido. Valores permitidos: ${estadosValidos.join(", ")}.`,
                });
            }

            const informe = await dataStore.actualizarEstadoSolicitudInforme(id, estado);
            if (!informe) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró el informe psicolaboral con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Informe psicolaboral #${id} actualizado a estado '${estado}'.`,
                datos: informe,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar el estado del informe.",
                error: error.message,
            });
        }
    },
};
