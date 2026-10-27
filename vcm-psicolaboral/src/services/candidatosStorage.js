/**
 * Servicio de Almacenamiento y Sincronización Global de Postulantes
 * @Autor Amaro Villalobos
 * Permite que los candidatos que se inscriban desde la pantalla pública de Postulantes
 * sean inmediatamente visibles y sincronizados en las pantallas de los empleados
 * (Analista de Reclutamiento, Profesional Evaluador y Jefe de Área).
 */

import { api } from "./api.js";

export const STORAGE_KEY_CANDIDATOS = "aqua_contratos_datos_mvp_v1";
export const EVENTO_ACTUALIZACION_CANDIDATOS = "aqua_contratos_actualizados";

export const CANDIDATOS_BASE = [
    {
        id: 1,
        rut: "21.756.200-7",
        nombres: "Luis Andrés",
        apellidos: "Mancilla Peralta",
        nombre: "Luis Mancilla Peralta",
        direccion: "Av. Angelmó 1420",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1998-05-14",
        cv_pdf: "cv_luis_mancilla.pdf",
        cvArchivo: "cv_luis_mancilla.pdf",
        especialidad: "Ing Software",
        planta: "Puerto Montt",
        cargo: "Desarrollador Full Stack",
        familiaCargo: "Sistemas y TI",
        fecha: new Date(2026, 9, 5).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En revisión",
        antecedentes: "Experiencia en React y Node.js. Salud compatible para teletrabajo y planta.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 2,
        rut: "20.345.118-3",
        nombres: "Camila Ignacia",
        apellidos: "Soto Vargas",
        nombre: "Camila Soto Vargas",
        direccion: "Calle Mackenna 540",
        comuna: "Osorno",
        fecha_nacimiento: "2000-03-22",
        cv_pdf: "cv_camila_soto.pdf",
        cvArchivo: "cv_camila_soto.pdf",
        especialidad: "Prevención de Riesgos",
        planta: "Osorno",
        cargo: "Prevencionista de Faena",
        familiaCargo: "Calidad y Prevención de Riesgos",
        fecha: new Date(2026, 9, 4).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Pendiente",
        antecedentes: "2 años en plantas de salmónidos en la zona sur.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 3,
        rut: "19.872.456-K",
        nombres: "Matías Nicolás",
        apellidos: "Rojas Aguilar",
        nombre: "Matías Rojas Aguilar",
        direccion: "San Francisco 320",
        comuna: "Puerto Varas",
        fecha_nacimiento: "1997-11-08",
        cv_pdf: "cv_matias_rojas.pdf",
        cvArchivo: "cv_matias_rojas.pdf",
        especialidad: "Mecánica Industrial",
        planta: "Puerto Varas",
        cargo: "Técnico de Mantenimiento",
        familiaCargo: "Mantenimiento Industrial",
        fecha: new Date(2026, 9, 4).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En proceso",
        antecedentes: "Especialista en bombas hidráulicas y líneas de faena.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 4,
        rut: "21.034.789-5",
        nombres: "Valentina Paz",
        apellidos: "Cárdenas Ruiz",
        nombre: "Valentina Cárdenas Ruiz",
        direccion: "Los Alerces 890",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1999-08-30",
        cv_pdf: "cv_valentina_cardenas.pdf",
        cvArchivo: "cv_valentina_cardenas.pdf",
        especialidad: "Administración",
        planta: "Puerto Montt",
        cargo: "Asistente Administrativo",
        familiaCargo: "Administración y Finanzas",
        fecha: new Date(2026, 9, 3).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "Finalizado",
        antecedentes: "Práctica profesional y experiencia en control de gestión.",
        resultadoPsicologico: "Recomendado",
        fechaEvaluacion: "2026-10-03",
        conclusiones: "Alta capacidad de trabajo en equipo y apego a protocolos de la empresa."
    },
    {
        id: 5,
        rut: "18.456.321-2",
        nombres: "Sebastián Alonso",
        apellidos: "Oyarzún Leal",
        nombre: "Sebastián Oyarzún Leal",
        direccion: "Gamboa Alto 210",
        comuna: "Castro",
        fecha_nacimiento: "1994-01-19",
        cv_pdf: "cv_sebastian_oyarzun.pdf",
        cvArchivo: "cv_sebastian_oyarzun.pdf",
        especialidad: "Electricidad",
        planta: "Castro",
        cargo: "Eléctrico de Turno",
        familiaCargo: "Mantenimiento Industrial",
        fecha: new Date(2026, 9, 2).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Pendiente",
        antecedentes: "Certificación SEC vigente clase B.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 6,
        rut: "20.987.654-1",
        nombres: "Javiera Belén",
        apellidos: "Barría Montecinos",
        nombre: "Javiera Barría Montecinos",
        direccion: "Costanera Sur 77",
        comuna: "Calbuco",
        fecha_nacimiento: "2001-09-12",
        cv_pdf: "cv_javiera_barria.pdf",
        cvArchivo: "cv_javiera_barria.pdf",
        especialidad: "Logística",
        planta: "Calbuco",
        cargo: "Coordinador de Despacho",
        familiaCargo: "Logística y Abastecimiento",
        fecha: new Date(2026, 9, 2).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "En proceso",
        antecedentes: "Experiencia en bodegas de frío y control de cadena de valor.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 7,
        rut: "19.123.456-8",
        nombres: "Diego Esteban",
        apellidos: "Andrade Contreras",
        nombre: "Diego Andrade Contreras",
        direccion: "Almirante Latorre 405",
        comuna: "Ancud",
        fecha_nacimiento: "1996-06-25",
        cv_pdf: "cv_diego_andrade.pdf",
        cvArchivo: "cv_diego_andrade.pdf",
        especialidad: "Soldadura",
        planta: "Ancud",
        cargo: "Soldador Calificado",
        familiaCargo: "Operaciones Productivas",
        fecha: new Date(2026, 9, 1).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En revisión",
        antecedentes: "Calificación 6G vigente.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 8,
        rut: "21.456.098-6",
        nombres: "Francisca Andrea",
        apellidos: "Mayorga Tapia",
        nombre: "Francisca Mayorga Tapia",
        direccion: "Av. Philippi 123",
        comuna: "Frutillar",
        fecha_nacimiento: "2000-12-04",
        cv_pdf: "cv_francisca_mayorga.pdf",
        cvArchivo: "cv_francisca_mayorga.pdf",
        especialidad: "Contabilidad",
        planta: "Frutillar",
        cargo: "Analista Contable",
        familiaCargo: "Administración y Finanzas",
        fecha: new Date(2026, 8, 30).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Finalizado",
        antecedentes: "Experiencia con ERP SAP y facturación electrónica.",
        resultadoPsicologico: "Recomendado con observaciones",
        fechaEvaluacion: "2026-10-01",
        conclusiones: "Cumple con el perfil técnico, requiere seguimiento en manejo de presión en cierres contables."
    },
    {
        id: 9,
        rut: "20.678.912-4",
        nombres: "Nicolás Alejandro",
        apellidos: "Hernández Soto",
        nombre: "Nicolás Hernández Soto",
        direccion: "Pelluco Alto 615",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1999-04-18",
        cv_pdf: "cv_nicolas_hernandez.pdf",
        cvArchivo: "cv_nicolas_hernandez.pdf",
        especialidad: "Ing Civil",
        planta: "Puerto Montt",
        cargo: "Ingeniero de Infraestructura",
        familiaCargo: "Operaciones Productivas",
        fecha: new Date(2026, 8, 29).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "Pendiente",
        antecedentes: "Supervisión de obras marítimas y concesiones acuícolas.",
        resultadoPsicologico: "Pendiente"
    },
    {
        id: 10,
        rut: "19.765.432-9",
        nombres: "Constanza Elena",
        apellidos: "Vidal Bahamonde",
        nombre: "Constanza Vidal Bahamonde",
        direccion: "Manuel Rodríguez 820",
        comuna: "Osorno",
        fecha_nacimiento: "1997-07-29",
        cv_pdf: "cv_constanza_vidal.pdf",
        cvArchivo: "cv_constanza_vidal.pdf",
        especialidad: "Enfermería",
        planta: "Osorno",
        cargo: "Enfermera Ocupacional",
        familiaCargo: "Calidad y Prevención de Riesgos",
        fecha: new Date(2026, 8, 28).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "Finalizado",
        antecedentes: "Experiencia en salas de primeros auxilios y protocolos sanitarios.",
        resultadoPsicologico: "Recomendado",
        fechaEvaluacion: "2026-09-30",
        conclusiones: "Perfil excelente con alta empatía y vocación de servicio para personal de planta."
    },
];

