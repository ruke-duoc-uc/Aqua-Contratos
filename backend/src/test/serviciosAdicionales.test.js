import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { cvStorageService } from "../services/cvStorageService.js";
import { iaService } from "../services/iaService.js";
import { swaggerSpec } from "../docs/swaggerSpec.js";

after(() => {
    setTimeout(() => process.exit(0), 50).unref();
});

describe("Pauta: Carpetas Privadas de CVs en Servidor (Punto 1)", () => {
    it("debe crear automáticamente la carpeta privada y almacenar el PDF del postulante", () => {
        const resultado = cvStorageService.guardarCvEnCarpetaPrivada({
            candidatoId: 999,
            nombre: "Esteban Dido",
            rut: "19.888.777-6",
            cargo: "Operario de Producción",
        });

        assert.equal(resultado.ok, true);
        assert.ok(fs.existsSync(resultado.rutaCarpeta), "La carpeta privada debe existir físicamente");
        assert.ok(fs.existsSync(resultado.rutaArchivo), "El archivo PDF debe estar guardado en la carpeta");
        assert.match(resultado.nombreCarpeta, /^candidato_999_/);
    });

    it("obtenerRutaCv debe localizar el archivo en la carpeta privada", () => {
        const info = cvStorageService.obtenerRutaCv(999);
        assert.equal(info.existe, true);
        assert.ok(info.rutaArchivo);
        assert.ok(info.nombreArchivo.endsWith(".pdf"));
    });
});

describe("Pauta: Módulo de Asistencia con Inteligencia Artificial (Punto 3)", () => {
    it("debe generar análisis orientativo de perfil con afinidad, preguntas y disclaimer humano", async () => {
        const analisis = await iaService.analizarCandidato({
            candidatoId: 1,
            nombre: "Marcela Paz",
            especialidad: "Técnico en Acuicultura",
            experienciaLaboral: "3 años en piscicultura y control de bioseguridad en plantas",
            cargoPostulado: "Técnico de Alimentación",
            planta: "Puerto Montt",
        });

        assert.equal(analisis.ok, true);
        assert.ok(analisis.afinidadPorcentaje >= 1 && analisis.afinidadPorcentaje <= 100);
        assert.ok(typeof analisis.resumenPerfil === "string" && analisis.resumenPerfil.length > 20);
        assert.ok(Array.isArray(analisis.preguntasEntrevistaSugeridas));
        assert.ok(analisis.preguntasEntrevistaSugeridas.length >= 3);
        assert.match(analisis.disclaimer, /control humano/i);
    });
});

describe("Pauta: Documentación OpenAPI / Swagger (Punto 4)", () => {
    it("debe contar con especificación OpenAPI 3.0 válida con rutas clave", () => {
        assert.equal(swaggerSpec.openapi, "3.0.0");
        assert.ok(swaggerSpec.paths["/auth/login"]);
        assert.ok(swaggerSpec.paths["/auth/registro-candidato"]);
        assert.ok(swaggerSpec.paths["/candidatos/{id}/cv"]);
        assert.ok(swaggerSpec.paths["/ia/analizar-candidato"]);
    });
});
