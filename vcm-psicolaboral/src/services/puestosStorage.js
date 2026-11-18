/**
 * Servicio de Almacenamiento y Sincronización Global de Puestos de Trabajo
 * Garantiza que las ofertas laborales creadas o editadas por Jefatura persistan
 * en localStorage y se sincronicen en tiempo real con el Portal de Postulantes.
 */
import { ETIQUETAS_SUGERIDAS } from "../utils/constantes";

export const STORAGE_KEY_PUESTOS = "aqua_contratos_puestos_global_v1";
export const STORAGE_KEY_ETIQUETAS = "aqua_contratos_etiquetas_global_v1";
export const EVENTO_ACTUALIZACION_PUESTOS = "aqua_contratos_puestos_actualizados";

export const PUESTOS_BASE = [
    {
        id: 1,
        area_id: 1,
        titulo: "Desarrollador Full Stack",
        planta: "Puerto Montt",
        familiaCargo: "Sistemas y TI",
        descripcion:
            "Mantención y evolución de plataformas web corporativas y digitalización de procesos de planta.",
        requisitos:
            "Experiencia en React, Node.js y bases de datos relacionales. Deseable trabajo en equipo ágil.",
        etiquetas: ["React", "Node.js", "Trabajo en equipo", "Resolución de problemas"],
        vacantes: 2,
        estado: "Abierto",
        creadoPor: "Carlos Mendoza (Jefe TI)",
        fechaCreacion: "2026-10-01T08:30:00.000Z",
    },
    {
        id: 2,
        area_id: 2,
        titulo: "Prevencionista de Faena",
        planta: "Osorno",
        familiaCargo: "Calidad y Prevención de Riesgos",
        descripcion:
            "Supervisar el cumplimiento de normativas de seguridad, protocolos sanitarios y evaluación de riesgos en faena.",
        requisitos:
            "Título de Ingeniero o Técnico en Prevención de Riesgos con registro SNS vigente. Experiencia en plantas de salmónidos.",
        etiquetas: ["Prevención de riesgos", "Liderazgo", "Comunicación efectiva", "Resolución de problemas"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Mariana Almonacid (Jefa Prevención)",
        fechaCreacion: "2026-10-02T09:00:00.000Z",
    },
    {
        id: 3,
        area_id: 3,
        titulo: "Técnico de Mantenimiento",
        planta: "Puerto Varas",
        familiaCargo: "Mantenimiento Industrial",
        descripcion:
            "Ejecución del plan de mantenimiento preventivo y correctivo en líneas de proceso y sistemas hidráulicos.",
        requisitos:
            "Técnico nivel superior en Mecánica Industrial o Electromecánica. Manejo de bombas y refrigeración.",
        etiquetas: ["Mecánica industrial", "Puntualidad", "Resolución de problemas", "Trabajo en equipo"],
        vacantes: 3,
        estado: "Abierto",
        creadoPor: "Hernán Soto (Jefe Mantenimiento)",
        fechaCreacion: "2026-10-02T10:15:00.000Z",
    },
    {
        id: 4,
        area_id: 4,
        titulo: "Asistente Administrativo",
        planta: "Puerto Montt",
        familiaCargo: "Administración y Finanzas",
        descripcion:
            "Apoyo en control de gestión, compras de insumos menores y respaldo en tareas de recursos humanos.",
        requisitos:
            "Formación técnica en administración o contabilidad. Manejo de planillas de Excel y archivo documental.",
        etiquetas: ["Organización", "Comunicación efectiva", "Puntualidad", "Adaptabilidad"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Lorena Silva (Jefa Administración)",
        fechaCreacion: "2026-10-03T11:00:00.000Z",
    },
    {
        id: 5,
        area_id: 3,
        titulo: "Eléctrico de Turno",
        planta: "Castro",
        familiaCargo: "Mantenimiento Industrial",
        descripcion:
            "Operación y mantención de instalaciones eléctricas en turno, con apoyo en planta de procesos.",
        requisitos:
            "Certificación SEC vigente clase B. Experiencia comprobada en turnos de planta industrial.",
        etiquetas: ["Mecánica industrial", "Resolución de problemas", "Trabajo en equipo", "Puntualidad"],
        vacantes: 2,
        estado: "Abierto",
        creadoPor: "Rodrigo Palma (Jefe Eléctrico)",
        fechaCreacion: "2026-10-04T09:30:00.000Z",
    },
    {
        id: 6,
        area_id: 5,
        titulo: "Coordinador de Despacho",
        planta: "Calbuco",
        familiaCargo: "Logística y Abastecimiento",
        descripcion:
            "Coordinar despachos de producto terminado, control de cámaras de frío y trazabilidad logística marítima/terrestre.",
        requisitos:
            "Técnico o Ingeniero en Logística. Experiencia mínima de 2 años en logística de productos perecibles.",
        etiquetas: ["Logística", "Liderazgo", "Organización", "Comunicación efectiva"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Rodrigo Morales (Jefe Logística)",
        fechaCreacion: "2026-10-04T08:00:00.000Z",
    },
];

/**
 * Elimina puestos duplicados por ID o por coincidencia exacta de
 * (título + planta + familiaCargo + descripción).
 */
function deduplicarPuestos(lista = []) {
    const vistosId = new Set();
    const vistosClave = new Set();
    const resultado = [];

    for (const item of lista) {
        if (!item) continue;
        const idNum = Number(item.id);
        const claveContenido = [
            (item.titulo || "").toLowerCase().trim(),
            (item.planta || "").toLowerCase().trim(),
            (item.familiaCargo || "").toLowerCase().trim(),
            (item.descripcion || "").toLowerCase().trim(),
        ].join("|");

        if (vistosId.has(idNum) || vistosClave.has(claveContenido)) {
            continue;
        }
        vistosId.add(idNum);
        vistosClave.add(claveContenido);
        resultado.push(item);
    }

    return resultado;
}

export function notificarCambioPuestos() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION_PUESTOS));
    }
}

