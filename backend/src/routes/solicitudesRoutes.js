/**
 * Rutas REST para Solicitudes de Evaluación (/api/solicitudes)
 */
import { Router } from "express";
import { solicitudesController } from "../controllers/solicitudesController.js";

const router = Router();

// GET /api/solicitudes (soporta ?busqueda= &estado= &planta= &evaluador=)
router.get("/", solicitudesController.listar);

// GET /api/solicitudes/:id
router.get("/:id", solicitudesController.obtenerPorId);

// POST /api/solicitudes (Desactivado: Endpoint legacy. Las postulaciones se gestionan mediante POST /api/postulaciones)
router.post("/", (req, res) => {
    return res.status(410).json({
        ok: false,
        mensaje: "El endpoint POST /api/solicitudes ha sido desactivado. Las postulaciones directas a puestos de trabajo se gestionan a través de POST /api/postulaciones.",
    });
});

// PATCH /api/solicitudes/:id/estado (cambia estado del flujo)
router.patch("/:id/estado", solicitudesController.cambiarEstado);

// PATCH /api/solicitudes/:id/evaluacion (guarda dictamen y conclusiones psicolaborales)
router.patch("/:id/evaluacion", solicitudesController.registrarEvaluacion);

export default router;
