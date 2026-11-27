/**
 * Configuración principal de la aplicación Express para Aqua-Contratos
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import candidatosRoutes from "./routes/candidatosRoutes.js";
import solicitudesRoutes from "./routes/solicitudesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import informesRoutes from "./routes/informesRoutes.js";
import puestosRoutes from "./routes/puestosRoutes.js";
import areasRoutes from "./routes/areasRoutes.js";
import postulacionesRoutes from "./routes/postulacionesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import etiquetasRoutes from "./routes/etiquetasRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import iaRoutes from "./routes/iaRoutes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swaggerSpec.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares globales
app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
});
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "15mb" }));

// Endpoint de bienvenida y catálogo de rutas
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        nombre: "Aqua-Contratos API REST",
        version: "2.0.0",
        descripcion: "Sistema integral de evaluación psicolaboral y reclutamiento · AquaChile",
        rutas: {
            auth: "/api/auth",
            areas: "/api/areas",
            puestos: "/api/puestos",
            postulaciones: "/api/postulaciones",
            candidatos: "/api/candidatos",
            solicitudes: "/api/solicitudes",
            dashboard: "/api/dashboard",
            solicitudesInforme: "/api/solicitudes-informe",
            informesPsicolaborales: "/api/informes-psicolaborales",
            etiquetas: "/api/etiquetas",
            calendar: "/api/calendar",
            ia: "/api/ia",
            docs: "/api/docs",
        },
    });
});

// Documentación de API interactiva (Swagger / OpenAPI)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de entidades del sistema
app.use("/api/auth", authRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/puestos", puestosRoutes);
app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/solicitudes-informe", informesRoutes);
app.use("/api/informes-psicolaborales", informesRoutes);
app.use("/api/etiquetas", etiquetasRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/ia", iaRoutes);

// Servir frontend compilado en producción (Opción A: Despliegue Unificado)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFrontend = path.resolve(__dirname, "../../vcm-psicolaboral/dist");

if (fs.existsSync(distFrontend)) {
    app.use(express.static(distFrontend));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }
        return res.sendFile(path.join(distFrontend, "index.html"));
    });
}

// Manejo de errores y 404
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