export function cargarPuestosGlobales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PUESTOS);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const limpios = deduplicarPuestos(parsed);
                if (limpios.length !== parsed.length) {
                    localStorage.setItem(STORAGE_KEY_PUESTOS, JSON.stringify(limpios));
                }
                return limpios;
            }
        }
    } catch (e) {
        console.warn("Fallo al leer puestos globales:", e);
    }
    guardarPuestosGlobales(PUESTOS_BASE);
    return [...PUESTOS_BASE];
}

export function guardarPuestosGlobales(puestos) {
    try {
        const limpios = deduplicarPuestos(puestos);
        localStorage.setItem(STORAGE_KEY_PUESTOS, JSON.stringify(limpios));
        notificarCambioPuestos();
        return limpios;
    } catch (e) {
        console.error("Error guardando puestos en localStorage:", e);
        return puestos;
    }
}

/**
 * Registra un nuevo puesto en el almacenamiento global local (fuera de updaters de React)
 * evitando duplicación por StrictMode o doble disparo de eventos.
 */
export function registrarPuestoGlobal(puestoNuevo) {
    const actuales = cargarPuestosGlobales();
    const nuevoId =
        puestoNuevo.id !== undefined && puestoNuevo.id !== null
            ? Number(puestoNuevo.id)
            : actuales.length > 0
            ? Math.max(...actuales.map((p) => Number(p.id) || 0)) + 1
            : 1;

    const normalizado = {
        ...puestoNuevo,
        id: nuevoId,
        estado: puestoNuevo.estado || "Abierto",
        creadoPor: puestoNuevo.creadoPor || "Jefe de Área",
        fechaCreacion: puestoNuevo.fechaCreacion || new Date().toISOString(),
    };

    const actualizados = deduplicarPuestos([normalizado, ...actuales]);
    guardarPuestosGlobales(actualizados);
    return actualizados;
}

export function actualizarEstadoPuestoGlobal(id, nuevoEstado) {
    const actuales = cargarPuestosGlobales();
    const actualizados = actuales.map((p) =>
        Number(p.id) === Number(id) ? { ...p, estado: nuevoEstado } : p
    );
    guardarPuestosGlobales(actualizados);
    return actualizados;
}

/**
 * Fusiona los puestos remotos de la API con los puestos creados localmente
 * para que nunca se pierdan las ofertas creadas mientras el backend estuvo desconectado.
 */
export function sincronizarPuestosConRemotos(remotos = []) {
    const locales = cargarPuestosGlobales();
    if (!Array.isArray(remotos) || remotos.length === 0) {
        return locales;
    }

    const combinados = deduplicarPuestos([...remotos, ...locales]).sort(
        (a, b) => Number(b.id) - Number(a.id)
    );
    guardarPuestosGlobales(combinados);
    return combinados;
}

export function cargarEtiquetasGlobales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_ETIQUETAS);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return Array.from(new Set([...ETIQUETAS_SUGERIDAS, ...parsed]));
            }
        }
    } catch {
        // Ignorar
    }
    return [...ETIQUETAS_SUGERIDAS];
}

export function guardarEtiquetasGlobales(etiquetas) {
    try {
        const unicas = Array.from(new Set([...ETIQUETAS_SUGERIDAS, ...(etiquetas || [])]));
        localStorage.setItem(STORAGE_KEY_ETIQUETAS, JSON.stringify(unicas));
        notificarCambioPuestos();
        return unicas;
    } catch {
        return etiquetas;
    }
}
