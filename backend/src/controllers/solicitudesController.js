/**
 * Controlador de Solicitudes de Evaluación
 * Maneja el flujo de estados, asignación de cargos, agendamiento y dictamen psicolaboral.
 */
import { dataStore } from "../data/dataStore.js";

const ESTADOS_VALIDOS = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Finalizada"];
const RESULTADOS_VALIDOS = ["Pendiente", "Recomendado", "Recomendado con observaciones", "No recomendado"];

export const solicitudesController = {
    /**
     * GET /api/solicitudes
     * Lista solicitudes con soporte de filtros en tiempo real (RF07):
     * estado, planta, evaluador y término de búsqueda.
     */
    listar(req, res) {
        try {
            const { busqueda, estado, planta, evaluador } = req.query;
            const solicitudes = dataStore.obtenerSolicitudes({
                busqueda,
                estado,
                planta,
                evaluador,
            });

            return res.status(200).json({
                ok: true,
                total: solicitudes.length,
                datos: solicitudes,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener las solicitudes de evaluación.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/solicitudes/:id
     * Obtiene el detalle completo de una solicitud (RF06).
     */
    obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const solicitud = dataStore.obtenerSolicitudPorId(id);

            if (!solicitud) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud de evaluación con ID ${id}.`,
                });
            }

            return res.status(200).json({
                ok: true,
                datos: solicitud,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al consultar la solicitud.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/solicitudes
     * Emite una nueva solicitud de evaluación asociada a un candidato (RF04, RF05).
     */
    crear(req, res) {
        try {
            const {
                nombre,
                rut,
                especialidad,
                planta,
                cargo,
                familiaCargo,
                evaluador,
                antecedentes,
            } = req.body;

            if (!nombre || !rut || !cargo || !planta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Faltan campos obligatorios para emitir la solicitud (nombre, rut, cargo y planta).",
                });
            }

            const nuevaSolicitud = dataStore.crearCandidato({
                nombre,
                rut,
                especialidad: especialidad || "No especificada",
                planta,
                cargo,
                familiaCargo: familiaCargo || "Operaciones Productivas",
                evaluador: evaluador || "Sin Asignar",
                estado: "Pendiente",
                antecedentes: antecedentes || "",
                resultadoPsicologico: "Pendiente",
                fecha: new Date().toISOString(),
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Solicitud de evaluación emitida exitosamente con estado PENDIENTE.",
                datos: nuevaSolicitud,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al crear la solicitud de evaluación.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/solicitudes/:id/estado
     * Actualiza el estado del flujo de la solicitud (RF08).
     * Valores admitidos: Pendiente, En revisión, En proceso, Finalizado.
     */
    cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Se debe especificar el campo 'estado'.",
                });
            }

            const estadoNormalizado = ESTADOS_VALIDOS.find(
                (e) => e.toLowerCase() === estado.toLowerCase()
            );

            if (!estadoNormalizado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Estado inválido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(", ")}.`,
                });
            }

            const solicitudActualizada = dataStore.actualizarEstadoSolicitud(id, estadoNormalizado);

            if (!solicitudActualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud con ID ${id} para actualizar su estado.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Estado de la solicitud actualizado a '${estadoNormalizado}'.`,
                datos: solicitudActualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al actualizar el estado de la solicitud.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/solicitudes/:id/evaluacion
     * Registra el dictamen psicolaboral, fecha de evaluación y conclusiones (RF09).
     */
    registrarEvaluacion(req, res) {
        try {
            const { id } = req.params;
            const { resultadoPsicologico, fechaEvaluacion, conclusiones, estado } = req.body;

            if (!resultadoPsicologico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El campo 'resultadoPsicologico' es obligatorio.",
                });
            }

            const dictamenNormalizado = RESULTADOS_VALIDOS.find(
                (r) => r.toLowerCase() === resultadoPsicologico.toLowerCase()
            );

            if (!dictamenNormalizado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Dictamen inválido. Opciones válidas: ${RESULTADOS_VALIDOS.join(", ")}.`,
                });
            }

            const solicitudActualizada = dataStore.actualizarEvaluacionSolicitud(id, {
                resultadoPsicologico: dictamenNormalizado,
                fechaEvaluacion: fechaEvaluacion || new Date().toISOString().split("T")[0],
                conclusiones: conclusiones || "",
                estado: estado || "Finalizado",
            });

            if (!solicitudActualizada) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró la solicitud con ID ${id} para registrar la evaluación.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Evaluación psicológica y dictamen guardados correctamente.",
                datos: solicitudActualizada,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar la evaluación psicológica.",
                error: error.message,
            });
        }
    },
};
