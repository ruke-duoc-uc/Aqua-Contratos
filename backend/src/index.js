/**
 * Punto de entrada del servidor Backend (Node.js + Express + MongoDB/Mongoose)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import app from "./app.js";
import { db } from "./data/db.js";

// Cargar siempre backend/.env sin depender del directorio de trabajo.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🐟 Aqua-Contratos API REST en ejecución`);
    console.log(`🚀 Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`📋 Documentación base: http://localhost:${PORT}/api`);
    console.log(
        `💾 Base de datos: ${
            db.isUsingMongo()
                ? "MongoDB Conectado (" + db.getMongoUri() + ")"
                : "Respaldo JSON Local (" + db.getDbFilePath() + ")"
        }`
    );
    console.log(`=========================================`);
});
