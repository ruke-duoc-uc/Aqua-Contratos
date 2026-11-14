/**
 * Esquemas y Modelos de Mongoose para Aqua-Contratos (MongoDB)
 * Cada colección mantiene un campo numérico 'id' indexado además de '_id'
 * para compatibilidad total con los controladores REST y el frontend.
 */
import mongoose from "mongoose";

const toCleanObject = {
    virtuals: false,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
        return ret;
    },
};

// 1. Esquema de Candidatos / Postulantes (A2: Datos Postulantes)
const candidatoSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        nombre: { type: String, required: true, trim: true },
        nombres: { type: String, default: "", trim: true },
        apellidos: { type: String, default: "", trim: true },
        rut: { type: String, required: true, unique: true, trim: true },
        email: { type: String, default: "", trim: true, lowercase: true },
        telefono: { type: String, default: "", trim: true },
        direccion: { type: String, default: "", trim: true },
        comuna: { type: String, default: "Puerto Montt", trim: true },
        fecha_nacimiento: { type: String, default: "" },
        cv_pdf: { type: String, default: "" },
        cvDataUrl: { type: String, default: "" },
        especialidad: { type: String, default: "Postulante General", trim: true },
        planta: { type: String, default: null },
        cargo: { type: String, default: "Postulante General", trim: true },
        familiaCargo: { type: String, default: "Operaciones Productivas", trim: true },
        fecha: { type: String, required: true },
        evaluador: { type: String, default: "Sin Asignar" },
        estado: { type: String, default: "Pendiente" },
        antecedentes: { type: String, default: "" },
        infoMedica: { type: String, default: "" },
        experienciaLaboral: { type: String, default: "" },
        resultadoPsicologico: { type: String, default: "Pendiente" },
        fechaEvaluacion: { type: String, default: null },
        conclusiones: { type: String, default: null },
    },
    {
        collection: "candidatos",
        toJSON: toCleanObject,
        toObject: toCleanObject,
    }
);

// 2. Esquema de Puestos de Trabajo (Ofertas Laborales)
const puestoTrabajoSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        titulo: { type: String, required: true, trim: true },
        planta: { type: String, required: true, trim: true },
        familiaCargo: { type: String, required: true, trim: true },
        descripcion: { type: String, default: "" },
        requisitos: { type: String, default: "" },
        vacantes: { type: Number, default: 1 },
        estado: { type: String, default: "Abierto" },
        creadoPor: { type: String, default: "Jefe de Área" },
        fechaCreacion: { type: String, required: true },
    },
    {
        collection: "puestos_trabajo",
        toJSON: toCleanObject,
        toObject: toCleanObject,
    }
);

// 3. Esquema de Postulaciones (Vínculo Candidato + Puesto)
const postulacionSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        candidatoId: { type: Number, required: true, index: true },
        puestoTrabajoId: { type: Number, required: true, index: true },
        estado: { type: String, default: "Postulado" },
        fechaPostulacion: { type: String, required: true },
        evaluadorAsignado: { type: String, default: "Sin Asignar" },
        fechaEntrevista: { type: String, default: null },
        respuestaCandidato: { type: String, default: "Pendiente" },
        sugerenciaFecha: { type: String, default: null },
        dictamenPsicologico: { type: String, default: "Pendiente" },
        observaciones: { type: String, default: "" },
        conclusiones: { type: String, default: "" },
        decisionFinal: { type: String, default: "Pendiente" },
    },
    {
        collection: "postulaciones",
        toJSON: toCleanObject,
        toObject: toCleanObject,
    }
);

// 4. Esquema de Solicitudes de Informe (Jefatura)
const solicitudInformeSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        candidatoId: { type: Number, default: null },
        candidatoNombre: { type: String, default: null },
        puestoTrabajoId: { type: Number, default: null },
        tipo: { type: String, default: "candidato" },
        solicitante: { type: String, required: true },
        urgencia: { type: String, required: true },
        fechaLimite: { type: String, default: null },
        estado: { type: String, required: true, default: "Abierta" },
        fechaCreacion: { type: String, required: true },
        destinatarios: { type: [String], default: ["analista", "evaluador"] },
        preguntas: { type: Array, default: [] },
    },
    {
        collection: "solicitudes_informe",
        toJSON: toCleanObject,
        toObject: toCleanObject,
    }
);

// 5. Esquema de Usuarios y Autenticación (B1 / B2)
const usuarioSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        nombre: { type: String, required: true, trim: true },
        rol: { type: String, required: true, default: "candidato" },
        candidatoId: { type: Number, default: null },
        area: { type: String, default: null },
    },
    {
        collection: "usuarios",
        toJSON: toCleanObject,
        toObject: toCleanObject,
    }
);

export const CandidatoModel =
    mongoose.models.Candidato || mongoose.model("Candidato", candidatoSchema);
export const PuestoTrabajoModel =
    mongoose.models.PuestoTrabajo || mongoose.model("PuestoTrabajo", puestoTrabajoSchema);
export const PostulacionModel =
    mongoose.models.Postulacion || mongoose.model("Postulacion", postulacionSchema);
export const SolicitudInformeModel =
    mongoose.models.SolicitudInforme || mongoose.model("SolicitudInforme", solicitudInformeSchema);
export const UsuarioModel =
    mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema);
