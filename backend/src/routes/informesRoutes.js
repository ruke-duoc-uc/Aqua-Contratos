/**
 * Rutas REST para Informes Psicolaborales (/api/informes-psicolaborales)
 *
 * Los informes se crean automáticamente al registrar una postulación.
 * Las preguntas de jefatura viven dentro del informe (no tienen ruta propia).
 */
import { Router } from "express";
import { informesController } from "../controllers/informesController.js";

const router = Router();

// GET /api/informes-psicolaborales (soporta ?busqueda= &estado= &candidatoId= &puestoTrabajoId= &postulacionId=)
router.get("/", informesController.listar);

// POST /api/informes-psicolaborales (y /api/solicitudes-informe)
router.post("/", informesController.crear);

// GET /api/informes-psicolaborales/:id (devuelve informe completo: evaluación + preguntasJefatura)
router.get("/:id", informesController.obtenerPorId);

// PATCH /api/informes-psicolaborales/:id/dictamen (Evaluador actualiza la evaluación técnica)
router.patch("/:id/dictamen", informesController.actualizarDictamen);

// POST /api/informes-psicolaborales/:id/preguntas (Jefatura agrega pregunta subordinada al informe)
router.post("/:id/preguntas", informesController.agregarPregunta);

// POST /api/informes-psicolaborales/:id/preguntas/:preguntaId/respuestas (Analista/Evaluador responde)
router.post("/:id/preguntas/:preguntaId/respuestas", informesController.agregarRespuesta);

// PATCH /api/informes-psicolaborales/:id/estado (Cambiar estado: Pendiente / En evaluación / Emitido / Cerrado)
router.patch("/:id/estado", informesController.cambiarEstado);

export default router;
