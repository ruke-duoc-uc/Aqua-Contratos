/**
 * Rutas REST para Dashboard, KPIs y Catálogos (/api/dashboard)
 */
import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";

const router = Router();

// GET /api/dashboard/kpis (indicadores clave del proceso)
router.get("/kpis", dashboardController.kpis);

// GET /api/dashboard/catalogos (plantas, familias de cargo y evaluadores)
router.get("/catalogos", dashboardController.catalogos);

// POST /api/dashboard/reset-demo (restablece datos semilla para demostración)
router.post("/reset-demo", dashboardController.resetDemo);

export default router;
