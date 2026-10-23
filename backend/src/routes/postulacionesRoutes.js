/**
 * Rutas REST para Postulaciones (/api/postulaciones)
 */
import { Router } from "express";
import { postulacionesController } from "../controllers/postulacionesController.js";

const router = Router();

// GET /api/postulaciones (soporta ?candidatoId= &puestoTrabajoId= &estado= &evaluador=)
router.get("/", postulacionesController.listar);

// GET /api/postulaciones/:id
router.get("/:id", postulacionesController.obtenerPorId);

// POST /api/postulaciones (candidato se postula a un puesto)
router.post("/", postulacionesController.crear);

// PATCH /api/postulaciones/:id/estado (cambia fase)
router.patch("/:id/estado", postulacionesController.cambiarEstado);

// PATCH /api/postulaciones/:id/agendar (evaluador fija fecha de entrevista)
router.patch("/:id/agendar", postulacionesController.agendarEntrevista);

// PATCH /api/postulaciones/:id/respuesta-candidato (candidato Acepta o Sugiere otra fecha)
router.patch("/:id/respuesta-candidato", postulacionesController.responderCandidato);

// PATCH /api/postulaciones/:id/evaluacion (dictamen psicolaboral y rúbrica)
router.patch("/:id/evaluacion", postulacionesController.registrarEvaluacion);

// PATCH /api/postulaciones/:id/decision-final (analista marca Contratado o No contratado)
router.patch("/:id/decision-final", postulacionesController.decidirContratacion);

export default router;
