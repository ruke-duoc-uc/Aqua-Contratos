/**
 * Servicio de Almacenamiento y Sincronización Global de Postulaciones
 * Permite gestionar las postulaciones por cargo activo, fases de entrevista y encargados.
 */

export const STORAGE_KEY_POSTULACIONES = "aqua_contratos_postulaciones_global_v1";
export const EVENTO_ACTUALIZACION_POSTULACIONES = "aqua_contratos_postulaciones_actualizadas";

export const FASES_VALIDAS = [
    "en entrevista",
    "aceptado",
    "rechazado",
    "esperando respuesta",
];

export const POSTULACIONES_BASE = [
    {
        id: 1,
        puestoId: 1,
        puestoTitulo: "Desarrollador Full Stack",
        planta: "Puerto Montt",
        candidatoId: 1,
        nombre: "Luis Andrés Mancilla Peralta",
        rut: "21.756.200-7",
        fase: "en entrevista",
        entrevista: "22/10/2026 15:00",
        encargado: "Amaro Villalobos Caseres",
        cv_pdf: "cv_luis_mancilla.pdf",
        fechaPostulacion: "2026-10-05T10:00:00.000Z",
        dictamenPsicologico: "Pendiente",
        conclusiones: "Entrevista técnica favorable. Pendiente informe psicolaboral.",
    },
    {
        id: 2,
        puestoId: 1,
        puestoTitulo: "Desarrollador Full Stack",
        planta: "Puerto Montt",
        candidatoId: 7,
        nombre: "Diego Esteban Andrade Contreras",
        rut: "19.123.456-8",
        fase: "esperando respuesta",
        entrevista: "Pendiente de confirmación",
        encargado: "Amaro Villalobos Caseres",
        cv_pdf: "cv_diego_andrade.pdf",
        fechaPostulacion: "2026-10-01T09:00:00.000Z",
        dictamenPsicologico: "Pendiente",
        conclusiones: "",
    },
    {
        id: 3,
        puestoId: 2,
        puestoTitulo: "Prevencionista de Faena",
        planta: "Osorno",
        candidatoId: 2,
        nombre: "Camila Ignacia Soto Vargas",
        rut: "20.345.118-3",
        fase: "en entrevista",
        entrevista: "24/10/2026 10:30",
        encargado: "Carolina Díaz Núñez",
        cv_pdf: "cv_camila_soto.pdf",
        fechaPostulacion: "2026-10-04T11:30:00.000Z",
        dictamenPsicologico: "Pendiente",
        conclusiones: "Se reprogramó fecha a solicitud de la postulante.",
    },
    {
        id: 4,
        puestoId: 2,
        puestoTitulo: "Prevencionista de Faena",
        planta: "Osorno",
        candidatoId: 10,
        nombre: "Constanza Elena Vidal Bahamonde",
        rut: "19.765.432-9",
        fase: "aceptado",
        entrevista: "20/10/2026 09:00",
        encargado: "Carolina Díaz Núñez",
        cv_pdf: "cv_constanza_vidal.pdf",
        fechaPostulacion: "2026-09-28T08:00:00.000Z",
        dictamenPsicologico: "Recomendado",
        conclusiones: "Excelente desempeño y ajuste al perfil de seguridad en faena.",
    },
    {
        id: 5,
        puestoId: 3,
        puestoTitulo: "Técnico de Mantenimiento",
        planta: "Puerto Varas",
        candidatoId: 3,
        nombre: "Matías Nicolás Rojas Aguilar",
        rut: "19.872.456-K",
        fase: "en entrevista",
        entrevista: "25/10/2026 11:00",
        encargado: "Amaro Villalobos Caseres",
        cv_pdf: "cv_matias_rojas.pdf",
        fechaPostulacion: "2026-10-04T15:00:00.000Z",
        dictamenPsicologico: "Pendiente",
        conclusiones: "Prueba psicométrica agendada en faena.",
    },
    {
        id: 6,
        puestoId: 3,
        puestoTitulo: "Técnico de Mantenimiento",
        planta: "Puerto Varas",
        candidatoId: 5,
        nombre: "Sebastián Alonso Oyarzún Leal",
        rut: "18.456.321-2",
        fase: "rechazado",
        entrevista: "18/10/2026 16:30",
        encargado: "Amaro Villalobos Caseres",
        cv_pdf: "cv_sebastian_oyarzun.pdf",
        fechaPostulacion: "2026-10-02T10:00:00.000Z",
        dictamenPsicologico: "No recomendado",
        conclusiones: "No cumple con la experiencia requerida en bombas industriales.",
    },
    {
        id: 7,
        puestoId: 4,
        puestoTitulo: "Asistente Administrativo",
        planta: "Puerto Montt",
        candidatoId: 4,
        nombre: "Valentina Paz Cárdenas Ruiz",
        rut: "21.034.789-5",
        fase: "aceptado",
        entrevista: "19/10/2026 10:00",
        encargado: "Felipe Muñoz Parra",
        cv_pdf: "cv_valentina_cardenas.pdf",
        fechaPostulacion: "2026-10-03T09:15:00.000Z",
        dictamenPsicologico: "Recomendado",
        conclusiones: "Alta capacidad de trabajo en equipo y apego a protocolos de la empresa.",
    },
    {
        id: 8,
        puestoId: 4,
        puestoTitulo: "Asistente Administrativo",
        planta: "Puerto Montt",
        candidatoId: 8,
        nombre: "Francisca Andrea Mayorga Tapia",
        rut: "21.456.098-6",
        fase: "esperando respuesta",
        entrevista: "26/10/2026 12:00",
        encargado: "Carolina Díaz Núñez",
        cv_pdf: "cv_francisca_mayorga.pdf",
        fechaPostulacion: "2026-09-30T10:00:00.000Z",
        dictamenPsicologico: "Pendiente",
        conclusiones: "",
    },
];

