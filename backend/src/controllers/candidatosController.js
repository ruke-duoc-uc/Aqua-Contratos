/**
 * Controlador de Candidatos
 * Reglas de negocio y manejo de peticiones HTTP para el perfil del Candidato.
 * Los datos del candidato están desacoplados de la planta (la planta pertenece al puesto de trabajo).
 */
import { dataStore } from "../data/dataStore.js";
import { enviarCorreosPostulacion } from "../services/emailService.js";

/**
 * Dispara las notificaciones por correo sin bloquear la respuesta HTTP.
 * Si Resend falla, la postulación ya quedó guardada y solo se registra el aviso.
 */
function notificarPostulacion({ nombre, email, rut, cargo }) {
    enviarCorreosPostulacion({ nombre, email, rut, cargo }).catch((error) => {
        console.error("[correo] Error inesperado al enviar notificaciones:", error);
    });
}

export const candidatosController = {
    /**
     * GET /api/candidatos
     * Lista todos los candidatos con soporte opcional de búsqueda y filtro por planta (legacy).
     */
    listar(req, res) {
        try {
            const { busqueda, planta } = req.query;
            const candidatos = dataStore.obtenerCandidatos({ busqueda, planta });
            return res.status(200).json({
                ok: true,
                total: candidatos.length,
                datos: candidatos,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener el listado de candidatos.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/candidatos/:id
     * Obtiene un candidato por su ID junto a su historial de postulaciones.
     */
    obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const candidato = dataStore.obtenerCandidatoPorId(id);

            if (!candidato) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró ningún candidato con el ID ${id}.`,
                });
            }

            // Adjuntar historial completo de postulaciones
            const postulaciones = dataStore.obtenerPostulaciones({ candidatoId: Number(id) });

            return res.status(200).json({
                ok: true,
                datos: {
                    ...candidato,
                    postulaciones,
                },
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al consultar el candidato.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/candidatos
     * Registra un nuevo candidato. La planta es opcional (pertenece a los puestos de trabajo).
     */
    crear(req, res) {
        try {
            const {
                nombre,
                nombres,
                apellidos,
                rut,
                email,
                telefono,
                direccion,
                comuna,
                fecha_nacimiento,
                cv_pdf,
                especialidad,
                planta,
                cargo,
                familiaCargo,
                antecedentes,
                infoMedica,
                experienciaLaboral,
                evaluador,
                fecha,
                estado,
                resultadoPsicologico,
            } = req.body;

            // Validación de campos obligatorios mínimos
            if (!nombre || !rut) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Faltan campos obligatorios: nombre y rut son requeridos.",
                });
            }

            // Si el RUT ya existe, se reemplazan los datos anteriores (incluido el CV)
            const candidatoExistente = dataStore.buscarCandidatoPorRut(rut);
            if (candidatoExistente) {
                const candidatoActualizado = dataStore.actualizarCandidato(candidatoExistente.id, {
                    nombre,
                    nombres,
                    apellidos,
                    rut,
                    email,
                    telefono,
                    direccion,
                    comuna,
                    fecha_nacimiento,
                    cv_pdf,
                    especialidad: especialidad || cargo || candidatoExistente.especialidad,
                    planta,
                    cargo,
                    familiaCargo,
                    antecedentes,
                    infoMedica,
                    experienciaLaboral,
                    evaluador,
                    estado,
                    resultadoPsicologico,
                    fecha: fecha || new Date().toISOString(),
                });

                notificarPostulacion({ nombre, email, rut, cargo });

                return res.status(200).json({
                    ok: true,
                    mensaje: `Se actualizó el candidato con RUT ${rut}: sus datos y CV anteriores fueron reemplazados por los nuevos.`,
                    datos: candidatoActualizado,
                });
            }

            const nuevoCandidato = dataStore.crearCandidato({
                nombre,
                nombres,
                apellidos,
                rut,
                email,
                telefono,
                direccion,
                comuna,
                fecha_nacimiento,
                cv_pdf,
                especialidad: especialidad || cargo || "No especificada",
                planta,
                cargo,
                familiaCargo,
                antecedentes,
                infoMedica,
                experienciaLaboral,
                evaluador,
                fecha,
                estado,
                resultadoPsicologico,
            });

            notificarPostulacion({ nombre, email, rut, cargo });

            return res.status(201).json({
                ok: true,
                mensaje: "Candidato registrado exitosamente.",
                datos: nuevoCandidato,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al crear el candidato.",
                error: error.message,
            });
        }
    },

    /**
     * PUT /api/candidatos/:id
     * Actualiza la información personal, médica y profesional de un candidato (RF03).
     */
    actualizar(req, res) {
        try {
            const { id } = req.params;
            const candidatoExistente = dataStore.obtenerCandidatoPorId(id);

            if (!candidatoExistente) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró ningún candidato con el ID ${id}.`,
                });
            }

            // Si se modifica el RUT, verificar que no colisione con otro candidato
            if (req.body.rut && req.body.rut !== candidatoExistente.rut) {
                const rutColision = dataStore.buscarCandidatoPorRut(req.body.rut);
                if (rutColision && rutColision.id !== Number(id)) {
                    return res.status(409).json({
                        ok: false,
                        mensaje: `El RUT ${req.body.rut} ya se encuentra asignado a otro candidato.`,
                    });
                }
            }

            const candidatoActualizado = dataStore.actualizarCandidato(id, req.body);

            return res.status(200).json({
                ok: true,
                mensaje: "Perfil del candidato actualizado exitosamente.",
                datos: candidatoActualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al actualizar el candidato.",
                error: error.message,
            });
        }
    },

    /**
     * DELETE /api/candidatos/:id
     * Elimina un candidato del sistema.
     */
    eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = dataStore.eliminarCandidato(id);

            if (!eliminado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró ningún candidato con el ID ${id} para eliminar.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Candidato con ID ${id} eliminado correctamente.`,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al eliminar el candidato.",
                error: error.message,
            });
        }
    },
};
