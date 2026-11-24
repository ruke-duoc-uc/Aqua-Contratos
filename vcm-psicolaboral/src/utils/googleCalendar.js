/**
 * Utilidad de Integración con Google Calendar y Google Meet (E2: Citaciones Google)
 * Permite construir enlaces oficiales de Google Calendar (`calendar.google.com/calendar/render?action=TEMPLATE`)
 * con título, fechas en UTC, detalles, ubicación/modalidad e invitado (email del postulante),
 * además de almacenar y sincronizar las fechas operativas del calendario (feriados, cierres, etc.).
 */

export const STORAGE_KEY_FECHAS_CALENDARIO = "aqua_contratos_fechas_calendario_v1";
export const EVENTO_ACTUALIZACION_CALENDARIO = "aqua_contratos_calendario_actualizado";

export const FECHAS_CALENDARIO_BASE = [
    {
        id: 101,
        titulo: "Feriado Nacional · Día de las Iglesias Evangélicas",
        tipoEvento: "Feriados",
        fecha: "2026-10-31T09:00",
        planta: "Todas las Plantas",
        observaciones: "Día feriado legal. No se agendan entrevistas presenciales.",
        esEventoEspecial: true,
    },
    {
        id: 102,
        titulo: "Sanitización General Planta Puerto Montt",
        tipoEvento: "Mantenimientos y sanitizaciones",
        fecha: "2026-10-28T08:00",
        planta: "Puerto Montt",
        observaciones: "Mantenimiento preventivo y sanitización programada de líneas de proceso.",
        esEventoEspecial: true,
    },
];

function formatearFechaGoogleUTC(fechaInput) {
    let fechaObj = null;

    if (typeof fechaInput === "string" && fechaInput.includes("/")) {
        // Formato dd/mm/yyyy hh:mm
        const [parteFecha, parteHora = "10:00"] = fechaInput.trim().split(" ");
        const [d, m, y] = parteFecha.split("/").map(Number);
        const [hh = 10, mm = 0] = parteHora.split(":").map(Number);
        if (d && m && y) {
            fechaObj = new Date(y, m - 1, d, hh, mm, 0);
        }
    }

    if (!fechaObj) {
        const intento = new Date(fechaInput);
        if (!isNaN(intento.getTime())) {
            fechaObj = intento;
        }
    }

    if (!fechaObj) {
        fechaObj = new Date();
        fechaObj.setDate(fechaObj.getDate() + 1);
        fechaObj.setHours(10, 0, 0, 0);
    }

    const finObj = new Date(fechaObj.getTime() + 60 * 60 * 1000); // 1 hora de duración

    const aFormatoGCal = (d) =>
        d
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");

    return `${aFormatoGCal(fechaObj)}/${aFormatoGCal(finObj)}`;
}

/**
 * Construye una URL oficial de Google Calendar para agendar o abrir la citación con 1 clic.
 */
export function construirUrlGoogleCalendar({
    titulo,
    tipoCitacion = "Entrevistas físicas",
    fechaHora,
    candidatoNombre = "",
    candidatoEmail = "",
    puestoTitulo = "",
    planta = "Puerto Montt",
    evaluador = "",
    enlaceMeet = "",
    observaciones = "",
}) {
    const tituloFinal =
        titulo ||
        `${tipoCitacion} · ${candidatoNombre || "Postulante"} (${puestoTitulo || "AquaChile"})`;

    const fechasRango = formatearFechaGoogleUTC(fechaHora);

    const lineasDetalle = [
        `Citación Oficial AquaChile - Sistema Aqua-Contratos`,
        `Tipo de Citación: ${tipoCitacion}`,
        candidatoNombre ? `Postulante: ${candidatoNombre}` : null,
        puestoTitulo ? `Cargo / Oferta: ${puestoTitulo}` : null,
        planta ? `Planta / Sede: ${planta}` : null,
        evaluador ? `Encargado / Evaluador: ${evaluador}` : null,
        enlaceMeet ? `Enlace de Videollamada (Google Meet): ${enlaceMeet}` : null,
        observaciones ? `Indicaciones: ${observaciones}` : null,
    ].filter(Boolean);

    const ubicacion =
        tipoCitacion === "Entrevistas online"
            ? enlaceMeet || "Google Meet (Videollamada Online)"
            : `Planta AquaChile · ${planta || "Puerto Montt"}`;

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: tituloFinal,
        dates: fechasRango,
        details: lineasDetalle.join("\n"),
        location: ubicacion,
    });

    if (candidatoEmail && candidatoEmail.includes("@")) {
        params.append("add", candidatoEmail.trim());
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera un enlace estructurado de sala de Google Meet para entrevistas online.
 */
export function generarEnlaceGoogleMeet(semilla = "") {
    const limpio = String(semilla || Date.now())
        .toLowerCase()
        .replace(/[^a-z]/g, "a")
        .padEnd(10, "x");
    const p1 = limpio.slice(0, 3);
    const p2 = limpio.slice(3, 7);
    const p3 = limpio.slice(7, 10);
    return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

export function cargarFechasEspecialesCalendario() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_FECHAS_CALENDARIO);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // Ignorar
    }
    guardarFechasEspecialesCalendario(FECHAS_CALENDARIO_BASE);
    return [...FECHAS_CALENDARIO_BASE];
}

export function guardarFechasEspecialesCalendario(lista) {
    try {
        localStorage.setItem(STORAGE_KEY_FECHAS_CALENDARIO, JSON.stringify(lista));
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION_CALENDARIO));
        }
    } catch {
        // Ignorar
    }
}

export function registrarFechaEspecialCalendario(evento) {
    const actuales = cargarFechasEspecialesCalendario();
    const nuevo = {
        id: Date.now(),
        titulo: (evento.titulo || evento.tipoEvento || "Fecha operativa").trim(),
        tipoEvento: evento.tipoEvento || "Feriados",
        fecha: evento.fecha,
        planta: evento.planta || "Todas las Plantas",
        observaciones: (evento.observaciones || "").trim(),
        esEventoEspecial: true,
    };
    const actualizados = [nuevo, ...actuales];
    guardarFechasEspecialesCalendario(actualizados);
    return actualizados;
}

export function eliminarFechaEspecialCalendario(id) {
    const actuales = cargarFechasEspecialesCalendario();
    const filtrados = actuales.filter((e) => Number(e.id) !== Number(id));
    guardarFechasEspecialesCalendario(filtrados);
    return filtrados;
}
