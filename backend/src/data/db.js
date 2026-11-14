/**
 * Capa de persistencia en base de datos para Aqua-Contratos
 * Implementa almacenamiento NoSQL en MongoDB mediante Mongoose (async/await),
 * con respaldo automático en archivos JSON si el servicio MongoDB local no está activo.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
    CandidatoModel,
    PuestoTrabajoModel,
    PostulacionModel,
    SolicitudInformeModel,
    UsuarioModel,
} from "./models.js";
import {
    CANDIDATOS_SEED,
    CATALOGOS_SEED,
    INFORMES_SEED,
    PUESTOS_SEED,
    POSTULACIONES_SEED,
    USUARIOS_SEED,
} from "./seedData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aqua_contratos";

const JSON_CANDIDATOS_FILE = path.join(__dirname, "aqua_contratos.json");
const JSON_INFORMES_FILE = path.join(__dirname, "aqua_informes.json");
const JSON_PUESTOS_FILE = path.join(__dirname, "aqua_puestos.json");
const JSON_POSTULACIONES_FILE = path.join(__dirname, "aqua_postulaciones.json");
const JSON_USUARIOS_FILE = path.join(__dirname, "aqua_usuarios.json");

let useMongo = false;

// Stores en memoria para fallback JSON cuando mongod no está en ejecución
let memoryStoreCandidatos = [];
let memoryStoreInformes = [];
let memoryStorePuestos = [];
let memoryStorePostulaciones = [];
let memoryStoreUsuarios = [];

const limpiarRut = (rut) => (rut || "").replace(/[.-]/g, "").trim().toLowerCase();

function inicializarFallbackJson() {
    const cargarJSON = (archivo, datosIniciales) => {
        if (fs.existsSync(archivo)) {
            try {
                const parsed = JSON.parse(fs.readFileSync(archivo, "utf-8"));
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch {
                // Ignorar error y regenerar
            }
        }
        const copia = JSON.parse(JSON.stringify(datosIniciales));
        try {
            fs.writeFileSync(archivo, JSON.stringify(copia, null, 2), "utf-8");
        } catch {
            // Ignorar error de escritura
        }
        return copia;
    };

    memoryStoreCandidatos = cargarJSON(JSON_CANDIDATOS_FILE, CANDIDATOS_SEED);
    memoryStorePuestos = cargarJSON(JSON_PUESTOS_FILE, PUESTOS_SEED);
    memoryStorePostulaciones = cargarJSON(JSON_POSTULACIONES_FILE, POSTULACIONES_SEED);
    memoryStoreInformes = cargarJSON(JSON_INFORMES_FILE, INFORMES_SEED);
    memoryStoreUsuarios = cargarJSON(JSON_USUARIOS_FILE, USUARIOS_SEED);

    // Asegurar que todos los usuarios semilla existan en el fallback
    for (const uSeed of USUARIOS_SEED) {
        if (!memoryStoreUsuarios.some((u) => u.email.toLowerCase() === uSeed.email.toLowerCase())) {
            memoryStoreUsuarios.push({ ...uSeed });
        }
    }
}

function persistJson(tipo) {
    if (useMongo) return;
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

async function poblarSemillasMongo() {
    const countCandidatos = await CandidatoModel.countDocuments();
    if (countCandidatos === 0) {
        await CandidatoModel.insertMany(CANDIDATOS_SEED);
    }

    const countPuestos = await PuestoTrabajoModel.countDocuments();
    if (countPuestos === 0) {
        await PuestoTrabajoModel.insertMany(PUESTOS_SEED);
    }

    const countPostulaciones = await PostulacionModel.countDocuments();
    if (countPostulaciones === 0) {
        await PostulacionModel.insertMany(POSTULACIONES_SEED);
    }

    const countInformes = await SolicitudInformeModel.countDocuments();
    if (countInformes === 0) {
        await SolicitudInformeModel.insertMany(INFORMES_SEED);
    }

    const countUsuarios = await UsuarioModel.countDocuments();
    if (countUsuarios === 0) {
        await UsuarioModel.insertMany(USUARIOS_SEED);
    } else {
        // Garantizar que los 10 postulantes semilla tengan su cuenta de usuario
        for (const uSeed of USUARIOS_SEED) {
            const existe = await UsuarioModel.findOne({ email: uSeed.email.toLowerCase() });
            if (!existe) {
                await UsuarioModel.create(uSeed);
            }
        }
    }
}

// Inicializar conexión a MongoDB (con fallback inmediato si mongod no responde)
inicializarFallbackJson();

try {
    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
    });
    useMongo = true;
    await poblarSemillasMongo();
} catch (err) {
    useMongo = false;
    console.warn(`⚠️ MongoDB no disponible en ${MONGODB_URI} (${err.message}). Operando con respaldo local JSON.`);
}

async function siguienteIdMongo(Modelo, fallbackArray) {
    if (useMongo) {
        const ultimo = await Modelo.findOne().sort({ id: -1 }).lean();
        return ultimo && ultimo.id ? Number(ultimo.id) + 1 : 1;
    }
    return fallbackArray && fallbackArray.length > 0
        ? Math.max(...fallbackArray.map((item) => Number(item.id) || 0)) + 1
        : 1;
}

export const db = {
    isUsingMongo() {
        return useMongo && mongoose.connection.readyState === 1;
    },

    isUsingSQLite() {
        return this.isUsingMongo();
    },

    getMongoUri() {
        return MONGODB_URI;
    },

    getDbFilePath() {
        return this.isUsingMongo() ? MONGODB_URI : JSON_CANDIDATOS_FILE;
    },

    // ==================== CANDIDATOS / POSTULANTES (A2) ====================
    async obtenerTodos() {
        if (this.isUsingMongo()) {
            const docs = await CandidatoModel.find().sort({ id: -1 });
            return docs.map((d) => d.toJSON());
        }
        return [...memoryStoreCandidatos];
    },

    async obtenerPorId(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const doc = await CandidatoModel.findOne({ id: numId });
            return doc ? doc.toJSON() : null;
        }
        return memoryStoreCandidatos.find((c) => Number(c.id) === numId) || null;
    },

    async buscarPorRut(rut) {
        if (!rut) return null;
        const rutObjetivo = limpiarRut(rut);

        if (this.isUsingMongo()) {
            const todos = await CandidatoModel.find();
            const encontrado = todos.find((c) => limpiarRut(c.rut) === rutObjetivo);
            return encontrado ? encontrado.toJSON() : null;
        }

        return memoryStoreCandidatos.find((c) => limpiarRut(c.rut) === rutObjetivo) || null;
    },

    async insertarCandidato(datos) {
        const fecha = datos.fecha ? new Date(datos.fecha).toISOString() : new Date().toISOString();
        const antecedentes = datos.antecedentes?.trim() || "";
        const infoMedica = datos.infoMedica?.trim() || "";
        const experienciaLaboral = datos.experienciaLaboral?.trim() || "";
        const email = datos.email?.trim().toLowerCase() || "";
        const telefono = datos.telefono?.trim() || "";
        const resultadoPsicologico = datos.resultadoPsicologico || "Pendiente";
        const evaluador = datos.evaluador?.trim() || "Sin Asignar";
        const estado = datos.estado?.trim() || "Pendiente";
        const cargo = datos.cargo?.trim() || "Postulante General";
        const familiaCargo = datos.familiaCargo?.trim() || "Operaciones Productivas";
        const planta = datos.planta?.trim() || null;

        const nombres =
            datos.nombres?.trim() ||
            (datos.nombre
                ? datos.nombre.split(" ").slice(0, -2).join(" ") || datos.nombre.split(" ")[0]
                : "");
        const apellidos =
            datos.apellidos?.trim() ||
            (datos.nombre ? datos.nombre.split(" ").slice(-2).join(" ") : "");
        const nombre = datos.nombre?.trim() || `${nombres} ${apellidos}`.trim() || "Postulante";
        const direccion = datos.direccion?.trim() || "";
        const comuna = datos.comuna?.trim() || planta || "Puerto Montt";
        const fecha_nacimiento = datos.fecha_nacimiento || "";
        const cv_pdf =
            datos.cv_pdf?.trim() ||
            (nombre
                ? `cv_${nombre.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`
                : "cv_postulante.pdf");
        const cvDataUrl = datos.cvDataUrl || "";

        const nuevoId = await siguienteIdMongo(CandidatoModel, memoryStoreCandidatos);

        const nuevoCandidato = {
            id: nuevoId,
            nombre,
            nombres,
            apellidos,
            rut: datos.rut.trim(),
            direccion,
            comuna,
            fecha_nacimiento,
            cv_pdf,
            cvDataUrl,
            email,
            telefono,
            especialidad: (datos.especialidad || cargo).trim(),
            planta,
            cargo,
            familiaCargo,
            fecha,
            evaluador,
            estado,
            antecedentes,
            infoMedica,
            experienciaLaboral,
            resultadoPsicologico,
            fechaEvaluacion: datos.fechaEvaluacion || null,
            conclusiones: datos.conclusiones || null,
        };

        if (this.isUsingMongo()) {
            const creado = await CandidatoModel.create(nuevoCandidato);
            return creado.toJSON();
        }

        memoryStoreCandidatos.unshift(nuevoCandidato);
        persistJson("candidatos");
        return nuevoCandidato;
    },

    async actualizarCandidato(id, datosActualizados) {
        const numId = Number(id);
        const camposValidos = [
            "nombre", "nombres", "apellidos", "rut", "direccion", "comuna",
            "fecha_nacimiento", "cv_pdf", "cvDataUrl", "email", "telefono",
            "especialidad", "planta", "cargo", "familiaCargo", "evaluador",
            "estado", "antecedentes", "infoMedica", "experienciaLaboral",
            "resultadoPsicologico", "fechaEvaluacion", "conclusiones",
        ];

        const payload = {};
        for (const campo of camposValidos) {
            if (datosActualizados[campo] !== undefined) {
                payload[campo] = datosActualizados[campo];
            }
        }

        if (this.isUsingMongo()) {
            const doc = await CandidatoModel.findOneAndUpdate(
                { id: numId },
                { $set: payload },
                { new: true }
            );
            return doc ? doc.toJSON() : null;
        }

        const idx = memoryStoreCandidatos.findIndex((c) => Number(c.id) === numId);
        if (idx !== -1) {
            memoryStoreCandidatos[idx] = { ...memoryStoreCandidatos[idx], ...payload, id: numId };
            persistJson("candidatos");
            return memoryStoreCandidatos[idx];
        }
        return null;
    },

    async eliminarCandidato(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const res = await CandidatoModel.deleteOne({ id: numId });
            return res.deletedCount > 0;
        }

        const idx = memoryStoreCandidatos.findIndex((c) => Number(c.id) === numId);
        if (idx === -1) return false;
        memoryStoreCandidatos.splice(idx, 1);
        persistJson("candidatos");
        return true;
    },

    // ==================== PUESTOS DE TRABAJO (Ofertas Laborales) ====================
    async obtenerPuestos({ busqueda, planta, familiaCargo, estado } = {}) {
        let lista = [];
        if (this.isUsingMongo()) {
            const docs = await PuestoTrabajoModel.find().sort({ id: -1 });
            lista = docs.map((d) => d.toJSON());
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

    async obtenerPuestoPorId(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const doc = await PuestoTrabajoModel.findOne({ id: numId });
            return doc ? doc.toJSON() : null;
        }
        return (memoryStorePuestos || []).find((p) => Number(p.id) === numId) || null;
    },

    async insertarPuesto(datos) {
        const fechaCreacion = datos.fechaCreacion || new Date().toISOString();
        const vacantes = Number(datos.vacantes) || 1;
        const estado = datos.estado || "Abierto";
        const creadoPor = datos.creadoPor || "Jefe de Área";
        const nuevoId = await siguienteIdMongo(PuestoTrabajoModel, memoryStorePuestos);

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

        if (this.isUsingMongo()) {
            const creado = await PuestoTrabajoModel.create(nuevoPuesto);
            return creado.toJSON();
        }

        if (!memoryStorePuestos) memoryStorePuestos = [];
        memoryStorePuestos.unshift(nuevoPuesto);
        persistJson("puestos");
        return nuevoPuesto;
    },

    async actualizarPuesto(id, datos) {
        const numId = Number(id);
        const camposPermitidos = ["titulo", "planta", "familiaCargo", "descripcion", "requisitos", "vacantes", "estado"];
        const payload = {};
        for (const campo of camposPermitidos) {
            if (datos[campo] !== undefined) {
                payload[campo] = campo === "vacantes" ? Number(datos[campo]) : datos[campo];
            }
        }

        if (this.isUsingMongo()) {
            const doc = await PuestoTrabajoModel.findOneAndUpdate(
                { id: numId },
                { $set: payload },
                { new: true }
            );
            return doc ? doc.toJSON() : null;
        }

        const idx = (memoryStorePuestos || []).findIndex((p) => Number(p.id) === numId);
        if (idx !== -1) {
            memoryStorePuestos[idx] = { ...memoryStorePuestos[idx], ...payload, id: numId };
            persistJson("puestos");
            return memoryStorePuestos[idx];
        }
        return null;
    },

    async eliminarPuesto(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const res = await PuestoTrabajoModel.deleteOne({ id: numId });
            return res.deletedCount > 0;
        }

        const idx = (memoryStorePuestos || []).findIndex((p) => Number(p.id) === numId);
        if (idx === -1) return false;
        memoryStorePuestos.splice(idx, 1);
        persistJson("puestos");
        return true;
    },

    // ==================== POSTULACIONES ====================
    async obtenerPostulaciones({ candidatoId, puestoTrabajoId, estado, evaluador } = {}) {
        let postulacionesRaw = [];
        let candidatosRaw = [];
        let puestosRaw = [];

        if (this.isUsingMongo()) {
            const [posDocs, candDocs, puesDocs] = await Promise.all([
                PostulacionModel.find().sort({ id: -1 }),
                CandidatoModel.find(),
                PuestoTrabajoModel.find(),
            ]);
            postulacionesRaw = posDocs.map((d) => d.toJSON());
            candidatosRaw = candDocs.map((d) => d.toJSON());
            puestosRaw = puesDocs.map((d) => d.toJSON());
        } else {
            postulacionesRaw = [...(memoryStorePostulaciones || [])];
            candidatosRaw = [...(memoryStoreCandidatos || [])];
            puestosRaw = [...(memoryStorePuestos || [])];
        }

        const lista = postulacionesRaw.map((pos) => {
            const c = candidatosRaw.find((item) => Number(item.id) === Number(pos.candidatoId));
            const p = puestosRaw.find((item) => Number(item.id) === Number(pos.puestoTrabajoId));
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

        return lista.filter((pos) => {
            const coincideCandidato = !candidatoId || Number(pos.candidatoId) === Number(candidatoId);
            const coincidePuesto = !puestoTrabajoId || Number(pos.puestoTrabajoId) === Number(puestoTrabajoId);
            const coincideEstado = !estado || estado === "todos" || pos.estado.toLowerCase() === estado.toLowerCase();
            const coincideEvaluador =
                !evaluador ||
                evaluador === "todos" ||
                (pos.evaluadorAsignado && pos.evaluadorAsignado.toLowerCase() === evaluador.toLowerCase());

            return coincideCandidato && coincidePuesto && coincideEstado && coincideEvaluador;
        });
    },

    async obtenerPostulacionPorId(id) {
        const numId = Number(id);
        const lista = await this.obtenerPostulaciones();
        return lista.find((p) => Number(p.id) === numId) || null;
    },

    async insertarPostulacion(datos) {
        const candidatoId = Number(datos.candidatoId);
        const puestoTrabajoId = Number(datos.puestoTrabajoId);

        const existentes = await this.obtenerPostulaciones({ candidatoId, puestoTrabajoId });
        const yaPostulado = existentes.some((p) => p.estado !== "Finalizado");
        if (yaPostulado) {
            const error = new Error("El candidato ya tiene una postulación activa para este puesto de trabajo.");
            error.codigo = "POSTULACION_DUPLICADA";
            throw error;
        }

        const fechaPostulacion = datos.fechaPostulacion || new Date().toISOString();
        const estado = datos.estado || "Postulado";
        const evaluadorAsignado = datos.evaluadorAsignado || "Sin Asignar";
        const nuevoId = await siguienteIdMongo(PostulacionModel, memoryStorePostulaciones);

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

        if (this.isUsingMongo()) {
            await PostulacionModel.create(nuevaPos);
            return this.obtenerPostulacionPorId(nuevoId);
        }

        if (!memoryStorePostulaciones) memoryStorePostulaciones = [];
        memoryStorePostulaciones.unshift(nuevaPos);
        persistJson("postulaciones");
        return this.obtenerPostulacionPorId(nuevoId);
    },

    async actualizarPostulacion(id, datos) {
        const numId = Number(id);
        const camposPermitidos = [
            "estado", "evaluadorAsignado", "fechaEntrevista", "respuestaCandidato",
            "sugerenciaFecha", "dictamenPsicologico", "observaciones", "conclusiones",
            "decisionFinal",
        ];

        const payload = {};
        for (const campo of camposPermitidos) {
            if (datos[campo] !== undefined) {
                payload[campo] = datos[campo];
            }
        }

        if (this.isUsingMongo()) {
            const doc = await PostulacionModel.findOneAndUpdate(
                { id: numId },
                { $set: payload },
                { new: true }
            );
            if (!doc) return null;
            return this.obtenerPostulacionPorId(numId);
        }

        const idx = (memoryStorePostulaciones || []).findIndex((p) => Number(p.id) === numId);
        if (idx !== -1) {
            memoryStorePostulaciones[idx] = { ...memoryStorePostulaciones[idx], ...payload, id: numId };
            persistJson("postulaciones");
            return this.obtenerPostulacionPorId(numId);
        }
        return null;
    },

    // ==================== USUARIOS / AUTENTICACIÓN (B1 / B2) ====================
    async obtenerUsuarios() {
        if (this.isUsingMongo()) {
            const docs = await UsuarioModel.find().sort({ id: 1 });
            return docs.map((d) => {
                const { password: _, ...resto } = d.toJSON();
                return resto;
            });
        }
        return (memoryStoreUsuarios || []).map(({ password: _, ...u }) => u);
    },

    async obtenerUsuarioPorEmail(email) {
        if (!email) return null;
        const limpio = email.toLowerCase().trim();
        if (this.isUsingMongo()) {
            const doc = await UsuarioModel.findOne({ email: limpio });
            return doc ? doc.toJSON() : null;
        }
        return (memoryStoreUsuarios || []).find((u) => u.email.toLowerCase() === limpio) || null;
    },

    async obtenerUsuarioPorCandidatoId(candidatoId) {
        if (!candidatoId) return null;
        const numId = Number(candidatoId);
        if (this.isUsingMongo()) {
            const doc = await UsuarioModel.findOne({ candidatoId: numId });
            return doc ? doc.toJSON() : null;
        }
        return (memoryStoreUsuarios || []).find((u) => Number(u.candidatoId) === numId) || null;
    },

    async obtenerUsuarioPorId(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const doc = await UsuarioModel.findOne({ id: numId });
            if (!doc) return null;
            const { password: _, ...resto } = doc.toJSON();
            return resto;
        }
        const u = (memoryStoreUsuarios || []).find((item) => Number(item.id) === numId);
        if (!u) return null;
        const { password: _, ...resto } = u;
        return resto;
    },

    async insertarUsuario(datos) {
        const email = datos.email.toLowerCase().trim();
        const existente = await this.obtenerUsuarioPorEmail(email);
        if (existente) {
            const error = new Error("El correo electrónico ya se encuentra registrado.");
            error.codigo = "EMAIL_DUPLICADO";
            throw error;
        }

        const password = datos.password || "password123";
        const nombre = datos.nombre.trim();
        const rol = datos.rol || "candidato";
        const candidatoId = datos.candidatoId ? Number(datos.candidatoId) : null;
        const area = datos.area || null;
        const nuevoId = await siguienteIdMongo(UsuarioModel, memoryStoreUsuarios);

        const nuevoUsuario = {
            id: nuevoId,
            email,
            password,
            nombre,
            rol,
            candidatoId,
            area,
        };

        if (this.isUsingMongo()) {
            const creado = await UsuarioModel.create(nuevoUsuario);
            const { password: _, ...sinPass } = creado.toJSON();
            return sinPass;
        }

        if (!memoryStoreUsuarios) memoryStoreUsuarios = [];
        memoryStoreUsuarios.push(nuevoUsuario);
        persistJson("usuarios");
        const { password: _, ...sinPass } = nuevoUsuario;
        return sinPass;
    },

    /**
     * Autentica un usuario permitiendo ingresar Email o RUT + Contraseña (B2).
     */
    async autenticarUsuario({ email, rut, identificador, password }) {
        const idInput = (identificador || email || rut || "").trim();
        if (!idInput || !password) return null;

        let user = await this.obtenerUsuarioPorEmail(idInput);

        // Si no se encontró por email, buscar si ingresó su RUT de postulante
        if (!user) {
            const candidatoPorRut = await this.buscarPorRut(idInput);
            if (candidatoPorRut) {
                user = await this.obtenerUsuarioPorCandidatoId(candidatoPorRut.id);
                if (!user && candidatoPorRut.email) {
                    user = await this.obtenerUsuarioPorEmail(candidatoPorRut.email);
                }
            }
        }

        if (!user) return null;
        if (user.password !== password) return null;

        const { password: _, ...usuarioAutenticado } = user;
        return usuarioAutenticado;
    },

    // ==================== SOLICITUDES DE INFORME ====================
    async obtenerSolicitudesInforme({ busqueda, estado, candidatoId, puestoTrabajoId, urgencia, tipo } = {}) {
        let lista = [];
        if (this.isUsingMongo()) {
            const docs = await SolicitudInformeModel.find().sort({ id: -1 });
            lista = docs.map((d) => d.toJSON());
        } else {
            lista = [...(memoryStoreInformes || [])];
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

    async obtenerSolicitudInformePorId(id) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const doc = await SolicitudInformeModel.findOne({ id: numId });
            return doc ? doc.toJSON() : null;
        }
        return (memoryStoreInformes || []).find((i) => Number(i.id) === numId) || null;
    },

    async insertarSolicitudInforme(datos) {
        const candidato = datos.candidatoId ? await this.obtenerPorId(datos.candidatoId) : null;
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

        const nuevoId = await siguienteIdMongo(SolicitudInformeModel, memoryStoreInformes);

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

        if (this.isUsingMongo()) {
            const creado = await SolicitudInformeModel.create(nuevoInforme);
            return creado.toJSON();
        }

        if (!memoryStoreInformes) memoryStoreInformes = [];
        memoryStoreInformes.unshift(nuevoInforme);
        persistJson("informes");
        return nuevoInforme;
    },

    async agregarPreguntaInforme(id, { texto, creadaPor }) {
        const numId = Number(id);
        const informe = await this.obtenerSolicitudInformePorId(numId);
        if (!informe) return null;

        const nuevaPregunta = {
            id: Date.now(),
            texto: texto.trim(),
            fecha: new Date().toISOString(),
            creadaPor: creadaPor || informe.solicitante || "Jefe de Área",
            respuestas: [],
        };

        const preguntasActualizadas = [...(informe.preguntas || []), nuevaPregunta];

        if (this.isUsingMongo()) {
            const doc = await SolicitudInformeModel.findOneAndUpdate(
                { id: numId },
                { $set: { preguntas: preguntasActualizadas } },
                { new: true }
            );
            return doc ? doc.toJSON() : null;
        }

        const idx = (memoryStoreInformes || []).findIndex((i) => Number(i.id) === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].preguntas = preguntasActualizadas;
            persistJson("informes");
            return memoryStoreInformes[idx];
        }
        return null;
    },

    async agregarRespuestaInforme(id, preguntaId, { autor, rol, texto }) {
        const numId = Number(id);
        const numPreguntaId = Number(preguntaId);
        const informe = await this.obtenerSolicitudInformePorId(numId);
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

        if (this.isUsingMongo()) {
            const doc = await SolicitudInformeModel.findOneAndUpdate(
                { id: numId },
                { $set: { preguntas: preguntasActualizadas } },
                { new: true }
            );
            return doc ? doc.toJSON() : null;
        }

        const idx = (memoryStoreInformes || []).findIndex((i) => Number(i.id) === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].preguntas = preguntasActualizadas;
            persistJson("informes");
            return memoryStoreInformes[idx];
        }
        return null;
    },

    async actualizarEstadoSolicitudInforme(id, estado) {
        const numId = Number(id);
        if (this.isUsingMongo()) {
            const doc = await SolicitudInformeModel.findOneAndUpdate(
                { id: numId },
                { $set: { estado } },
                { new: true }
            );
            return doc ? doc.toJSON() : null;
        }

        const idx = (memoryStoreInformes || []).findIndex((i) => Number(i.id) === numId);
        if (idx !== -1) {
            memoryStoreInformes[idx].estado = estado;
            persistJson("informes");
            return memoryStoreInformes[idx];
        }
        return null;
    },

    // ==================== RESTABLECER DEMO ====================
    async restablecerDemo() {
        if (this.isUsingMongo()) {
            await Promise.all([
                CandidatoModel.deleteMany({}),
                PuestoTrabajoModel.deleteMany({}),
                PostulacionModel.deleteMany({}),
                SolicitudInformeModel.deleteMany({}),
                UsuarioModel.deleteMany({}),
            ]);

            await Promise.all([
                CandidatoModel.insertMany(CANDIDATOS_SEED),
                PuestoTrabajoModel.insertMany(PUESTOS_SEED),
                PostulacionModel.insertMany(POSTULACIONES_SEED),
                SolicitudInformeModel.insertMany(INFORMES_SEED),
                UsuarioModel.insertMany(USUARIOS_SEED),
            ]);

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
