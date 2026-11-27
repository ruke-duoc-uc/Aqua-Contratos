/**
 * Rutas REST para Informes Psicolaborales (/api/informes-psicolaborales)
 *
 * Los informes se crean automáticamente al registrar una postulación.
 * Las preguntas de jefatura viven dentro del informe (no tienen ruta propia).
 */
import { Router } from "express";
import { informesController } from "../controllers/informesController.js";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/informes-psicolaborales (Empleados: analista, evaluador, jefatura)
router.get("/", verificarToken, verificarRol(["jefatura", "analista", "evaluador"]), informesController.listar);

// POST /api/informes-psicolaborales (Jefatura o analista crea solicitud de informe)
router.post("/", verificarToken, verificarRol(["jefatura", "analista"]), informesController.crear);

// GET /api/informes-psicolaborales/:id
router.get("/:id", verificarToken, verificarRol(["jefatura", "analista", "evaluador"]), informesController.obtenerPorId);

// PATCH /api/informes-psicolaborales/:id/dictamen (Exclusivo: evaluador actualiza dictamen técnico)
router.patch("/:id/dictamen", verificarToken, verificarRol(["evaluador"]), informesController.actualizarDictamen);

// POST /api/informes-psicolaborales/:id/preguntas (Exclusivo: jefatura agrega pregunta subordinada)
router.post("/:id/preguntas", verificarToken, verificarRol(["jefatura"]), informesController.agregarPregunta);

// POST /api/informes-psicolaborales/:id/preguntas/:preguntaId/respuestas (Analista o evaluador responde)
router.post("/:id/preguntas/:preguntaId/respuestas", verificarToken, verificarRol(["analista", "evaluador"]), informesController.agregarRespuesta);

// PATCH /api/informes-psicolaborales/:id/estado (Exclusivo: jefatura cierra o reabre informe)
router.patch("/:id/estado", verificarToken, verificarRol(["jefatura"]), informesController.cambiarEstado);

export default router;
