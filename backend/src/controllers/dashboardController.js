/**
 * Controlador de Dashboard y Catálogos
 */
import { dataStore } from "../data/dataStore.js";

export const dashboardController = {
    /**
     * GET /api/dashboard/kpis
     */
    async kpis(req, res) {
        try {
            const kpis = await dataStore.obtenerKPIs();
            return res.status(200).json({
                ok: true,
                datos: kpis,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al calcular los KPIs del dashboard.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/dashboard/catalogos
     */
    catalogos(req, res) {
        try {
            const catalogos = dataStore.obtenerCatalogos();
            return res.status(200).json({
                ok: true,
                datos: catalogos,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al obtener los catálogos base.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/dashboard/reset-demo
     */
    async resetDemo(req, res) {
        try {
            const resultado = await dataStore.restablecerDatosDemo();
            return res.status(200).json({
                ok: true,
                ...resultado,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al restablecer los datos de demostración.",
                error: error.message,
            });
        }
    },
};
