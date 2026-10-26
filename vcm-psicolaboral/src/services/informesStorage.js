/**
 * Utilidades de almacenamiento local (fallback) para Solicitudes de Informes.
 * Permite que Analistas, Evaluadores y Jefatura compartan y sincronicen las
 * solicitudes de informe aun cuando el backend no esté en ejecución.
 */

export const STORAGE_KEY_INFORMES = "aqua_contratos_informes_mvp_v2";

export const INFORMES_INICIALES = [
    {
        id: 1,
        candidatoId: 1,
        candidatoNombre: "Luis Mancilla Peralta",
        puestoTrabajoId: 1,
        tipo: "candidato",
        solicitante: "Jefe de Área",
        urgencia: "Alta",
        fechaLimite: "2026-10-25",
        estado: "Abierta",
        fechaCreacion: "2026-10-06T10:00:00.000Z",
        destinatarios: ["analista", "evaluador"],
        preguntas: [
            {
                id: 1,
                texto: "¿El postulante tiene experiencia comprobable en integración de APIs y microservicios?",
                fecha: "2026-10-06T10:00:00.000Z",
                creadaPor: "Jefe de Área",
                respuestas: [
                    {
                        id: 1,
                        autor: "Amaro Villalobos Caseres",
                        rol: "evaluador",
                        texto: "Sí, cuenta con 3 años desarrollando APIs RESTful con Node.js y Express.",
                        fecha: "2026-10-06T14:30:00.000Z",
                    },
                ],
            },
            {
                id: 2,
                texto: "¿Dispone de movilidad propia para trasladarse a planta Puerto Montt en turnos especiales?",
                fecha: "2026-10-06T16:00:00.000Z",
                creadaPor: "Jefe de Área",
                respuestas: [],
            },
        ],
    },
    {
        id: 2,
        candidatoId: 2,
        candidatoNombre: "Camila Soto Vargas",
        puestoTrabajoId: 2,
        tipo: "candidato",
        solicitante: "Jefe de Área",
        urgencia: "Urgente",
        fechaLimite: "2026-10-15",
        estado: "Abierta",
        fechaCreacion: "2026-10-05T09:00:00.000Z",
        destinatarios: ["analista", "evaluador"],
        preguntas: [
            {
                id: 1,
                texto: "¿Posee cursos o certificaciones en trabajo seguro en faena y espacios confinados?",
                fecha: "2026-10-05T09:00:00.000Z",
                creadaPor: "Jefe de Área",
                respuestas: [
                    {
                        id: 1,
                        autor: "Carolina Díaz Núñez",
                        rol: "evaluador",
                        texto: "Se verificó certificado de capacitación ACHS vigente hasta 2027.",
                        fecha: "2026-10-05T15:20:00.000Z",
                    },
                ],
            },
        ],
    },
];

export const cargarInformesIniciales = () => {
    try {
        const datos = localStorage.getItem(STORAGE_KEY_INFORMES);
        if (datos) {
            const parsed = JSON.parse(datos);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // En caso de fallo de lectura de localStorage, retorna iniciales
    }
    guardarInformesLocal(INFORMES_INICIALES);
    return INFORMES_INICIALES;
};

export const guardarInformesLocal = (informes) => {
    try {
        localStorage.setItem(STORAGE_KEY_INFORMES, JSON.stringify(informes));
    } catch {
        // Ignorar errores de almacenamiento
    }
};
