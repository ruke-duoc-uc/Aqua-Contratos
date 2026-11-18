/**
 * Rutas REST para Áreas de Trabajo (/api/areas)
 */
import { Router } from "express";
import { areasController } from "../controllers/areasController.js";

const router = Router();

// GET /api/areas
router.get("/", areasController.listar);

// GET /api/areas/:id
router.get("/:id", areasController.obtenerPorId);

export default router;
