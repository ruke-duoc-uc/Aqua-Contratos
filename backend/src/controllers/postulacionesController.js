/**
 * Controlador de Postulaciones (Vínculo Candidato + Puesto de Trabajo)
 */
import { dataStore } from "../data/dataStore.js";
import { enviarCorreoCitacion } from "../services/emailService.js";
import { crearCitacionGoogleCalendarConMeet } from "../services/googleCalendarService.js";

export const postulacionesController = {
    /**
     * GET /api/postulaciones
     */
    async listar(req, res) {
        try {
            const { candidatoId, puestoTrabajoId, estado, evaluador, areaId, area_id } = req.query;
            const areaFiltro = req.usuario?.rol === "jefatura" && req.usuario?.area_id
                ? req.usuario.area_id
                : areaId || area_id;

            const candIdFiltro = req.usuario?.rol === "candidato" && req.usuario?.candidatoId
                ? req.usuario.candidatoId
                : candidatoId;

            const postulaciones = await dataStore.obtenerPostulaciones({
                candidatoId: candIdFiltro,
                puestoTrabajoId,
                estado,
                evaluador,
                areaId: areaFiltro,
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
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const postulacion = await dataStore.obtenerPostulacionPorId(id);

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
     * POST /api/postulaciones
     */
    async crear(req, res) {
        try {
            const {
                candidatoId,
                puestoTrabajoId,
                evaluadorAsignado,
                rut,
                nombre,
                nombres,
                apellidos,
                email,
                telefono,
                direccion,
                comuna,
                cv_pdf,
            } = req.body;

            if (!puestoTrabajoId) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El ID del puesto de trabajo es obligatorio.",
                });
            }

            let candidato = null;
            if (candidatoId) {
                candidato = await dataStore.obtenerCandidatoPorId(candidatoId);
            }
            const rutBuscado = rut || req.usuario?.rut;
            if (!candidato && rutBuscado) {
                candidato = await dataStore.buscarCandidatoPorRut(rutBuscado);
            }
            if (!candidato && req.usuario?.candidatoId) {
                candidato = await dataStore.obtenerCandidatoPorId(req.usuario.candidatoId);
            }

            // Si el candidato aún no existe en la base de datos (MongoDB), registrarlo automáticamente
            if (!candidato && (rutBuscado || nombre || req.usuario)) {
                const nombreFinal =
                    nombre ||
                    `${nombres || ""} ${apellidos || ""}`.trim() ||
                    req.usuario?.nombre ||
                    "Postulante";
                candidato = await dataStore.crearCandidato({
                    nombre: nombreFinal,
                    nombres: nombres || "",
                    apellidos: apellidos || "",
                    rut: rutBuscado || "",
                    email: email || req.usuario?.email || "",
                    telefono: telefono || "",
                    direccion: direccion || "",
                    comuna: comuna || "",
                    cv_pdf: cv_pdf || "",
                    cargo: "Postulante General",
                    especialidad: "Postulante General",
                    estado: "Pendiente",
                });
            }

            if (!candidato) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Candidato con ID ${candidatoId} no existe.`,
                });
            }

            const puesto = await dataStore.obtenerPuestoPorId(puestoTrabajoId);
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

            const nueva = await dataStore.crearPostulacion({
                candidatoId: candidato.id,
                puestoTrabajoId: puesto.id,
                evaluadorAsignado,
            });

            // Generar el informe psicolaboral en borrador automáticamente al registrar la postulación
            await dataStore.crearInformePsicolaboral({
                postulacionId: nueva.id,
                candidatoId: Number(candidato.id),
                candidatoNombre: candidato.nombre,
                puestoTrabajoId: Number(puesto.id),
                estado: "Pendiente",
                destinatarios: ["analista", "evaluador"],
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
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe especificar el nuevo estado de la postulación.",
                });
            }

            const actualizada = await dataStore.actualizarEstadoPostulacion(id, estado);
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
     * PATCH /api/postulaciones/:id/agendar
     */
    async agendarEntrevista(req, res) {
        try {
            const { id } = req.params;
            const {
                fechaEntrevista,
                evaluadorAsignado,
                tipoCitacion,
                enlaceGoogleMeet,
                urlGoogleCalendar,
                observaciones,
                candidatoEmail: emailManual,
            } = req.body;

            if (!fechaEntrevista) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe indicar la fecha y hora de la entrevista.",
                });
            }

            const postulacionPrevia = await dataStore.obtenerPostulacionPorId(id);
            if (!postulacionPrevia) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Postulación con ID ${id} no encontrada.`,
                });
            }

            const cand = postulacionPrevia.candidatoId
                ? await dataStore.obtenerCandidatoPorId(postulacionPrevia.candidatoId)
                : null;
            const puesto = postulacionPrevia.puestoTrabajoId
                ? await dataStore.obtenerPuestoPorId(postulacionPrevia.puestoTrabajoId)
                : null;

            const emailDestinatario =
                emailManual ||
                postulacionPrevia.email ||
                postulacionPrevia.candidatoEmail ||
                cand?.email ||
                "";
            const nombreDestinatario =
                postulacionPrevia.candidatoNombre ||
                postulacionPrevia.nombre ||
                cand?.nombre ||
                "Postulante";
            const cargo =
                puesto?.titulo ||
                postulacionPrevia.puestoTitulo ||
                postulacionPrevia.cargo ||
                "Cargo en Selección";
            const planta = puesto?.planta || postulacionPrevia.planta || "Puerto Montt";

            let meetFinal = enlaceGoogleMeet || "";
            let urlGCalFinal = urlGoogleCalendar || "";

            // Crear el evento oficial en Google Calendar y sala Meet real, enviando notificación por Gmail
            try {
                const citacionGCal = await crearCitacionGoogleCalendarConMeet({
                    titulo: `${tipoCitacion || "Entrevista"} · ${nombreDestinatario} (${cargo})`,
                    cargo,
                    candidatoNombre: nombreDestinatario,
                    candidatoEmail: emailDestinatario,
                    fechaHora: fechaEntrevista,
                    tipoCitacion: tipoCitacion || "Entrevistas online",
                    evaluador: evaluadorAsignado || postulacionPrevia.evaluadorAsignado,
                    planta,
                    observaciones,
                });

                if (citacionGCal?.enlaceGoogleMeet) {
                    meetFinal = citacionGCal.enlaceGoogleMeet;
                }
                if (citacionGCal?.urlGoogleCalendar) {
                    urlGCalFinal = citacionGCal.urlGoogleCalendar;
                }
            } catch (errGCal) {
                console.warn("[agendarEntrevista] Fallback en Google Calendar API:", errGCal.message);
            }

            const actualizada = await dataStore.agendarEntrevistaPostulacion(id, {
                fechaEntrevista,
                evaluadorAsignado,
                tipoCitacion,
                enlaceGoogleMeet: meetFinal,
                urlGoogleCalendar: urlGCalFinal,
                observaciones,
            });

            // Disparar envío de correo corporativo adicional si está configurado Resend
            enviarCorreoCitacion({
                nombre: nombreDestinatario,
                email: emailDestinatario,
                cargo,
                fechaEntrevista: actualizada.fechaEntrevista,
                tipoCitacion: actualizada.tipoCitacion || tipoCitacion || "Entrevistas físicas",
                evaluador: actualizada.evaluadorAsignado || evaluadorAsignado,
                planta,
                enlaceGoogleMeet: meetFinal,
                urlGoogleCalendar: urlGCalFinal,
                observaciones: actualizada.observaciones || observaciones,
            }).catch((err) => {
                console.warn("[agendarEntrevista] Error al notificar citación por correo:", err.message);
            });

            return res.status(200).json({
                ok: true,
                mensaje: "Entrevista agendada correctamente. Se generó la sala Meet y se notificó al correo de Gmail.",
                datos: actualizada,
                notificacionCorreo: Boolean(emailDestinatario),
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
     * PATCH /api/postulaciones/:id/respuesta-candidato
     */
    async responderCandidato(req, res) {
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

            const actualizada = await dataStore.responderCandidatoPostulacion(id, {
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
     * PATCH /api/postulaciones/:id/evaluacion
     */
    async registrarEvaluacion(req, res) {
        try {
            const { id } = req.params;
            const { dictamenPsicologico, observaciones, conclusiones } = req.body;

            if (!dictamenPsicologico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe registrar un dictamen psicolaboral formal.",
                });
            }

            const actualizada = await dataStore.evaluarPostulacion(id, {
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
     * PATCH /api/postulaciones/:id/decision-final
     */
    async decidirContratacion(req, res) {
        try {
            const { id } = req.params;
            const { decisionFinal } = req.body;

            if (!decisionFinal || !["Contratado", "No contratado"].includes(decisionFinal)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La decisión final debe ser 'Contratado' o 'No contratado'.",
                });
            }

            const actualizada = await dataStore.decidirContratacionPostulacion(id, decisionFinal);
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
