/**
 * Rutas REST para Postulaciones (/api/postulaciones)
 */
import { Router } from "express";
import { postulacionesController } from "../controllers/postulacionesController.js";
import { verificarToken, verificarRol, opcionalToken } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/postulaciones (Candidatos ven sus postulaciones, empleados ven según rol y área)
router.get("/", opcionalToken, postulacionesController.listar);

// GET /api/postulaciones/:id
router.get("/:id", opcionalToken, postulacionesController.obtenerPorId);

// POST /api/postulaciones (Postulante se postula a una vacante o empleado la registra)
router.post("/", opcionalToken, postulacionesController.crear);

// PATCH /api/postulaciones/:id/estado (Cambia fase: analista, evaluador o jefatura)
router.patch("/:id/estado", verificarToken, verificarRol(["analista", "evaluador", "jefatura"]), postulacionesController.cambiarEstado);

// PATCH /api/postulaciones/:id/agendar (Evaluador o analista agenda entrevista)
router.patch("/:id/agendar", opcionalToken, postulacionesController.agendarEntrevista);

// PATCH /api/postulaciones/:id/respuesta-candidato (Postulante acepta o sugiere cambio)
router.patch("/:id/respuesta-candidato", verificarToken, verificarRol(["candidato"]), postulacionesController.responderCandidato);

// PATCH /api/postulaciones/:id/evaluacion (Exclusivo: evaluador emite dictamen psicolaboral)
router.patch("/:id/evaluacion", verificarToken, verificarRol(["evaluador"]), postulacionesController.registrarEvaluacion);

// PATCH /api/postulaciones/:id/decision-final (Exclusivo: analista o jefatura deciden contratación)
router.patch("/:id/decision-final", verificarToken, verificarRol(["analista", "jefatura"]), postulacionesController.decidirContratacion);

export default router;
