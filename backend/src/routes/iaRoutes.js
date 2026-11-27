import { Router } from "express";
import { iaController } from "../controllers/iaController.js";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/ia/estado
router.get("/estado", iaController.obtenerEstado);

// POST /api/ia/analizar-candidato (Solo analistas, evaluadores o jefatura)
router.post(
    "/analizar-candidato",
    verificarToken,
    verificarRol(["analista", "evaluador", "jefatura"]),
    iaController.analizarCandidato
);

export default router;
