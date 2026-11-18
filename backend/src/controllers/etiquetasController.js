/**
 * Controlador de Etiquetas / Cualidades Reutilizables de Puestos de Trabajo
 */
import { dataStore } from "../data/dataStore.js";

export const etiquetasController = {
    /**
     * GET /api/etiquetas
     */
    async listar(req, res) {
        try {
            const etiquetas = await dataStore.obtenerEtiquetas();
            return res.status(200).json({
                ok: true,
                total: etiquetas.length,
                datos: etiquetas,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar las etiquetas.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/etiquetas
     */
    async crear(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre || !nombre.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "El nombre de la etiqueta o cualidad es obligatorio.",
                });
            }

            const nueva = await dataStore.crearEtiqueta(nombre.trim());
            return res.status(201).json({
                ok: true,
                mensaje: "Etiqueta registrada exitosamente.",
                datos: nueva,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al crear la etiqueta.",
                error: error.message,
            });
        }
    },
};
