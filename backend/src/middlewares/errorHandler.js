/**
 * Middleware para manejo centralizado de errores y rutas no encontradas (404)
 */

export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        ok: false,
        mensaje: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`,
    });
};

export const errorHandler = (err, req, res, next) => {
    console.error("Error no controlado:", err);
    res.status(err.status || 500).json({
        ok: false,
        mensaje: err.message || "Error interno del servidor.",
    });
};
