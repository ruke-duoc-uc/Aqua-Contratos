/**
 * Rutas REST para Candidatos (/api/candidatos)
 */
import { Router } from "express";
import { candidatosController } from "../controllers/candidatosController.js";

const router = Router();

// GET /api/candidatos (soporta ?busqueda= &planta=)
router.get("/", candidatosController.listar);

// GET /api/candidatos/:id
router.get("/:id", candidatosController.obtenerPorId);

// POST /api/candidatos (crea candidato con validación de obligatorios y unicidad de RUT)
router.post("/", candidatosController.crear);

// PUT /api/candidatos/:id (modifica datos de candidato existente)
router.put("/:id", candidatosController.actualizar);

// DELETE /api/candidatos/:id (elimina candidato)
router.delete("/:id", candidatosController.eliminar);

export default router;
