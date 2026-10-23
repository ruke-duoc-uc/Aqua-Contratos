/**
 * Rutas REST para Puestos de Trabajo (/api/puestos)
 */
import { Router } from "express";
import { puestosController } from "../controllers/puestosController.js";

const router = Router();

// GET /api/puestos
router.get("/", puestosController.listar);

// GET /api/puestos/:id
router.get("/:id", puestosController.obtenerPorId);

// POST /api/puestos (Jefatura crea oferta de trabajo)
router.post("/", puestosController.crear);

// PUT /api/puestos/:id
router.put("/:id", puestosController.actualizar);

// PATCH /api/puestos/:id/estado
router.patch("/:id/estado", puestosController.cambiarEstado);

// DELETE /api/puestos/:id
router.delete("/:id", puestosController.eliminar);

export default router;
