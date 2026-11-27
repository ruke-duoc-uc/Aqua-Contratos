import {
    obtenerEstadoIntegracion,
    obtenerUrlAutorizacionGoogle,
    intercambiarCodigoPorTokens,
    crearCitacionGoogleCalendarConMeet,
} from "../services/googleCalendarService.js";

export const calendarController = {
    /**
     * GET /api/calendar/estado
     */
    obtenerEstado(req, res) {
        const estado = obtenerEstadoIntegracion();
        return res.status(200).json(estado);
    },

    /**
     * GET /api/calendar/auth-url
     */
    obtenerUrlAuth(req, res) {
        const url = obtenerUrlAutorizacionGoogle();
        if (!url) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "Para generar el enlace de autorización, debe configurar GOOGLE_CLIENT_ID en el archivo .env del backend.",
            });
        }
        return res.status(200).json({
            ok: true,
            url,
        });
    },

    /**
     * GET /api/calendar/oauth2callback
     */
    async oauth2Callback(req, res) {
        const { code, error } = req.query;
        if (error) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; padding: 40px; text-align: center;">
                        <h2 style="color: #c92a2a;">❌ Autorización de Google Cancelada</h2>
                        <p>${error}</p>
                        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/empleados">Volver a Aqua-Contratos</a>
                    </body>
                </html>
            `);
        }

        if (!code) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; padding: 40px; text-align: center;">
                        <h2 style="color: #c92a2a;">Código de autorización ausente</h2>
                    </body>
                </html>
            `);
        }

        try {
            const tokens = await intercambiarCodigoPorTokens(code);
            return res.status(200).send(`
                <html>
                    <body style="font-family: Arial; padding: 40px; text-align: center;">
                        <h2 style="color: #2b8a3e;">✅ Google Calendar y Meet Conectados Exitosamente</h2>
                        <p>Aqua-Contratos ya cuenta con permisos para crear eventos y salas Meet automáticamente.</p>
                        <p><strong>Refresh Token generado:</strong> guarde este valor en <code>GOOGLE_REFRESH_TOKEN</code> de su .env si desea persistirlo de forma permanente.</p>
                        <div style="background: #f1f3f5; padding: 12px; margin: 20px auto; max-width: 600px; word-break: break-all; border-radius: 6px;">
                            <code>${tokens.refreshToken || "Token activo en memoria"}</code>
                        </div>
                        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/empleados" style="display: inline-block; background: #0b3b60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Volver a la Plataforma
                        </a>
                    </body>
                </html>
            `);
        } catch (err) {
            return res.status(500).send(`
                <html>
                    <body style="font-family: Arial; padding: 40px; text-align: center;">
                        <h2 style="color: #c92a2a;">Error al conectar con Google</h2>
                        <p>${err.message}</p>
                    </body>
                </html>
            `);
        }
    },

    /**
     * POST /api/calendar/citacion
     */
    async crearCitacion(req, res) {
        try {
            const {
                titulo,
                cargo,
                candidatoNombre,
                candidatoEmail,
                fechaHora,
                fechaEntrevista,
                tipoCitacion,
                evaluador,
                planta,
                observaciones,
                duracionMinutos,
            } = req.body;

            const fechaFinal = fechaHora || fechaEntrevista;

            if (!fechaFinal) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe indicar la fecha y hora de la citación.",
                });
            }

            const resultado = await crearCitacionGoogleCalendarConMeet({
                titulo,
                cargo,
                candidatoNombre,
                candidatoEmail,
                fechaHora: fechaFinal,
                tipoCitacion,
                evaluador,
                planta,
                observaciones,
                duracionMinutos,
            });

            return res.status(200).json(resultado);
        } catch (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al generar citación de Google Calendar.",
                error: err.message,
            });
        }
    },
};
