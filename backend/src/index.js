/**
 * Punto de entrada del servidor Backend
 */
import dotenv from "dotenv";
import app from "./app.js";
import { db } from "./data/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🐟 Aqua-Contratos API REST en ejecución`);
    console.log(`🚀 Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`📋 Documentación base: http://localhost:${PORT}/api`);
    console.log(`💾 Base de datos: ${db.isUsingSQLite() ? "SQLite Nativo (" + db.getDbFilePath() + ")" : "JSON Fallback"}`);
    console.log(`=========================================`);
});
