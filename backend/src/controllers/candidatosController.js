/**
 * Controlador de Candidatos
 * Reglas de negocio y manejo de peticiones HTTP para la entidad Candidato.
 */
import { dataStore } from "../data/dataStore.js";

export const candidatosController = {
    /**
     * GET /api/candidatos
     * Lista todos los candidatos con soporte opcional de búsqueda y filtro por planta.
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
     * Obtiene un candidato por su ID.
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

            return res.status(200).json({
                ok: true,
                datos: candidato,
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
     * Registra un nuevo candidato aplicando validación de datos obligatorios y unicidad de RUT.
     */
    crear(req, res) {
        try {
            const { nombre, rut, especialidad, planta, cargo, familiaCargo, antecedentes, evaluador } = req.body;

            // Validación de campos obligatorios (RF02)
            if (!nombre || !rut || !especialidad || !planta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Faltan campos obligatorios: nombre, rut, especialidad y planta son requeridos.",
                });
            }

            // Regla de negocio: No duplicar perfiles de una misma persona
            const candidatoExistente = dataStore.buscarCandidatoPorRut(rut);
            if (candidatoExistente) {
                return res.status(409).json({
                    ok: false,
                    mensaje: `Ya existe un candidato registrado con el RUT ${rut} (${candidatoExistente.nombre}).`,
                });
            }

            const nuevoCandidato = dataStore.crearCandidato({
                nombre,
                rut,
                especialidad,
                planta,
                cargo,
                familiaCargo,
                antecedentes,
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
     * Actualiza la información principal de un candidato existente (RF03).
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
                mensaje: "Candidato actualizado exitosamente.",
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
