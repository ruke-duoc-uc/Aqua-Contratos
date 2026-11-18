/**
 * Rutas de la API para Etiquetas / Cualidades de Puestos
 */
import { Router } from "express";
import { etiquetasController } from "../controllers/etiquetasController.js";

const router = Router();

router.get("/", etiquetasController.listar);
router.post("/", etiquetasController.crear);

export default router;
