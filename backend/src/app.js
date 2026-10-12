/**
 * Configuración principal de la aplicación Express
 */
import express from "express";
import cors from "cors";
import candidatosRoutes from "./routes/candidatosRoutes.js";
import solicitudesRoutes from "./routes/solicitudesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares globales
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Endpoint de estado y bienvenida de la API
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        nombre: "Aqua-Contratos API REST",
        version: "1.0.0",
        descripcion: "Sistema de evaluación psicolaboral · AquaChile",
        rutas: {
            candidatos: "/api/candidatos",
            solicitudes: "/api/solicitudes",
            dashboard: "/api/dashboard",
        },
    });
});

// Rutas de entidades del sistema
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Manejo de errores y 404
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
