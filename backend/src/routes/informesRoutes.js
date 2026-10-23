/**
 * Rutas REST para Solicitudes de Informes (/api/solicitudes-informe)
 */
import { Router } from "express";
import { informesController } from "../controllers/informesController.js";

const router = Router();

// GET /api/solicitudes-informe (soporta ?busqueda= &estado= &candidatoId= &urgencia=)
router.get("/", informesController.listar);

// GET /api/solicitudes-informe/:id
router.get("/:id", informesController.obtenerPorId);

// POST /api/solicitudes-informe (Jefatura crea solicitud de informe)
router.post("/", informesController.crear);

// POST /api/solicitudes-informe/:id/preguntas (Jefatura agrega una nueva pregunta)
router.post("/:id/preguntas", informesController.agregarPregunta);

// POST /api/solicitudes-informe/:id/preguntas/:preguntaId/respuestas (Analistas/Evaluadores responden con comentarios)
router.post("/:id/preguntas/:preguntaId/respuestas", informesController.agregarRespuesta);

// PATCH /api/solicitudes-informe/:id/estado (Cerrar o reabrir informe)
router.patch("/:id/estado", informesController.cambiarEstado);

export default router;
