/**
 * Controlador de Candidatos / Postulantes
 * Reglas de negocio y manejo de peticiones HTTP asíncronas sobre MongoDB.
 */
import { dataStore } from "../data/dataStore.js";

export const candidatosController = {
    /**
     * GET /api/candidatos
     */
    async listar(req, res) {
        try {
            const { busqueda, planta } = req.query;
            const candidatos = await dataStore.obtenerCandidatos({ busqueda, planta });
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
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const candidato = await dataStore.obtenerCandidatoPorId(id);

            if (!candidato) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró ningún candidato con el ID ${id}.`,
                });
            }

            const postulaciones = await dataStore.obtenerPostulaciones({ candidatoId: Number(id) });

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
     */
    async crear(req, res) {
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
                cvDataUrl,
                especialidad,
                planta,
                cargo,
                familiaCargo,
                antecedentes,
                infoMedica,
                experienciaLaboral,
                evaluador,
            } = req.body;

            const nombreFinal = (nombre || `${nombres || ""} ${apellidos || ""}`).trim();

            if (!nombreFinal || !rut) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Faltan campos obligatorios: nombre y rut son requeridos.",
                });
            }

            const candidatoExistente = await dataStore.buscarCandidatoPorRut(rut);
            if (candidatoExistente) {
                return res.status(409).json({
                    ok: false,
                    mensaje: `Ya existe un candidato registrado con el RUT ${rut} (${candidatoExistente.nombre}).`,
                });
            }

            const nuevoCandidato = await dataStore.crearCandidato({
                nombre: nombreFinal,
                nombres,
                apellidos,
                rut,
                email,
                telefono,
                direccion,
                comuna,
                fecha_nacimiento,
                cv_pdf,
                cvDataUrl,
                especialidad: especialidad || cargo || "Postulante General",
                planta,
                cargo: cargo || especialidad || "Postulante General",
                familiaCargo,
                antecedentes,
                infoMedica,
                experienciaLaboral,
                evaluador,
            });

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
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const candidatoExistente = await dataStore.obtenerCandidatoPorId(id);

            if (!candidatoExistente) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró ningún candidato con el ID ${id}.`,
                });
            }

            if (req.body.rut && req.body.rut !== candidatoExistente.rut) {
                const rutColision = await dataStore.buscarCandidatoPorRut(req.body.rut);
                if (rutColision && Number(rutColision.id) !== Number(id)) {
                    return res.status(409).json({
                        ok: false,
                        mensaje: `El RUT ${req.body.rut} ya se encuentra asignado a otro candidato.`,
                    });
                }
            }

            const candidatoActualizado = await dataStore.actualizarCandidato(id, req.body);

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
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await dataStore.eliminarCandidato(id);

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
