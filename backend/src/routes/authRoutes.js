/**
 * Rutas REST para Autenticación (/api/auth)
 */
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/auth/me (perfil del usuario autenticado vía JWT)
router.get("/me", verificarToken, authController.obtenerPerfilActual);

// GET /api/auth/usuarios (lista de usuarios disponibles para demo)
router.get("/usuarios", authController.listarUsuarios);

// POST /api/auth/login (login con email y contraseña)
router.post("/login", authController.login);

// POST /api/auth/registro-candidato (auto-registro de candidatos)
router.post("/registro-candidato", authController.registroCandidato);

export default router;