export function normalizarPostulacion(item) {
    let fase = (item.fase || "").toLowerCase().trim();
    if (!FASES_VALIDAS.includes(fase)) {
        if (item.estado === "Finalizado" && item.resultadoPsicologico === "Recomendado") {
            fase = "aceptado";
        } else if (item.estado === "Finalizado" && item.resultadoPsicologico === "No recomendado") {
            fase = "rechazado";
        } else if (item.fechaEntrevista || item.entrevista) {
            fase = "en entrevista";
        } else {
            fase = "esperando respuesta";
        }
    }

    return {
        id: item.id || Date.now(),
        puestoId: item.puestoId || item.puestoTrabajoId || 1,
        puestoTitulo: item.puestoTitulo || item.cargo || "Cargo sin especificar",
        planta: item.planta || "Puerto Montt",
        candidatoId: item.candidatoId || item.id || Date.now(),
        nombre: item.nombre || `${item.nombres || ""} ${item.apellidos || ""}`.trim() || "Postulante",
        rut: item.rut || "",
        fase: fase,
        entrevista: item.entrevista || (item.fechaEntrevista ? new Date(item.fechaEntrevista).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" }) : "Pendiente de agendar"),
        encargado: item.encargado || item.evaluador || item.evaluadorAsignado || "Amaro Villalobos Caseres",
        cv_pdf: item.cv_pdf || item.cvArchivo || "cv_postulacion.pdf",
        fechaPostulacion: item.fechaPostulacion || new Date().toISOString(),
        dictamenPsicologico: item.dictamenPsicologico || item.resultadoPsicologico || "Pendiente",
        conclusiones: item.conclusiones || "",
    };
}

export function cargarPostulacionesGlobales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_POSTULACIONES);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizarPostulacion);
            }
        }
    } catch (e) {
        console.warn("Fallo al leer postulaciones globales:", e);
    }
    const iniciales = POSTULACIONES_BASE.map(normalizarPostulacion);
    guardarPostulacionesGlobales(iniciales);
    return iniciales;
}

export function guardarPostulacionesGlobales(postulaciones) {
    try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(postulaciones));
        notificarCambioPostulaciones();
    } catch (e) {
        console.error("Error guardando postulaciones en localStorage:", e);
    }
}

export function notificarCambioPostulaciones() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION_POSTULACIONES));
    }
}

export function crearPostulacionGlobal(datos) {
    const actuales = cargarPostulacionesGlobales();
    const nueva = normalizarPostulacion({
        ...datos,
        id: datos.id || Date.now(),
        fase: datos.fase || "esperando respuesta",
        entrevista: datos.entrevista || "Por agendar",
        fechaPostulacion: new Date().toISOString(),
    });

    // Evitar duplicados por id
    const filtradas = actuales.filter((p) => p.id !== nueva.id);
    const listaActualizada = [nueva, ...filtradas];
    guardarPostulacionesGlobales(listaActualizada);
    return nueva;
}

export function actualizarFasePostulacion(id, nuevaFase) {
    const actuales = cargarPostulacionesGlobales();
    const listaActualizada = actuales.map((p) => {
        if (p.id === id) {
            return { ...p, fase: nuevaFase };
        }
        return p;
    });
    guardarPostulacionesGlobales(listaActualizada);
}

export function actualizarPostulacionGlobal(id, datosActualizados) {
    const actuales = cargarPostulacionesGlobales();
    const listaActualizada = actuales.map((p) => {
        if (p.id === id) {
            return { ...p, ...datosActualizados };
        }
        return p;
    });
    guardarPostulacionesGlobales(listaActualizada);
}
