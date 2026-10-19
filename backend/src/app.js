/**
 * Configuración principal de la aplicación Express para Aqua-Contratos
 */
import express from "express";
import cors from "cors";
import candidatosRoutes from "./routes/candidatosRoutes.js";
import solicitudesRoutes from "./routes/solicitudesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import informesRoutes from "./routes/informesRoutes.js";
import puestosRoutes from "./routes/puestosRoutes.js";
import postulacionesRoutes from "./routes/postulacionesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares globales
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Endpoint de bienvenida y catálogo de rutas
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        nombre: "Aqua-Contratos API REST",
        version: "2.0.0",
        descripcion: "Sistema integral de evaluación psicolaboral y reclutamiento · AquaChile",
        rutas: {
            auth: "/api/auth",
            puestos: "/api/puestos",
            postulaciones: "/api/postulaciones",
            candidatos: "/api/candidatos",
            solicitudes: "/api/solicitudes",
            dashboard: "/api/dashboard",
            solicitudesInforme: "/api/solicitudes-informe",
        },
    });
});

// Rutas de entidades del sistema
app.use("/api/auth", authRoutes);
app.use("/api/puestos", puestosRoutes);
app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/solicitudes-informe", informesRoutes);

// Manejo de errores y 404
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
