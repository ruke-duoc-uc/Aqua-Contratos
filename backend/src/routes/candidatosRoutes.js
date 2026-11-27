/**
 * Rutas REST para Candidatos (/api/candidatos)
 */
import { Router } from "express";
import { candidatosController } from "../controllers/candidatosController.js";
import { verificarToken, verificarRol, opcionalToken } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/candidatos (Solo empleados autorizados pueden consultar catálogo de candidatos)
router.get("/", verificarToken, verificarRol(["analista", "evaluador", "jefatura"]), candidatosController.listar);

// GET /api/candidatos/:id/cv (Descarga de CV desde carpeta privada en servidor)
router.get("/:id/cv", opcionalToken, candidatosController.descargarCv);

// GET /api/candidatos/:id (Empleados autorizados o el propio candidato)
router.get("/:id", verificarToken, candidatosController.obtenerPorId);

// POST /api/candidatos (Desactivado: Endpoint legacy. El auto-registro de postulantes se realiza mediante POST /api/auth/registro-candidato)
router.post("/", (req, res) => {
    return res.status(410).json({
        ok: false,
        mensaje: "El endpoint POST /api/candidatos ha sido desactivado. Los postulantes deben registrarse con su cuenta de acceso a través de POST /api/auth/registro-candidato.",
    });
});

// PUT /api/candidatos/:id (El candidato actualiza su propio perfil o el analista)
router.put("/:id", opcionalToken, candidatosController.actualizar);

// DELETE /api/candidatos/:id (Solo analista o jefatura)
router.delete("/:id", verificarToken, verificarRol(["analista", "jefatura"]), candidatosController.eliminar);

export default router;