/**
 * Normaliza un objeto candidato asegurando que cuente con todos los atributos requeridos.
 */
export function normalizarCandidato(item) {
    const nombres = item.nombres || (item.nombre ? item.nombre.split(" ").slice(0, -2).join(" ") || item.nombre.split(" ")[0] : "");
    const apellidos = item.apellidos || (item.nombre ? item.nombre.split(" ").slice(-2).join(" ") : "");
    const nombreCompleto = item.nombre || `${nombres} ${apellidos}`.trim();
    const rutLimpio = item.rut || "";
    const cvArchivo = item.cv_pdf || item.cvArchivo || (nombreCompleto ? `cv_${nombreCompleto.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : "cv_postulante.pdf");

    return {
        ...item,
        id: item.id || Date.now(),
        rut: rutLimpio,
        nombres: item.nombres || nombres,
        apellidos: item.apellidos || apellidos,
        nombre: nombreCompleto,
        direccion: item.direccion || "Dirección no informada",
        comuna: item.comuna || item.planta || "Puerto Montt",
        planta: item.planta || item.comuna || "Puerto Montt",
        fecha_nacimiento: item.fecha_nacimiento || "1998-01-01",
        cv_pdf: cvArchivo,
        cvArchivo: cvArchivo,
        especialidad: item.especialidad || item.cargo || "Postulante General",
        cargo: item.cargo || item.especialidad || "Postulante General",
        familiaCargo: item.familiaCargo || "Operaciones Productivas",
        evaluador: item.evaluador || "Amaro Villalobos Caseres",
        estado: item.estado || "Pendiente",
        resultadoPsicologico: item.resultadoPsicologico || "Pendiente",
        fecha: item.fecha instanceof Date ? item.fecha : new Date(item.fecha || Date.now()),
    };
}

/**
 * Carga los candidatos del almacenamiento local compartido.
 * Si no existen, inicializa con los candidatos base normalizados.
 */
export function cargarCandidatosGlobales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_CANDIDATOS);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizarCandidato);
            }
        }
    } catch (e) {
        console.warn("Fallo al leer almacenamiento global de candidatos:", e);
    }
    const iniciales = CANDIDATOS_BASE.map(normalizarCandidato);
    guardarCandidatosGlobales(iniciales);
    return iniciales;
}

/**
 * Guarda la lista completa de candidatos en el almacenamiento local compartido.
 */
export function guardarCandidatosGlobales(candidatos) {
    try {
        localStorage.setItem(STORAGE_KEY_CANDIDATOS, JSON.stringify(candidatos));
        notificarCambioGlobal();
    } catch (e) {
        console.error("Error al persistir candidatos en localStorage:", e);
    }
}

/**
 * Registra un nuevo candidato globalmente (desde la vista de Postulantes o desde Analista).
 * Se guarda inmediatamente en localStorage y sincroniza con el backend si está en línea.
 */
export async function registrarPostulanteGlobal(nuevoPostulante) {
    const normalizado = normalizarCandidato({
        ...nuevoPostulante,
        fecha: new Date(),
        estado: nuevoPostulante.estado || "Pendiente",
        resultadoPsicologico: "Pendiente",
    });

    // 1. Guardar en almacenamiento local
    try {
        const actuales = cargarCandidatosGlobales();
        // Verificar si ya existe por RUT
        const rutNuevo = (normalizado.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
        const filtrados = actuales.filter((c) => {
            const rutActual = (c.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
            return rutActual !== rutNuevo && c.id !== normalizado.id;
        });

        const actualizada = [normalizado, ...filtrados];
        localStorage.setItem(STORAGE_KEY_CANDIDATOS, JSON.stringify(actualizada));
        notificarCambioGlobal();
    } catch (e) {
        console.error("Error guardando postulante en almacenamiento global:", e);
    }

    // 2. Intentar registrar en el Backend Express + SQLite
    try {
        await api.crearSolicitud(normalizado);
    } catch (err) {
        console.warn("Backend no disponible al registrar postulante (permanece en modo local global):", err.message);
    }

    return normalizado;
}

/**
 * Dispara evento para que todas las pantallas activas actualicen sus listas en tiempo real.
 */
export function notificarCambioGlobal() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION_CANDIDATOS));
    }
}
