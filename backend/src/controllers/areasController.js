/**
 * Controlador de Áreas de Trabajo (catálogo organizacional de AquaChile)
 */
import { dataStore } from "../data/dataStore.js";

export const areasController = {
    /**
     * GET /api/areas
     */
    async listar(req, res) {
        try {
            const { busqueda } = req.query;
            const areas = await dataStore.obtenerAreas({ busqueda });

            return res.status(200).json({
                ok: true,
                total: areas.length,
                datos: areas,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar las áreas de trabajo.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/areas/:id
     * Incluye las ofertas laborales asociadas al área.
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const area = await dataStore.obtenerAreaPorId(id);

            if (!area) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Área de trabajo con ID ${id} no encontrada.`,
                });
            }

            const puestos = await dataStore.obtenerPuestos({ areaId: area.id });

            return res.status(200).json({
                ok: true,
                datos: {
                    ...area,
                    totalPuestos: puestos.length,
                    puestos,
                },
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener el área de trabajo.",
                error: error.message,
            });
        }
    },
};
