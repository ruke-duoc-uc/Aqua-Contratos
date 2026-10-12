/**
 * Punto de entrada del servidor Backend
 */
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🐟 Aqua-Contratos API REST en ejecución`);
    console.log(`🚀 Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`📋 Documentación base: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
});
