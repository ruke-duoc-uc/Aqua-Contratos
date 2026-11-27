/**
 * Rutas REST para Puestos de Trabajo (/api/puestos)
 */
import { Router } from "express";
import { puestosController } from "../controllers/puestosController.js";
import { verificarToken, verificarRol, opcionalToken } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/puestos (soporta consulta pública de postulantes o filtrada con contexto de empleado)
router.get("/", opcionalToken, puestosController.listar);

// GET /api/puestos/:id
router.get("/:id", opcionalToken, puestosController.obtenerPorId);

// POST /api/puestos (Solo Jefatura crea oferta de trabajo)
router.post("/", verificarToken, verificarRol(["jefatura"]), puestosController.crear);

// PUT /api/puestos/:id (Solo Jefatura edita oferta)
router.put("/:id", verificarToken, verificarRol(["jefatura"]), puestosController.actualizar);

// PATCH /api/puestos/:id/estado (Solo Jefatura cambia estado)
router.patch("/:id/estado", verificarToken, verificarRol(["jefatura"]), puestosController.cambiarEstado);

// DELETE /api/puestos/:id (Solo Jefatura elimina oferta)
router.delete("/:id", verificarToken, verificarRol(["jefatura"]), puestosController.eliminar);

export default router;
