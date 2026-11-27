/**
 * Constantes y catálogos globales de Aqua-Contratos
 * Centralización de datos maestros del dominio para evitar redundancias
 */

export const PLANTAS_DISPONIBLES = [
    "Puerto Montt",
    "Osorno",
    "Castro",
    "Calbuco",
    "Frutillar",
    "Puerto Varas",
    "Ancud",
];

export const EVALUADORES_DISPONIBLES = [
    "Amaro Villalobos Caseres",
    "Carolina Díaz Núñez",
    "Felipe Muñoz Parra",
    "Joaquín Oyarzún Leal",
];

export const FAMILIAS_CARGO = [
    "Operaciones Productivas",
    "Mantenimiento Industrial",
    "Administración y Finanzas",
    "Logística y Abastecimiento",
    "Calidad y Prevención de Riesgos",
    "Sistemas y TI",
];

// Catálogo de áreas de trabajo (sincronizado 1:1 con AREAS_SEED del backend)
export const AREAS_TRABAJO = [
    { id: 1, tipo_area: "Sistemas y TI" },
    { id: 2, tipo_area: "Calidad y Prevención de Riesgos" },
    { id: 3, tipo_area: "Mantenimiento Industrial" },
    { id: 4, tipo_area: "Administración y Finanzas" },
    { id: 5, tipo_area: "Logística y Abastecimiento" },
    { id: 6, tipo_area: "Operaciones Productivas" },
];

export function obtenerNombreAreaPorId(areaId) {
    if (!areaId) return "";
    const encontrada = AREAS_TRABAJO.find((a) => Number(a.id) === Number(areaId));
    return encontrada ? encontrada.tipo_area : "";
}

export function obtenerAreaIdPorFamilia(familiaCargo) {
    if (!familiaCargo) return null;
    const limpio = String(familiaCargo).trim().toLowerCase();
    const encontrada = AREAS_TRABAJO.find((a) => a.tipo_area.toLowerCase() === limpio);
    return encontrada ? encontrada.id : null;
}

export const COMUNAS = [
    "Ancud",
    "Calbuco",
    "Castro",
    "Chaitén",
    "Chonchi",
    "Cochamó",
    "Curaco de Vélez",
    "Dalcahue",
    "Fresia",
    "Frutillar",
    "Futaleufú",
    "Hualaihué",
    "Llanquihue",
    "Los Muermos",
    "Maullín",
    "Osorno",
    "Palena",
    "Puerto Montt",
    "Puerto Octay",
    "Puerto Varas",
    "Puqueldón",
    "Purranque",
    "Puyehue",
    "Queilén",
    "Quellón",
    "Quemchi",
    "Quinchao",
    "Río Negro",
    "San Juan de la Costa",
    "San Pablo",
];

export const ETIQUETAS_SUGERIDAS = [
    "Trabajo en equipo",
    "Liderazgo",
    "Resolución de problemas",
    "Comunicación efectiva",
    "Puntualidad",
    "Organización",
    "React",
    "Node.js",
    "Prevención de riesgos",
    "Mecánica industrial",
    "Logística",
    "Adaptabilidad",
];

// Catálogo especializado de tags psicolaborales para el evaluador
export const TAGS_FORTALEZAS_SUGERIDOS = [
    "Liderazgo natural",
    "Trabajo en equipo",
    "Tolerancia a la frustración",
    "Orientación al detalle",
    "Adaptabilidad a turnos",
    "Comunicación asertiva",
    "Puntualidad y compromiso",
    "Autonomía y proactividad",
    "Resolución bajo presión",
    "Disposición al aprendizaje",
];

export const TAGS_DEBILIDADES_SUGERIDAS = [
    "Dificultad bajo presión",
    "Baja asertividad",
    "Requiere supervisión constante",
    "Resistencia al cambio",
    "Tendencia a la dispersión",
    "Dificultad para delegar",
    "Rigidez en procedimientos",
    "Inseguridad en decisiones clave",
];

// Tipos de citaciones para postulantes (E1 / E2)
export const TIPOS_CITACION = [
    "Entrevistas físicas",
    "Entrevistas online",
    "Inscripciones a la escuela de buceo",
    "Firma de papeles",
    "Entrega de papeles",
];

// Fechas especiales / operativas del calendario de AquaChile (E1 / E3)
export const TIPOS_FECHA_ESPECIAL = [
    "Cierres de local",
    "Vacaciones y permisos",
    "Mantenimientos y sanitizaciones",
    "Feriados",
];

// Dictámenes psicolaborales oficiales homologados (Fusión Informes + Evaluación Psicolaboral)
export const DICTAMENES_PSICOLABORALES = [
    { valor: "Recomendable", label: "Recomendable", color: "#0f5132", bg: "#d1e7dd", borde: "#badbcc" },
    { valor: "Con reservas", label: "Con reservas", color: "#856404", bg: "#fff3cd", borde: "#ffeeba" },
    { valor: "No recomendable", label: "No recomendable", color: "#842029", bg: "#f8d7da", borde: "#f5c2c7" },
];

/**
 * Homologa la nomenclatura histórica ("Recomendado", "Recomendado con observaciones", "No recomendado")
 * al vocabulario psicolaboral formal ("Recomendable", "Con reservas", "No recomendable").
 */
export function normalizarDictamen(dictamen) {
    if (!dictamen || dictamen === "Pendiente") return "Pendiente";
    const d = String(dictamen).trim().toLowerCase();
    if (d === "recomendable" || d === "recomendado") return "Recomendable";
    if (d === "con reservas" || d === "recomendado con observaciones" || d === "con observaciones") return "Con reservas";
    if (d === "no recomendable" || d === "no recomendado") return "No recomendable";
    return dictamen;
}

export function obtenerConfigDictamen(dictamen) {
    const norm = normalizarDictamen(dictamen);
    const encontrado = DICTAMENES_PSICOLABORALES.find((dp) => dp.valor === norm);
    if (encontrado) return encontrado;
    return {
        valor: "Pendiente",
        label: "Sin dictamen aún",
        color: "#495057",
        bg: "#e2e3e5",
        borde: "#ced4da",
    };
}
