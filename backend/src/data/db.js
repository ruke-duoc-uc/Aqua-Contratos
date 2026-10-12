/**
 * Capa de persistencia en base de datos para Aqua-Contratos
 * Implementa almacenamiento persistente utilizando SQLite nativo (node:sqlite)
 * con fallback a persistencia de archivo JSON en caso de entornos legados.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { CANDIDATOS_SEED, CATALOGOS_SEED } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.join(__dirname, "aqua_contratos.db");

const JSON_FALLBACK_FILE = path.join(__dirname, "aqua_contratos.json");

let sqliteDb = null;
let useJsonFallback = false;
let memoryStore = null;

// Inicialización de la base de datos persistente
try {
    const { DatabaseSync } = await import("node:sqlite");
    
    // Asegurar directorio
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    sqliteDb = new DatabaseSync(DB_FILE);
    
    // Crear tabla de candidatos si no existe
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS candidatos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            rut TEXT NOT NULL UNIQUE,
            especialidad TEXT NOT NULL,
            planta TEXT NOT NULL,
            cargo TEXT NOT NULL,
            familiaCargo TEXT NOT NULL,
            fecha TEXT NOT NULL,
            evaluador TEXT NOT NULL,
            estado TEXT NOT NULL,
            antecedentes TEXT,
            resultadoPsicologico TEXT DEFAULT 'Pendiente',
            fechaEvaluacion TEXT,
            conclusiones TEXT
        );
    `);

    // Comprobar si la tabla está vacía para poblar con datos semilla iniciales
    const countRow = sqliteDb.prepare("SELECT COUNT(*) AS total FROM candidatos;").get();
    if (countRow.total === 0) {
        const insertStmt = sqliteDb.prepare(`
            INSERT INTO candidatos (
                id, nombre, rut, especialidad, planta, cargo, familiaCargo,
                fecha, evaluador, estado, antecedentes, resultadoPsicologico,
                fechaEvaluacion, conclusiones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const c of CANDIDATOS_SEED) {
            insertStmt.run(
                c.id,
                c.nombre,
                c.rut,
                c.especialidad,
                c.planta,
                c.cargo,
                c.familiaCargo,
                c.fecha,
                c.evaluador,
                c.estado,
                c.antecedentes || "",
                c.resultadoPsicologico || "Pendiente",
                c.fechaEvaluacion || null,
                c.conclusiones || null
            );
        }
    }
} catch (err) {
    console.warn("node:sqlite no disponible o falló la conexión. Usando persistencia JSON en archivo:", err.message);
    useJsonFallback = true;

    if (fs.existsSync(JSON_FALLBACK_FILE)) {
        try {
            memoryStore = JSON.parse(fs.readFileSync(JSON_FALLBACK_FILE, "utf-8"));
        } catch {
            memoryStore = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
        }
    } else {
        memoryStore = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
        fs.writeFileSync(JSON_FALLBACK_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    }
}

function persistJson() {
    if (useJsonFallback && memoryStore) {
        fs.writeFileSync(JSON_FALLBACK_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    }
}

export const db = {
    isUsingSQLite() {
        return !useJsonFallback && sqliteDb !== null;
    },

    getDbFilePath() {
        return useJsonFallback ? JSON_FALLBACK_FILE : DB_FILE;
    },

    obtenerTodos() {
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT * FROM candidatos ORDER BY id DESC;").all();
            return rows.map((r) => ({ ...r }));
        }
        return [...memoryStore];
    },

    obtenerPorId(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT * FROM candidatos WHERE id = ?;").get(numId);
            return row ? { ...row } : null;
        }
        return memoryStore.find((c) => c.id === numId) || null;
    },

    buscarPorRut(rut) {
        if (!rut) return null;
        const rutLimpio = rut.replace(/[\.\-]/g, "").trim().toLowerCase();

        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT * FROM candidatos;").all();
            const encontrado = rows.find((c) => {
                const actual = (c.rut || "").replace(/[\.\-]/g, "").trim().toLowerCase();
                return actual === rutLimpio;
            });
            return encontrado ? { ...encontrado } : null;
        }

        return memoryStore.find((c) => {
            const actual = (c.rut || "").replace(/[\.\-]/g, "").trim().toLowerCase();
            return actual === rutLimpio;
        }) || null;
    },

    insertarCandidato(datos) {
        const fecha = datos.fecha ? new Date(datos.fecha).toISOString() : new Date().toISOString();
        const antecedente = datos.antecedentes?.trim() || "";
        const resultadoPsicologico = datos.resultadoPsicologico || "Pendiente";
        const evaluador = datos.evaluador?.trim() || "Sin Asignar";
        const estado = datos.estado?.trim() || "Pendiente";
        const cargo = datos.cargo?.trim() || "Postulante General";
        const familiaCargo = datos.familiaCargo?.trim() || "Operaciones Productivas";

        if (!useJsonFallback && sqliteDb) {
            const insert = sqliteDb.prepare(`
                INSERT INTO candidatos (
                    nombre, rut, especialidad, planta, cargo, familiaCargo,
                    fecha, evaluador, estado, antecedentes, resultadoPsicologico
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const res = insert.run(
                datos.nombre.trim(),
                datos.rut.trim(),
                datos.especialidad.trim(),
                datos.planta.trim(),
                cargo,
                familiaCargo,
                fecha,
                evaluador,
                estado,
                antecedente,
                resultadoPsicologico
            );

            const nuevoId = Number(res.lastInsertRowid);
            return this.obtenerPorId(nuevoId);
        }

        const nuevoId = memoryStore.length > 0 ? Math.max(...memoryStore.map((c) => c.id)) + 1 : 1;
        const nuevoCandidato = {
            id: nuevoId,
            nombre: datos.nombre.trim(),
            rut: datos.rut.trim(),
            especialidad: datos.especialidad.trim(),
            planta: datos.planta.trim(),
            cargo,
            familiaCargo,
            fecha,
            evaluador,
            estado,
            antecedentes: antecedente,
            resultadoPsicologico,
        };
        memoryStore.unshift(nuevoCandidato);
        persistJson();
        return nuevoCandidato;
    },

    actualizarCandidato(id, datosActualizados) {
        const numId = Number(id);
        const existente = this.obtenerPorId(numId);
        if (!existente) return null;

        if (!useJsonFallback && sqliteDb) {
            const campos = [];
            const valores = [];

            const camposValidos = [
                "nombre", "rut", "especialidad", "planta", "cargo",
                "familiaCargo", "evaluador", "estado", "antecedentes",
                "resultadoPsicologico", "fechaEvaluacion", "conclusiones"
            ];

            for (const campo of camposValidos) {
                if (datosActualizados[campo] !== undefined) {
                    campos.push(`${campo} = ?`);
                    valores.push(datosActualizados[campo]);
                }
            }

            if (campos.length > 0) {
                valores.push(numId);
                const sql = `UPDATE candidatos SET ${campos.join(", ")} WHERE id = ?;`;
                sqliteDb.prepare(sql).run(...valores);
            }

            return this.obtenerPorId(numId);
        }

        const idx = memoryStore.findIndex((c) => c.id === numId);
        if (idx !== -1) {
            memoryStore[idx] = { ...memoryStore[idx], ...datosActualizados, id: numId };
            persistJson();
            return memoryStore[idx];
        }
        return null;
    },

    eliminarCandidato(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const res = sqliteDb.prepare("DELETE FROM candidatos WHERE id = ?;").run(numId);
            return res.changes > 0;
        }

        const idx = memoryStore.findIndex((c) => c.id === numId);
        if (idx === -1) return false;
        memoryStore.splice(idx, 1);
        persistJson();
        return true;
    },

    restablecerDemo() {
        if (!useJsonFallback && sqliteDb) {
            sqliteDb.exec("DELETE FROM candidatos;");
            const insertStmt = sqliteDb.prepare(`
                INSERT INTO candidatos (
                    id, nombre, rut, especialidad, planta, cargo, familiaCargo,
                    fecha, evaluador, estado, antecedentes, resultadoPsicologico,
                    fechaEvaluacion, conclusiones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const c of CANDIDATOS_SEED) {
                insertStmt.run(
                    c.id,
                    c.nombre,
                    c.rut,
                    c.especialidad,
                    c.planta,
                    c.cargo,
                    c.familiaCargo,
                    c.fecha,
                    c.evaluador,
                    c.estado,
                    c.antecedentes || "",
                    c.resultadoPsicologico || "Pendiente",
                    c.fechaEvaluacion || null,
                    c.conclusiones || null
                );
            }
            return { totalRegistros: CANDIDATOS_SEED.length };
        }

        memoryStore = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
        persistJson();
        return { totalRegistros: memoryStore.length };
    },

    obtenerCatalogos() {
        return CATALOGOS_SEED;
    },
};
