/**
 * Controlador de Puestos de Trabajo (Ofertas Laborales creadas por Jefatura)
 */
import { dataStore } from "../data/dataStore.js";

export const puestosController = {
    /**
     * GET /api/puestos
     */
    listar(req, res) {
        try {
            const { busqueda, planta, familiaCargo, estado } = req.query;
            const puestos = dataStore.obtenerPuestos({ busqueda, planta, familiaCargo, estado });

            return res.status(200).json({
                ok: true,
                total: puestos.length,
                datos: puestos,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar los puestos de trabajo.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/puestos/:id
     */
    obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const puesto = dataStore.obtenerPuestoPorId(id);

            if (!puesto) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Puesto de trabajo con ID ${id} no encontrado.`,
                });
            }

            // Añadir conteo de postulaciones asociadas
            const postulaciones = dataStore.obtenerPostulaciones({ puestoTrabajoId: Number(id) });
            const detalle = {
                ...puesto,
                totalPostulantes: postulaciones.length,
                postulaciones,
            };

            return res.status(200).json({
                ok: true,
                datos: detalle,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener el puesto de trabajo.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/puestos
     */
    crear(req, res) {
        try {
            const { titulo, planta, familiaCargo, descripcion, requisitos, vacantes, creadoPor } = req.body;

            if (!titulo || !titulo.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El título o cargo del puesto de trabajo es obligatorio.",
                });
            }

            if (!planta || !planta.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La planta de AquaChile asignada al puesto es obligatoria.",
                });
            }

            if (!familiaCargo || !familiaCargo.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La familia de cargo es obligatoria.",
                });
            }

            const nuevo = dataStore.crearPuesto({
                titulo,
                planta,
                familiaCargo,
                descripcion,
                requisitos,
                vacantes: Number(vacantes) || 1,
                creadoPor: creadoPor || "Jefe de Área",
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Puesto de trabajo creado exitosamente.",
                datos: nuevo,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al crear el puesto de trabajo.",
                error: error.message,
            });
        }
    },

    /**
     * PUT /api/puestos/:id
     */
    actualizar(req, res) {
        try {
            const { id } = req.params;
            const actualizado = dataStore.actualizarPuesto(id, req.body);

            if (!actualizado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Puesto de trabajo con ID ${id} no encontrado.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: "Puesto de trabajo actualizado exitosamente.",
                datos: actualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al actualizar el puesto de trabajo.",
                error: error.message,
            });
        }
    },

    /**
     * PATCH /api/puestos/:id/estado
     */
    cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe especificar el nuevo estado del puesto (Abierto, Pausado, Cerrado).",
                });
            }

            const actualizado = dataStore.cambiarEstadoPuesto(id, estado);

            if (!actualizado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Puesto de trabajo con ID ${id} no encontrado.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Estado del puesto actualizado a ${estado}.`,
                datos: actualizado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al cambiar estado del puesto.",
                error: error.message,
            });
        }
    },

    /**
     * DELETE /api/puestos/:id
     */
    eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = dataStore.eliminarPuesto(id);

            if (!eliminado) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Puesto de trabajo con ID ${id} no encontrado.`,
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Puesto de trabajo con ID ${id} eliminado correctamente.`,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al eliminar puesto de trabajo.",
                error: error.message,
            });
        }
    },
};
