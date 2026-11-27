import { iaService } from "../services/iaService.js";
import { dataStore } from "../data/dataStore.js";

export const iaController = {
    /**
     * POST /api/ia/analizar-candidato
     */
    async analizarCandidato(req, res) {
        try {
            const { candidatoId, puestoTrabajoId, requisitos } = req.body;

            let datosCandidato = req.body;
            if (candidatoId) {
                const candidatoEnDb = await dataStore.obtenerCandidatoPorId(candidatoId);
                if (candidatoEnDb) {
                    datosCandidato = { ...candidatoEnDb, ...req.body };
                }
            }

            let cargoPostulado = req.body.cargoPostulado || datosCandidato.cargo;
            let planta = req.body.planta || datosCandidato.planta;

            if (puestoTrabajoId) {
                const puesto = await dataStore.obtenerPuestoPorId(puestoTrabajoId);
                if (puesto) {
                    cargoPostulado = puesto.titulo;
                    planta = puesto.planta;
                }
            }

            const resultado = await iaService.analizarCandidato({
                candidatoId: datosCandidato.id || candidatoId,
                nombre: datosCandidato.nombre,
                especialidad: datosCandidato.especialidad || datosCandidato.cargo,
                experienciaLaboral: datosCandidato.experienciaLaboral,
                infoMedica: datosCandidato.infoMedica,
                cargoPostulado: cargoPostulado || "Operario General",
                planta: planta || "Puerto Montt",
                requisitos,
            });

            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al procesar el análisis de IA.",
                error: error.message,
            });
        }
    },

    /**
     * GET /api/ia/estado
     */
    obtenerEstado(req, res) {
        const tieneKey = Boolean(process.env.GEMINI_API_KEY);
        return res.status(200).json({
            ok: true,
            motorDisponible: tieneKey ? "Gemini 1.5 Flash (En vivo)" : "Motor Heurístico Integrado",
            modo: tieneKey ? "gemini_api" : "heuristico",
            disclaimerObligatorio: true,
        });
    },
};
