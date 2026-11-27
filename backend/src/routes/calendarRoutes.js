import express from "express";
import { calendarController } from "../controllers/calendarController.js";
import { verificarToken, verificarRol, opcionalToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/calendar/estado
router.get("/estado", calendarController.obtenerEstado);

// GET /api/calendar/auth-url
router.get("/auth-url", calendarController.obtenerUrlAuth);

// GET /api/calendar/oauth2callback (Callback oficial de Google OAuth)
router.get("/oauth2callback", calendarController.oauth2Callback);

// POST /api/calendar/citacion (Crear evento y sala Meet)
router.post(
    "/citacion",
    opcionalToken,
    calendarController.crearCitacion
);

export default router;
