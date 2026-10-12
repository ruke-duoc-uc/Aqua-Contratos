/**
 * Controlador de Dashboard y Catálogos
 * Entrega métricas consolidadas (RF10), catálogos base y utilidades para demostración.
 */
import { dataStore } from "../data/dataStore.js";

export const dashboardController = {
    /**
     * GET /api/dashboard/kpis
     * Entrega los 4 indicadores operativos en tiempo real (RF10).
     */
    kpis(req, res) {
        try {
            const kpis = dataStore.obtenerKPIs();
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
     * Retorna los catálogos de Plantas, Familias de Cargo y Evaluadores disponibles.
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
     * Restablece los datos a su estado semilla inicial (Rol Administrador Académico).
     */
    resetDemo(req, res) {
        try {
            const resultado = dataStore.restablecerDatosDemo();
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
