/**
 * Capa de persistencia en base de datos para Aqua-Contratos
 * Implementa almacenamiento relacional utilizando SQLite nativo (node:sqlite)
 * con fallback a persistencia de archivos JSON en caso de entornos legados.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
    CANDIDATOS_SEED,
    CATALOGOS_SEED,
    INFORMES_SEED,
    PUESTOS_SEED,
    POSTULACIONES_SEED,
    USUARIOS_SEED,
} from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.join(__dirname, "aqua_contratos.db");

const JSON_CANDIDATOS_FILE = path.join(__dirname, "aqua_contratos.json");
const JSON_INFORMES_FILE = path.join(__dirname, "aqua_informes.json");
const JSON_PUESTOS_FILE = path.join(__dirname, "aqua_puestos.json");
const JSON_POSTULACIONES_FILE = path.join(__dirname, "aqua_postulaciones.json");
const JSON_USUARIOS_FILE = path.join(__dirname, "aqua_usuarios.json");

let sqliteDb = null;
let useJsonFallback = false;

// Stores en memoria para fallback JSON
let memoryStoreCandidatos = null;
let memoryStoreInformes = null;
let memoryStorePuestos = null;
let memoryStorePostulaciones = null;
let memoryStoreUsuarios = null;

// ==================== INICIALIZACIÓN BASE DE DATOS ====================
try {
    const { DatabaseSync } = await import("node:sqlite");

    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    sqliteDb = new DatabaseSync(DB_FILE);

    // 1. Tabla de Candidatos
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS candidatos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            rut TEXT NOT NULL UNIQUE,
            email TEXT,
            telefono TEXT,
            especialidad TEXT NOT NULL,
            planta TEXT,
            cargo TEXT,
            familiaCargo TEXT,
            fecha TEXT NOT NULL,
            evaluador TEXT,
            estado TEXT NOT NULL DEFAULT 'Pendiente',
            antecedentes TEXT,
            infoMedica TEXT,
            experienciaLaboral TEXT,
            resultadoPsicologico TEXT DEFAULT 'Pendiente',
            fechaEvaluacion TEXT,
            conclusiones TEXT
        );
    `);

    // Migración dinámica de columnas en tabla candidatos (si ya existía con esquema previo)
    try {
        const columnas = sqliteDb.prepare("PRAGMA table_info(candidatos);").all();
        const nombresCol = columnas.map((c) => c.name);
        if (!nombresCol.includes("email")) sqliteDb.exec("ALTER TABLE candidatos ADD COLUMN email TEXT;");
        if (!nombresCol.includes("telefono")) sqliteDb.exec("ALTER TABLE candidatos ADD COLUMN telefono TEXT;");
        if (!nombresCol.includes("infoMedica")) sqliteDb.exec("ALTER TABLE candidatos ADD COLUMN infoMedica TEXT;");
        if (!nombresCol.includes("experienciaLaboral")) sqliteDb.exec("ALTER TABLE candidatos ADD COLUMN experienciaLaboral TEXT;");
    } catch {
        // Ignorar si ya existen
    }

    // 2. Tabla de Puestos de Trabajo
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS puestos_trabajo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            planta TEXT NOT NULL,
            familiaCargo TEXT NOT NULL,
            descripcion TEXT,
            requisitos TEXT,
            vacantes INTEGER DEFAULT 1,
            estado TEXT NOT NULL DEFAULT 'Abierto',
            creadoPor TEXT DEFAULT 'Jefe de Área',
            fechaCreacion TEXT NOT NULL
        );
    `);

    // 3. Tabla de Postulaciones (vínculo Candidato + Puesto)
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS postulaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidatoId INTEGER NOT NULL,
            puestoTrabajoId INTEGER NOT NULL,
            estado TEXT NOT NULL DEFAULT 'Postulado',
            fechaPostulacion TEXT NOT NULL,
            evaluadorAsignado TEXT DEFAULT 'Sin Asignar',
            fechaEntrevista TEXT,
            respuestaCandidato TEXT DEFAULT 'Pendiente',
            sugerenciaFecha TEXT,
            dictamenPsicologico TEXT DEFAULT 'Pendiente',
            observaciones TEXT,
            conclusiones TEXT,
            decisionFinal TEXT DEFAULT 'Pendiente'
        );
    `);

    // 4. Tabla de Solicitudes de Informe (Jefatura)
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS solicitudes_informe (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidatoId INTEGER,
            candidatoNombre TEXT,
            puestoTrabajoId INTEGER,
            tipo TEXT DEFAULT 'candidato',
            solicitante TEXT NOT NULL,
            urgencia TEXT NOT NULL,
            fechaLimite TEXT,
            estado TEXT NOT NULL,
            fechaCreacion TEXT NOT NULL,
            destinatarios TEXT,
            preguntas TEXT
        );
    `);

    // Migración dinámica para solicitudes_informe
    try {
        const infCols = sqliteDb.prepare("PRAGMA table_info(solicitudes_informe);").all().map((c) => c.name);
        if (!infCols.includes("puestoTrabajoId")) sqliteDb.exec("ALTER TABLE solicitudes_informe ADD COLUMN puestoTrabajoId INTEGER;");
        if (!infCols.includes("tipo")) sqliteDb.exec("ALTER TABLE solicitudes_informe ADD COLUMN tipo TEXT DEFAULT 'candidato';");
    } catch {
        // Ignorar
    }

    // 5. Tabla de Usuarios y Autenticación
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nombre TEXT NOT NULL,
            rol TEXT NOT NULL,
            candidatoId INTEGER
        );
    `);

    // ==================== POBLADO DE SEMILLAS INICIALES ====================
    // Poblar candidatos si está vacío
    const countCandidatos = sqliteDb.prepare("SELECT COUNT(*) AS total FROM candidatos;").get();
    if (countCandidatos.total === 0) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO candidatos (
                id, nombre, rut, email, telefono, especialidad, planta, cargo,
                familiaCargo, fecha, evaluador, estado, antecedentes, infoMedica,
                experienciaLaboral, resultadoPsicologico, fechaEvaluacion, conclusiones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const c of CANDIDATOS_SEED) {
            stmt.run(
                c.id,
                c.nombre,
                c.rut,
                c.email || null,
                c.telefono || null,
                c.especialidad,
                c.planta || null,
                c.cargo || null,
                c.familiaCargo || null,
                c.fecha,
                c.evaluador || null,
                c.estado || "Pendiente",
                c.antecedentes || "",
                c.infoMedica || "",
                c.experienciaLaboral || "",
                c.resultadoPsicologico || "Pendiente",
                c.fechaEvaluacion || null,
                c.conclusiones || null
            );
        }
    }

    // Poblar puestos si está vacío
    const countPuestos = sqliteDb.prepare("SELECT COUNT(*) AS total FROM puestos_trabajo;").get();
    if (countPuestos.total === 0) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO puestos_trabajo (
                id, titulo, planta, familiaCargo, descripcion, requisitos,
                vacantes, estado, creadoPor, fechaCreacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of PUESTOS_SEED) {
            stmt.run(
                p.id,
                p.titulo,
                p.planta,
                p.familiaCargo,
                p.descripcion || "",
                p.requisitos || "",
                p.vacantes || 1,
                p.estado || "Abierto",
                p.creadoPor || "Jefe de Área",
                p.fechaCreacion
            );
        }
    }

    // Poblar postulaciones si está vacío
    const countPostulaciones = sqliteDb.prepare("SELECT COUNT(*) AS total FROM postulaciones;").get();
    if (countPostulaciones.total === 0) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO postulaciones (
                id, candidatoId, puestoTrabajoId, estado, fechaPostulacion,
                evaluadorAsignado, fechaEntrevista, respuestaCandidato, sugerenciaFecha,
                dictamenPsicologico, observaciones, conclusiones, decisionFinal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const pos of POSTULACIONES_SEED) {
            stmt.run(
                pos.id,
                pos.candidatoId,
                pos.puestoTrabajoId,
                pos.estado,
                pos.fechaPostulacion,
                pos.evaluadorAsignado || "Sin Asignar",
                pos.fechaEntrevista || null,
                pos.respuestaCandidato || "Pendiente",
                pos.sugerenciaFecha || null,
                pos.dictamenPsicologico || "Pendiente",
                pos.observaciones || "",
                pos.conclusiones || "",
                pos.decisionFinal || "Pendiente"
            );
        }
    }

    // Poblar solicitudes de informe si está vacío
    const countInformes = sqliteDb.prepare("SELECT COUNT(*) AS total FROM solicitudes_informe;").get();
    if (countInformes.total === 0) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO solicitudes_informe (
                id, candidatoId, candidatoNombre, puestoTrabajoId, tipo,
                solicitante, urgencia, fechaLimite, estado, fechaCreacion,
                destinatarios, preguntas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const inf of INFORMES_SEED) {
            stmt.run(
                inf.id,
                inf.candidatoId || null,
                inf.candidatoNombre || null,
                inf.puestoTrabajoId || null,
                inf.tipo || "candidato",
                inf.solicitante,
                inf.urgencia,
                inf.fechaLimite,
                inf.estado,
                inf.fechaCreacion,
                JSON.stringify(inf.destinatarios),
                JSON.stringify(inf.preguntas)
            );
        }
    }

    // Poblar usuarios si está vacío
    const countUsuarios = sqliteDb.prepare("SELECT COUNT(*) AS total FROM usuarios;").get();
    if (countUsuarios.total === 0) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO usuarios (id, email, password, nombre, rol, candidatoId)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const u of USUARIOS_SEED) {
            stmt.run(u.id, u.email, u.password, u.nombre, u.rol, u.candidatoId || null);
        }
    }
} catch (err) {
    console.warn("node:sqlite no disponible o falló la conexión. Usando persistencia JSON en archivo:", err.message);
    useJsonFallback = true;

    // Helper carga JSON
    const cargarJSON = (archivo, datosIniciales) => {
        if (fs.existsSync(archivo)) {
            try {
                return JSON.parse(fs.readFileSync(archivo, "utf-8"));
            } catch {
                return JSON.parse(JSON.stringify(datosIniciales));
            }
        }
        const copia = JSON.parse(JSON.stringify(datosIniciales));
        fs.writeFileSync(archivo, JSON.stringify(copia, null, 2), "utf-8");
        return copia;
    };

    memoryStoreCandidatos = cargarJSON(JSON_CANDIDATOS_FILE, CANDIDATOS_SEED);
    memoryStorePuestos = cargarJSON(JSON_PUESTOS_FILE, PUESTOS_SEED);
    memoryStorePostulaciones = cargarJSON(JSON_POSTULACIONES_FILE, POSTULACIONES_SEED);
    memoryStoreInformes = cargarJSON(JSON_INFORMES_FILE, INFORMES_SEED);
    memoryStoreUsuarios = cargarJSON(JSON_USUARIOS_FILE, USUARIOS_SEED);
}

function persistJson(tipo) {
    if (!useJsonFallback) return;
    try {
        if (tipo === "candidatos" || !tipo) fs.writeFileSync(JSON_CANDIDATOS_FILE, JSON.stringify(memoryStoreCandidatos, null, 2), "utf-8");
        if (tipo === "puestos" || !tipo) fs.writeFileSync(JSON_PUESTOS_FILE, JSON.stringify(memoryStorePuestos, null, 2), "utf-8");
        if (tipo === "postulaciones" || !tipo) fs.writeFileSync(JSON_POSTULACIONES_FILE, JSON.stringify(memoryStorePostulaciones, null, 2), "utf-8");
        if (tipo === "informes" || !tipo) fs.writeFileSync(JSON_INFORMES_FILE, JSON.stringify(memoryStoreInformes, null, 2), "utf-8");
        if (tipo === "usuarios" || !tipo) fs.writeFileSync(JSON_USUARIOS_FILE, JSON.stringify(memoryStoreUsuarios, null, 2), "utf-8");
    } catch {
        // Ignorar
    }
}

function formatearInforme(row) {
    if (!row) return null;
    let destinatarios = [];
    try {
        destinatarios = typeof row.destinatarios === "string" ? JSON.parse(row.destinatarios) : (row.destinatarios || []);
    } catch {
        destinatarios = [];
    }
    let preguntas = [];
    try {
        preguntas = typeof row.preguntas === "string" ? JSON.parse(row.preguntas) : (row.preguntas || []);
    } catch {
        preguntas = [];
    }
    return {
        ...row,
        destinatarios,
        preguntas,
    };
}

export const db = {
    isUsingSQLite() {
        return !useJsonFallback && sqliteDb !== null;
    },

    getDbFilePath() {
        return useJsonFallback ? JSON_CANDIDATOS_FILE : DB_FILE;
    },

    // ==================== CANDIDATOS ====================
    obtenerTodos() {
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT * FROM candidatos ORDER BY id DESC;").all();
            return rows.map((r) => ({ ...r }));
        }
        return [...memoryStoreCandidatos];
    },

    obtenerPorId(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT * FROM candidatos WHERE id = ?;").get(numId);
            return row ? { ...row } : null;
        }
        return memoryStoreCandidatos.find((c) => c.id === numId) || null;
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

        return memoryStoreCandidatos.find((c) => {
            const actual = (c.rut || "").replace(/[\.\-]/g, "").trim().toLowerCase();
            return actual === rutLimpio;
        }) || null;
    },

    insertarCandidato(datos) {
        const fecha = datos.fecha ? new Date(datos.fecha).toISOString() : new Date().toISOString();
        const antecedente = datos.antecedentes?.trim() || "";
        const infoMedica = datos.infoMedica?.trim() || "";
        const experienciaLaboral = datos.experienciaLaboral?.trim() || "";
        const email = datos.email?.trim() || "";
        const telefono = datos.telefono?.trim() || "";
        const resultadoPsicologico = datos.resultadoPsicologico || "Pendiente";
        const evaluador = datos.evaluador?.trim() || "Sin Asignar";
        const estado = datos.estado?.trim() || "Pendiente";
        const cargo = datos.cargo?.trim() || "Postulante General";
        const familiaCargo = datos.familiaCargo?.trim() || "Operaciones Productivas";
        const planta = datos.planta?.trim() || null; // Opcional, ya que la planta es del puesto

        if (!useJsonFallback && sqliteDb) {
            const insert = sqliteDb.prepare(`
                INSERT INTO candidatos (
                    nombre, rut, email, telefono, especialidad, planta, cargo, familiaCargo,
                    fecha, evaluador, estado, antecedentes, infoMedica, experienciaLaboral,
                    resultadoPsicologico
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const res = insert.run(
                datos.nombre.trim(),
                datos.rut.trim(),
                email,
                telefono,
                datos.especialidad.trim(),
                planta,
                cargo,
                familiaCargo,
                fecha,
                evaluador,
                estado,
                antecedente,
                infoMedica,
                experienciaLaboral,
                resultadoPsicologico
            );

            const nuevoId = Number(res.lastInsertRowid);
            return this.obtenerPorId(nuevoId);
        }

        const nuevoId = memoryStoreCandidatos.length > 0 ? Math.max(...memoryStoreCandidatos.map((c) => c.id)) + 1 : 1;
        const nuevoCandidato = {
            id: nuevoId,
            nombre: datos.nombre.trim(),
            rut: datos.rut.trim(),
            email,
            telefono,
            especialidad: datos.especialidad.trim(),
            planta,
            cargo,
            familiaCargo,
            fecha,
            evaluador,
            estado,
            antecedentes: antecedente,
            infoMedica,
            experienciaLaboral,
            resultadoPsicologico,
        };
        memoryStoreCandidatos.unshift(nuevoCandidato);
        persistJson("candidatos");
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
                "nombre", "rut", "email", "telefono", "especialidad", "planta", "cargo",
                "familiaCargo", "evaluador", "estado", "antecedentes", "infoMedica",
                "experienciaLaboral", "resultadoPsicologico", "fechaEvaluacion", "conclusiones"
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

        const idx = memoryStoreCandidatos.findIndex((c) => c.id === numId);
        if (idx !== -1) {
            memoryStoreCandidatos[idx] = { ...memoryStoreCandidatos[idx], ...datosActualizados, id: numId };
            persistJson("candidatos");
            return memoryStoreCandidatos[idx];
        }
        return null;
    },

    eliminarCandidato(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const res = sqliteDb.prepare("DELETE FROM candidatos WHERE id = ?;").run(numId);
            return res.changes > 0;
        }

        const idx = memoryStoreCandidatos.findIndex((c) => c.id === numId);
        if (idx === -1) return false;
        memoryStoreCandidatos.splice(idx, 1);
        persistJson("candidatos");
        return true;
    },

    // ==================== PUESTOS DE TRABAJO (Ofertas Laborales) ====================
    obtenerPuestos({ busqueda, planta, familiaCargo, estado } = {}) {
        let lista = [];
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT * FROM puestos_trabajo ORDER BY id DESC;").all();
            lista = rows.map((r) => ({ ...r }));
        } else {
            lista = [...(memoryStorePuestos || [])];
        }

        return lista.filter((p) => {
            const termino = busqueda ? busqueda.toLowerCase().trim() : "";
            const coincideTexto =
                !termino ||
                p.titulo.toLowerCase().includes(termino) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
                (p.requisitos && p.requisitos.toLowerCase().includes(termino));

            const coincidePlanta =
                !planta ||
                planta === "todas" ||
                p.planta.toLowerCase() === planta.toLowerCase();

            const coincideFamilia =
                !familiaCargo ||
                familiaCargo === "todas" ||
                p.familiaCargo.toLowerCase() === familiaCargo.toLowerCase();

            const coincideEstado =
                !estado ||
                estado === "todos" ||
                p.estado.toLowerCase() === estado.toLowerCase();

            return coincideTexto && coincidePlanta && coincideFamilia && coincideEstado;
        });
    },

    obtenerPuestoPorId(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT * FROM puestos_trabajo WHERE id = ?;").get(numId);
            return row ? { ...row } : null;
        }
        return (memoryStorePuestos || []).find((p) => p.id === numId) || null;
    },

    insertarPuesto(datos) {
        const fechaCreacion = datos.fechaCreacion || new Date().toISOString();
        const vacantes = Number(datos.vacantes) || 1;
        const estado = datos.estado || "Abierto";
        const creadoPor = datos.creadoPor || "Jefe de Área";

        if (!useJsonFallback && sqliteDb) {
            const insert = sqliteDb.prepare(`
                INSERT INTO puestos_trabajo (
                    titulo, planta, familiaCargo, descripcion, requisitos,
                    vacantes, estado, creadoPor, fechaCreacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const res = insert.run(
                datos.titulo.trim(),
                datos.planta.trim(),
                datos.familiaCargo.trim(),
                datos.descripcion?.trim() || "",
                datos.requisitos?.trim() || "",
                vacantes,
                estado,
                creadoPor,
                fechaCreacion
            );

            return this.obtenerPuestoPorId(Number(res.lastInsertRowid));
        }

        const nuevoId = (memoryStorePuestos && memoryStorePuestos.length > 0)
            ? Math.max(...memoryStorePuestos.map((p) => p.id)) + 1
            : 1;

        const nuevoPuesto = {
            id: nuevoId,
            titulo: datos.titulo.trim(),
            planta: datos.planta.trim(),
            familiaCargo: datos.familiaCargo.trim(),
            descripcion: datos.descripcion?.trim() || "",
            requisitos: datos.requisitos?.trim() || "",
            vacantes,
            estado,
            creadoPor,
            fechaCreacion,
        };

        if (!memoryStorePuestos) memoryStorePuestos = [];
        memoryStorePuestos.unshift(nuevoPuesto);
        persistJson("puestos");
        return nuevoPuesto;
    },

    actualizarPuesto(id, datos) {
        const numId = Number(id);
        const existente = this.obtenerPuestoPorId(numId);
        if (!existente) return null;

        if (!useJsonFallback && sqliteDb) {
            const campos = [];
            const valores = [];
            const camposPermitidos = ["titulo", "planta", "familiaCargo", "descripcion", "requisitos", "vacantes", "estado"];

            for (const campo of camposPermitidos) {
                if (datos[campo] !== undefined) {
                    campos.push(`${campo} = ?`);
                    valores.push(campo === "vacantes" ? Number(datos[campo]) : datos[campo]);
                }
            }

            if (campos.length > 0) {
                valores.push(numId);
                sqliteDb.prepare(`UPDATE puestos_trabajo SET ${campos.join(", ")} WHERE id = ?;`).run(...valores);
            }
            return this.obtenerPuestoPorId(numId);
        }

        const idx = (memoryStorePuestos || []).findIndex((p) => p.id === numId);
        if (idx !== -1) {
            memoryStorePuestos[idx] = { ...memoryStorePuestos[idx], ...datos, id: numId };
            persistJson("puestos");
            return memoryStorePuestos[idx];
        }
        return null;
    },

    eliminarPuesto(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const res = sqliteDb.prepare("DELETE FROM puestos_trabajo WHERE id = ?;").run(numId);
            return res.changes > 0;
        }

        const idx = (memoryStorePuestos || []).findIndex((p) => p.id === numId);
        if (idx === -1) return false;
        memoryStorePuestos.splice(idx, 1);
        persistJson("puestos");
        return true;
    },

    // ==================== POSTULACIONES ====================
    obtenerPostulaciones({ candidatoId, puestoTrabajoId, estado, evaluador } = {}) {
        let lista = [];
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare(`
                SELECT pos.*, 
                       c.nombre AS candidatoNombre, c.rut AS candidatoRut, c.email AS candidatoEmail,
                       c.telefono AS candidatoTelefono, c.especialidad AS candidatoEspecialidad,
                       c.infoMedica AS candidatoInfoMedica, c.experienciaLaboral AS candidatoExperiencia,
                       p.titulo AS puestoTitulo, p.planta AS puestoPlanta, p.familiaCargo AS puestoFamilia
                FROM postulaciones pos
                LEFT JOIN candidatos c ON pos.candidatoId = c.id
                LEFT JOIN puestos_trabajo p ON pos.puestoTrabajoId = p.id
                ORDER BY pos.id DESC;
            `).all();
            lista = rows.map((r) => ({ ...r }));
        } else {
            lista = (memoryStorePostulaciones || []).map((pos) => {
                const c = (memoryStoreCandidatos || []).find((item) => item.id === Number(pos.candidatoId));
                const p = (memoryStorePuestos || []).find((item) => item.id === Number(pos.puestoTrabajoId));
                return {
                    ...pos,
                    candidatoNombre: c?.nombre,
                    candidatoRut: c?.rut,
                    candidatoEmail: c?.email,
                    candidatoTelefono: c?.telefono,
                    candidatoEspecialidad: c?.especialidad,
                    candidatoInfoMedica: c?.infoMedica,
                    candidatoExperiencia: c?.experienciaLaboral,
                    puestoTitulo: p?.titulo,
                    puestoPlanta: p?.planta,
                    puestoFamilia: p?.familiaCargo,
                };
            });
        }

        return lista.filter((pos) => {
            const coincideCandidato = !candidatoId || Number(pos.candidatoId) === Number(candidatoId);
            const coincidePuesto = !puestoTrabajoId || Number(pos.puestoTrabajoId) === Number(puestoTrabajoId);
            const coincideEstado = !estado || estado === "todos" || pos.estado.toLowerCase() === estado.toLowerCase();
            const coincideEvaluador = !evaluador || evaluador === "todos" || (pos.evaluadorAsignado && pos.evaluadorAsignado.toLowerCase() === evaluador.toLowerCase());

            return coincideCandidato && coincidePuesto && coincideEstado && coincideEvaluador;
        });
    },

    obtenerPostulacionPorId(id) {
        const numId = Number(id);
        const lista = this.obtenerPostulaciones();
        return lista.find((p) => p.id === numId) || null;
    },

    insertarPostulacion(datos) {
        const candidatoId = Number(datos.candidatoId);
        const puestoTrabajoId = Number(datos.puestoTrabajoId);

        // Prevenir duplicado de postulación activa para el mismo puesto
        const existentes = this.obtenerPostulaciones({ candidatoId, puestoTrabajoId });
        const yaPostulado = existentes.some((p) => p.estado !== "Finalizado");
        if (yaPostulado) {
            const error = new Error("El candidato ya tiene una postulación activa para este puesto de trabajo.");
            error.codigo = "POSTULACION_DUPLICADA";
            throw error;
        }

        const fechaPostulacion = datos.fechaPostulacion || new Date().toISOString();
        const estado = datos.estado || "Postulado";
        const evaluadorAsignado = datos.evaluadorAsignado || "Sin Asignar";

        if (!useJsonFallback && sqliteDb) {
            const insert = sqliteDb.prepare(`
                INSERT INTO postulaciones (
                    candidatoId, puestoTrabajoId, estado, fechaPostulacion, evaluadorAsignado
                ) VALUES (?, ?, ?, ?, ?)
            `);

            const res = insert.run(candidatoId, puestoTrabajoId, estado, fechaPostulacion, evaluadorAsignado);
            return this.obtenerPostulacionPorId(Number(res.lastInsertRowid));
        }

        const nuevoId = (memoryStorePostulaciones && memoryStorePostulaciones.length > 0)
            ? Math.max(...memoryStorePostulaciones.map((p) => p.id)) + 1
            : 1;

        const nuevaPos = {
            id: nuevoId,
            candidatoId,
            puestoTrabajoId,
            estado,
            fechaPostulacion,
            evaluadorAsignado,
            fechaEntrevista: null,
            respuestaCandidato: "Pendiente",
            sugerenciaFecha: null,
            dictamenPsicologico: "Pendiente",
            observaciones: "",
            conclusiones: "",
            decisionFinal: "Pendiente",
        };

        if (!memoryStorePostulaciones) memoryStorePostulaciones = [];
        memoryStorePostulaciones.unshift(nuevaPos);
        persistJson("postulaciones");
        return this.obtenerPostulacionPorId(nuevoId);
    },

    actualizarPostulacion(id, datos) {
        const numId = Number(id);
        const existente = this.obtenerPostulacionPorId(numId);
        if (!existente) return null;

        if (!useJsonFallback && sqliteDb) {
            const campos = [];
            const valores = [];
            const camposPermitidos = [
                "estado", "evaluadorAsignado", "fechaEntrevista", "respuestaCandidato",
                "sugerenciaFecha", "dictamenPsicologico", "observaciones", "conclusiones",
                "decisionFinal"
            ];

            for (const campo of camposPermitidos) {
                if (datos[campo] !== undefined) {
                    campos.push(`${campo} = ?`);
                    valores.push(datos[campo]);
                }
            }

            if (campos.length > 0) {
                valores.push(numId);
                sqliteDb.prepare(`UPDATE postulaciones SET ${campos.join(", ")} WHERE id = ?;`).run(...valores);
            }
            return this.obtenerPostulacionPorId(numId);
        }

        const idx = (memoryStorePostulaciones || []).findIndex((p) => p.id === numId);
        if (idx !== -1) {
            memoryStorePostulaciones[idx] = { ...memoryStorePostulaciones[idx], ...datos, id: numId };
            persistJson("postulaciones");
            return this.obtenerPostulacionPorId(numId);
        }
        return null;
    },

    // ==================== USUARIOS / AUTENTICACIÓN ====================
    obtenerUsuarios() {
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT id, email, nombre, rol, candidatoId FROM usuarios ORDER BY id ASC;").all();
            return rows.map((r) => ({ ...r }));
        }
        return (memoryStoreUsuarios || []).map(({ password, ...u }) => u);
    },

    obtenerUsuarioPorEmail(email) {
        if (!email) return null;
        const limpio = email.toLowerCase().trim();
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT * FROM usuarios WHERE LOWER(email) = ?;").get(limpio);
            return row ? { ...row } : null;
        }
        return (memoryStoreUsuarios || []).find((u) => u.email.toLowerCase() === limpio) || null;
    },

    obtenerUsuarioPorId(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT id, email, nombre, rol, candidatoId FROM usuarios WHERE id = ?;").get(numId);
            return row ? { ...row } : null;
        }
        const u = (memoryStoreUsuarios || []).find((item) => item.id === numId);
        if (!u) return null;
        const { password, ...resto } = u;
        return resto;
    },

    insertarUsuario(datos) {
        const email = datos.email.toLowerCase().trim();
        const existente = this.obtenerUsuarioPorEmail(email);
        if (existente) {
            const error = new Error("El correo electrónico ya se encuentra registrado.");
            error.codigo = "EMAIL_DUPLICADO";
            throw error;
        }

        const password = datos.password || "password123";
        const nombre = datos.nombre.trim();
        const rol = datos.rol || "candidato";
        const candidatoId = datos.candidatoId ? Number(datos.candidatoId) : null;

        if (!useJsonFallback && sqliteDb) {
            const insert = sqliteDb.prepare(`
                INSERT INTO usuarios (email, password, nombre, rol, candidatoId)
                VALUES (?, ?, ?, ?, ?)
            `);
            const res = insert.run(email, password, nombre, rol, candidatoId);
            return this.obtenerUsuarioPorId(Number(res.lastInsertRowid));
        }

        const nuevoId = (memoryStoreUsuarios && memoryStoreUsuarios.length > 0)
            ? Math.max(...memoryStoreUsuarios.map((u) => u.id)) + 1
            : 1;

        const nuevoUsuario = {
            id: nuevoId,
            email,
            password,
            nombre,
            rol,
            candidatoId,
        };

        if (!memoryStoreUsuarios) memoryStoreUsuarios = [];
        memoryStoreUsuarios.push(nuevoUsuario);
        persistJson("usuarios");
        const { password: _, ...sinPass } = nuevoUsuario;
        return sinPass;
    },

    autenticarUsuario({ email, password }) {
        if (!email || !password) return null;
        const user = this.obtenerUsuarioPorEmail(email);
        if (!user) return null;
        if (user.password !== password) return null;

        const { password: _, ...usuarioAutenticado } = user;
        return usuarioAutenticado;
    },

    // ==================== SOLICITUDES DE INFORME ====================
    obtenerSolicitudesInforme({ busqueda, estado, candidatoId, puestoTrabajoId, urgencia, tipo } = {}) {
        let lista = [];
        if (!useJsonFallback && sqliteDb) {
            const rows = sqliteDb.prepare("SELECT * FROM solicitudes_informe ORDER BY id DESC;").all();
            lista = rows.map((r) => formatearInforme(r));
        } else {
            lista = (memoryStoreInformes || []).map((r) => formatearInforme(r));
        }

        return lista.filter((inf) => {
            const termino = busqueda ? busqueda.toLowerCase().trim() : "";
            const coincideTexto =
                !termino ||
                inf.candidatoNombre?.toLowerCase().includes(termino) ||
                inf.solicitante?.toLowerCase().includes(termino) ||
                inf.preguntas?.some((p) => p.texto?.toLowerCase().includes(termino));

            const coincideEstado =
                !estado ||
                estado === "todos" ||
                inf.estado?.toLowerCase() === estado.toLowerCase();

            const coincideCandidato =
                !candidatoId ||
                Number(inf.candidatoId) === Number(candidatoId);

            const coincidePuesto =
                !puestoTrabajoId ||
                Number(inf.puestoTrabajoId) === Number(puestoTrabajoId);

            const coincideTipo =
                !tipo ||
                tipo === "todos" ||
                (inf.tipo && inf.tipo.toLowerCase() === tipo.toLowerCase());

            const coincideUrgencia =
                !urgencia ||
                urgencia === "todas" ||
                inf.urgencia?.toLowerCase() === urgencia.toLowerCase();

            return coincideTexto && coincideEstado && coincideCandidato && coincidePuesto && coincideTipo && coincideUrgencia;
        });
    },

    obtenerSolicitudInformePorId(id) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            const row = sqliteDb.prepare("SELECT * FROM solicitudes_informe WHERE id = ?;").get(numId);
            return formatearInforme(row);
        }
        const inf = (memoryStoreInformes || []).find((i) => i.id === numId);
        return formatearInforme(inf);
    },

    insertarSolicitudInforme(datos) {
        const candidato = datos.candidatoId ? this.obtenerPorId(datos.candidatoId) : null;
        const candidatoNombre = datos.candidatoNombre || candidato?.nombre || null;
        const solicitante = datos.solicitante?.trim() || "Jefe de Área";
        const urgencia = datos.urgencia || "Media";
        const fechaLimite = datos.fechaLimite || null;
        const estado = datos.estado || "Abierta";
        const fechaCreacion = datos.fechaCreacion || new Date().toISOString();
        const puestoTrabajoId = datos.puestoTrabajoId ? Number(datos.puestoTrabajoId) : null;
        const tipo = datos.tipo || (puestoTrabajoId && !datos.candidatoId ? "puesto" : "candidato");
        const destinatarios = Array.isArray(datos.destinatarios) ? datos.destinatarios : ["analista", "evaluador"];

        const preguntas = (datos.preguntas || []).map((p, index) => {
            if (typeof p === "string") {
                return {
                    id: index + 1,
                    texto: p.trim(),
                    fecha: fechaCreacion,
                    creadaPor: solicitante,
                    respuestas: [],
                };
            }
            return {
                id: p.id || index + 1,
                texto: p.texto?.trim() || "",
                fecha: p.fecha || fechaCreacion,
                creadaPor: p.creadaPor || solicitante,
                respuestas: Array.isArray(p.respuestas) ? p.respuestas : [],
            };
        });

        if (!useJsonFallback && sqliteDb) {
            const stmt = sqliteDb.prepare(`
                INSERT INTO solicitudes_informe (
                    candidatoId, candidatoNombre, puestoTrabajoId, tipo,
                    solicitante, urgencia, fechaLimite, estado, fechaCreacion,
                    destinatarios, preguntas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const res = stmt.run(
                datos.candidatoId ? Number(datos.candidatoId) : null,
                candidatoNombre,
                puestoTrabajoId,
                tipo,
                solicitante,
                urgencia,
                fechaLimite,
                estado,
                fechaCreacion,
                JSON.stringify(destinatarios),
                JSON.stringify(preguntas)
            );

            return this.obtenerSolicitudInformePorId(Number(res.lastInsertRowid));
        }

        const nuevoId = (memoryStoreInformes && memoryStoreInformes.length > 0)
            ? Math.max(...memoryStoreInformes.map((i) => i.id)) + 1
            : 1;

        const nuevoInforme = {
            id: nuevoId,
            candidatoId: datos.candidatoId ? Number(datos.candidatoId) : null,
            candidatoNombre,
            puestoTrabajoId,
            tipo,
            solicitante,
            urgencia,
            fechaLimite,
            estado,
            fechaCreacion,
            destinatarios,
            preguntas,
        };

        if (!memoryStoreInformes) memoryStoreInformes = [];
        memoryStoreInformes.unshift(nuevoInforme);
        persistJson("informes");
        return formatearInforme(nuevoInforme);
    },

    agregarPreguntaInforme(id, { texto, creadaPor }) {
        const numId = Number(id);
        const informe = this.obtenerSolicitudInformePorId(numId);
        if (!informe) return null;

        const nuevaPregunta = {
            id: Date.now(),
            texto: texto.trim(),
            fecha: new Date().toISOString(),
            creadaPor: creadaPor || informe.solicitante || "Jefe de Área",
            respuestas: [],
        };

        const preguntasActualizadas = [...(informe.preguntas || []), nuevaPregunta];

        if (!useJsonFallback && sqliteDb) {
            sqliteDb.prepare("UPDATE solicitudes_informe SET preguntas = ? WHERE id = ?;").run(
                JSON.stringify(preguntasActualizadas),
                numId
            );
            return this.obtenerSolicitudInformePorId(numId);
        }

        const idx = (memoryStoreInformes || []).findIndex((i) => i.id === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].preguntas = preguntasActualizadas;
            persistJson("informes");
            return formatearInforme(memoryStoreInformes[idx]);
        }
        return null;
    },

    agregarRespuestaInforme(id, preguntaId, { autor, rol, texto }) {
        const numId = Number(id);
        const numPreguntaId = Number(preguntaId);
        const informe = this.obtenerSolicitudInformePorId(numId);
        if (!informe) return null;

        const nuevaRespuesta = {
            id: Date.now(),
            autor: autor || (rol === "evaluador" ? "Evaluador" : "Analista"),
            rol: rol || "evaluador",
            texto: texto.trim(),
            fecha: new Date().toISOString(),
        };

        const preguntasActualizadas = (informe.preguntas || []).map((p) => {
            if (Number(p.id) === numPreguntaId) {
                return {
                    ...p,
                    respuestas: [...(p.respuestas || []), nuevaRespuesta],
                };
            }
            return p;
        });

        if (!useJsonFallback && sqliteDb) {
            sqliteDb.prepare("UPDATE solicitudes_informe SET preguntas = ? WHERE id = ?;").run(
                JSON.stringify(preguntasActualizadas),
                numId
            );
            return this.obtenerSolicitudInformePorId(numId);
        }

        const idx = (memoryStoreInformes || []).findIndex((i) => i.id === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].preguntas = preguntasActualizadas;
            persistJson("informes");
            return formatearInforme(memoryStoreInformes[idx]);
        }
        return null;
    },

    actualizarEstadoSolicitudInforme(id, estado) {
        const numId = Number(id);
        if (!useJsonFallback && sqliteDb) {
            sqliteDb.prepare("UPDATE solicitudes_informe SET estado = ? WHERE id = ?;").run(estado, numId);
            return this.obtenerSolicitudInformePorId(numId);
        }
        const idx = (memoryStoreInformes || []).findIndex((i) => i.id === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].estado = estado;
            persistJson("informes");
            return formatearInforme(memoryStoreInformes[idx]);
        }
        return null;
    },

    // ==================== RESTABLECER DEMO ====================
    restablecerDemo() {
        if (!useJsonFallback && sqliteDb) {
            sqliteDb.exec("DELETE FROM candidatos;");
            sqliteDb.exec("DELETE FROM puestos_trabajo;");
            sqliteDb.exec("DELETE FROM postulaciones;");
            sqliteDb.exec("DELETE FROM solicitudes_informe;");
            sqliteDb.exec("DELETE FROM usuarios;");

            const insC = sqliteDb.prepare(`
                INSERT INTO candidatos (
                    id, nombre, rut, email, telefono, especialidad, planta, cargo,
                    familiaCargo, fecha, evaluador, estado, antecedentes, infoMedica,
                    experienciaLaboral, resultadoPsicologico, fechaEvaluacion, conclusiones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const c of CANDIDATOS_SEED) {
                insC.run(
                    c.id, c.nombre, c.rut, c.email || null, c.telefono || null,
                    c.especialidad, c.planta || null, c.cargo || null, c.familiaCargo || null,
                    c.fecha, c.evaluador || null, c.estado || "Pendiente",
                    c.antecedentes || "", c.infoMedica || "", c.experienciaLaboral || "",
                    c.resultadoPsicologico || "Pendiente", c.fechaEvaluacion || null, c.conclusiones || null
                );
            }

            const insP = sqliteDb.prepare(`
                INSERT INTO puestos_trabajo (
                    id, titulo, planta, familiaCargo, descripcion, requisitos,
                    vacantes, estado, creadoPor, fechaCreacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const p of PUESTOS_SEED) {
                insP.run(p.id, p.titulo, p.planta, p.familiaCargo, p.descripcion || "", p.requisitos || "", p.vacantes || 1, p.estado || "Abierto", p.creadoPor || "Jefe de Área", p.fechaCreacion);
            }

            const insPos = sqliteDb.prepare(`
                INSERT INTO postulaciones (
                    id, candidatoId, puestoTrabajoId, estado, fechaPostulacion,
                    evaluadorAsignado, fechaEntrevista, respuestaCandidato, sugerenciaFecha,
                    dictamenPsicologico, observaciones, conclusiones, decisionFinal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const pos of POSTULACIONES_SEED) {
                insPos.run(pos.id, pos.candidatoId, pos.puestoTrabajoId, pos.estado, pos.fechaPostulacion, pos.evaluadorAsignado || "Sin Asignar", pos.fechaEntrevista || null, pos.respuestaCandidato || "Pendiente", pos.sugerenciaFecha || null, pos.dictamenPsicologico || "Pendiente", pos.observaciones || "", pos.conclusiones || "", pos.decisionFinal || "Pendiente");
            }

            const insInf = sqliteDb.prepare(`
                INSERT INTO solicitudes_informe (
                    id, candidatoId, candidatoNombre, puestoTrabajoId, tipo,
                    solicitante, urgencia, fechaLimite, estado, fechaCreacion,
                    destinatarios, preguntas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const inf of INFORMES_SEED) {
                insInf.run(inf.id, inf.candidatoId || null, inf.candidatoNombre || null, inf.puestoTrabajoId || null, inf.tipo || "candidato", inf.solicitante, inf.urgencia, inf.fechaLimite, inf.estado, inf.fechaCreacion, JSON.stringify(inf.destinatarios), JSON.stringify(inf.preguntas));
            }

            const insU = sqliteDb.prepare(`
                INSERT INTO usuarios (id, email, password, nombre, rol, candidatoId)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            for (const u of USUARIOS_SEED) {
                insU.run(u.id, u.email, u.password, u.nombre, u.rol, u.candidatoId || null);
            }

            return {
                totalCandidatos: CANDIDATOS_SEED.length,
                totalPuestos: PUESTOS_SEED.length,
                totalPostulaciones: POSTULACIONES_SEED.length,
                totalInformes: INFORMES_SEED.length,
                totalUsuarios: USUARIOS_SEED.length,
            };
        }

        memoryStoreCandidatos = JSON.parse(JSON.stringify(CANDIDATOS_SEED));
        memoryStorePuestos = JSON.parse(JSON.stringify(PUESTOS_SEED));
        memoryStorePostulaciones = JSON.parse(JSON.stringify(POSTULACIONES_SEED));
        memoryStoreInformes = JSON.parse(JSON.stringify(INFORMES_SEED));
        memoryStoreUsuarios = JSON.parse(JSON.stringify(USUARIOS_SEED));
        persistJson();

        return {
            totalCandidatos: memoryStoreCandidatos.length,
            totalPuestos: memoryStorePuestos.length,
            totalPostulaciones: memoryStorePostulaciones.length,
            totalInformes: memoryStoreInformes.length,
            totalUsuarios: memoryStoreUsuarios.length,
        };
    },

    obtenerCatalogos() {
        return CATALOGOS_SEED;
    },
};
