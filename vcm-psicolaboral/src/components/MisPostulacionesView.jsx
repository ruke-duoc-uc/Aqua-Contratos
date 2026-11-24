import { useState, useMemo, useEffect } from "react";
import CalendarioEntrevistas from "./CalendarioEntrevistas.jsx";
import Icono from "./Icono.jsx";
import { ESTILO_ETIQUETA, ESTILO_VALOR, NARANJA, NARANJA_OSCURO } from "./Estilos.jsx";
import {
    construirUrlGoogleCalendar,
    cargarFechasEspecialesCalendario,
    EVENTO_ACTUALIZACION_CALENDARIO,
} from "../utils/googleCalendar";

function extraerClaveFecha(fechaStr) {
    if (!fechaStr) return null;
    if (typeof fechaStr === "string" && fechaStr.includes("-")) {
        const parteFecha = fechaStr.split("T")[0];
        const partes = parteFecha.split("-");
        if (partes.length === 3) {
            return `${partes[0]}-${partes[1].padStart(2, "0")}-${partes[2].padStart(2, "0")}`;
        }
    }
    if (typeof fechaStr === "string" && fechaStr.includes("/")) {
        const parteFecha = fechaStr.split(" ")[0];
        const [d, m, y] = parteFecha.split("/");
        if (d && m && y) {
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
    }
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dia}`;
    }
    return null;
}

function formatearFechaHora(fechaStr) {
    if (!fechaStr) return "Sin fecha";
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
        return d.toLocaleString("es-CL", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }
    return fechaStr;
}

function MisPostulacionesView({ postulaciones = [] }) {
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [fechasEspeciales, setFechasEspeciales] = useState(cargarFechasEspecialesCalendario);

    useEffect(() => {
        const handleSync = () => setFechasEspeciales(cargarFechasEspecialesCalendario());
        window.addEventListener(EVENTO_ACTUALIZACION_CALENDARIO, handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CALENDARIO, handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, []);

    // Entrevistas agendadas para este postulante
    const entrevistasAgendadas = useMemo(() => {
        return postulaciones.filter((p) =>
            Boolean(
                p.fechaEntrevista ||
                (p.entrevista &&
                    p.entrevista !== "Pendiente de confirmación" &&
                    p.entrevista !== "Por agendar" &&
                    p.entrevista !== "Pendiente de agendar")
            )
        );
    }, [postulaciones]);

    const eventosCalendario = useMemo(() => {
        return [...entrevistasAgendadas, ...fechasEspeciales];
    }, [entrevistasAgendadas, fechasEspeciales]);

    // Entrevistas que caen en el día seleccionado en el calendario
    const entrevistasDelDia = useMemo(() => {
        if (!diaSeleccionado) return [];
        return entrevistasAgendadas.filter((p) => {
            const clave = extraerClaveFecha(p.fechaEntrevista || p.entrevista);
            return clave === diaSeleccionado;
        });
    }, [entrevistasAgendadas, diaSeleccionado]);

    const badgeFase = (fase) => {
        const f = (fase || "esperando respuesta").toLowerCase();
        if (f === "en entrevista") {
            return { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe", texto: "En Entrevista", icono: "calendar" };
        }
        if (f === "aceptado") {
            return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", texto: "Aceptado", icono: "check" };
        }
        if (f === "rechazado") {
            return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", texto: "No seleccionado", icono: "close" };
        }
        return { bg: "#fef3c7", color: "#92400e", border: "#fde68a", texto: "En Revisión", icono: "clock" };
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Resumen Superior */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    padding: "18px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icono nombre="pin" size={20} color="#e8590c" />
                        Mis Postulaciones Activas y Calendario de Entrevistas
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Consulta el estado de tus procesos y las fechas de entrevistas agendadas por el equipo de AquaChile
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ padding: "6px 14px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6", textAlign: "center" }}>
                        <span style={ESTILO_ETIQUETA}>Postulaciones</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>{postulaciones.length}</div>
                    </div>
                    <div style={{ padding: "6px 14px", backgroundColor: "#dbeafe", borderRadius: "6px", border: "1px solid #bfdbfe", textAlign: "center" }}>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#1e40af" }}>Entrevistas Citadas</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1e40af" }}>{entrevistasAgendadas.length}</div>
                    </div>
                </div>
            </div>

            {/* Fila Superior: Calendario de Citas (izq) + Detalle de Citas del Postulante (der) */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                    gap: "20px",
                    alignItems: "stretch",
                }}
            >
                {/* Calendario con las entrevistas agendadas */}
                <CalendarioEntrevistas
                    entrevistas={eventosCalendario}
                    diaSeleccionado={diaSeleccionado}
                    onSeleccionarDia={(clave) => setDiaSeleccionado(clave === diaSeleccionado ? null : clave)}
                />

                {/* Detalle de Citas Programadas */}
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        padding: "18px 20px",
                        minHeight: "440px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    }}
                >
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "14px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Icono nombre="calendar" size={18} color="#166534" />
                            {diaSeleccionado ? `Entrevistas del día: ${diaSeleccionado}` : "Mis Citas de Entrevista"}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                            {diaSeleccionado
                                ? `Mostrando citas para la fecha seleccionada`
                                : `Tienes ${entrevistasAgendadas.length} entrevista(s) agendada(s). Haz clic en un día del calendario para ver el detalle.`}
                        </span>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(diaSeleccionado ? entrevistasDelDia : entrevistasAgendadas).length === 0 ? (
                            <div style={{ padding: "40px 10px", textAlign: "center", color: "#888" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <Icono nombre="calendar" size={32} color="#9ca3af" />
                                </div>
                                <p style={{ margin: 0, fontSize: "14px" }}>
                                    {diaSeleccionado
                                        ? "No tienes entrevistas agendadas para esta fecha."
                                        : "Aún no tienes entrevistas agendadas por los evaluadores."}
                                </p>
                            </div>
                        ) : (
                            (diaSeleccionado ? entrevistasDelDia : entrevistasAgendadas).map((cita) => {
                                const tipoCitacion = cita.tipoCitacion || "Entrevistas físicas";
                                const urlGCal =
                                    cita.urlGoogleCalendar ||
                                    construirUrlGoogleCalendar({
                                        tipoCitacion,
                                        fechaHora: cita.fechaEntrevista || cita.entrevista,
                                        candidatoNombre: cita.candidatoNombre || cita.nombre,
                                        candidatoEmail: cita.candidatoEmail || cita.email,
                                        puestoTitulo: cita.puestoTitulo || cita.cargo,
                                        planta: cita.puestoPlanta || cita.planta,
                                        evaluador: cita.evaluadorAsignado || cita.encargado,
                                        enlaceMeet: cita.enlaceGoogleMeet,
                                        observaciones: cita.observaciones,
                                    });

                                return (
                                    <article
                                        key={cita.id}
                                        style={{
                                            padding: "14px 16px",
                                            borderRadius: "8px",
                                            backgroundColor: "#f0fdf4",
                                            border: "1px solid #bbf7d0",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "6px",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            <h4 style={{ margin: 0, fontSize: "1rem", color: "#166534" }}>
                                                {cita.puestoTitulo || cita.cargo || "Citación Laboral"}
                                            </h4>
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    fontWeight: "bold",
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    backgroundColor: "#dcfce7",
                                                    color: "#166534",
                                                    border: "1px solid #86efac",
                                                }}
                                            >
                                                {tipoCitacion}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: "13px", color: "#374151" }}>
                                            <strong>Planta:</strong> {cita.puestoPlanta || cita.planta || "AquaChile"}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Icono nombre="clock" size={14} />
                                            Fecha y Hora: {formatearFechaHora(cita.fechaEntrevista || cita.entrevista)}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#4b5563" }}>
                                            <strong>Funcionario / Evaluador:</strong> {cita.evaluadorAsignado || cita.encargado || "Equipo de Selección"}
                                        </div>

                                        {cita.enlaceGoogleMeet && (
                                            <div style={{ fontSize: "12px" }}>
                                                <a
                                                    href={cita.enlaceGoogleMeet}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#1d4ed8", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                >
                                                    <Icono nombre="externalLink" size={12} />
                                                    Unirse a videollamada en Google Meet
                                                </a>
                                            </div>
                                        )}

                                        {cita.observaciones && (
                                            <div
                                                style={{
                                                    marginTop: "4px",
                                                    padding: "8px 10px",
                                                    backgroundColor: "white",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    color: "#4b5563",
                                                    border: "1px solid #e5e7eb",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "6px",
                                                }}
                                            >
                                                <Icono nombre="message" size={13} style={{ marginTop: "2px" }} />
                                                <span><strong>Indicaciones:</strong> {cita.observaciones}</span>
                                            </div>
                                        )}

                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                            <a
                                                href={urlGCal}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "5px 10px",
                                                    fontSize: "11.5px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #bfdbfe",
                                                    backgroundColor: "#eff6ff",
                                                    color: "#1d4ed8",
                                                    fontWeight: "700",
                                                    textDecoration: "none",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "5px",
                                                }}
                                            >
                                                <Icono nombre="calendar" size={12} />
                                                Añadir a mi Google Calendar
                                            </a>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Sección Inferior: Lista de Postulaciones donde participa el postulante */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
            >
                <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icono nombre="clipboard" size={18} color="#0e97b3" />
                        Lista de Postulaciones en las que Participas ({postulaciones.length})
                    </h3>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Revisa el avance de cada una de tus solicitudes laborales enviadas a AquaChile
                    </span>
                </div>

                {postulaciones.length === 0 ? (
                    <div style={{ padding: "40px 10px", textAlign: "center", color: "#888" }}>
                        <p style={{ margin: 0, fontSize: "15px" }}>
                            Aún no te has postulado a ninguna vacante.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {postulaciones.map((postulacion) => {
                            const badge = badgeFase(postulacion.fase);
                            const tieneCita = Boolean(
                                postulacion.fechaEntrevista ||
                                (postulacion.entrevista &&
                                    postulacion.entrevista !== "Pendiente de confirmación" &&
                                    postulacion.entrevista !== "Por agendar" &&
                                    postulacion.entrevista !== "Pendiente de agendar")
                            );

                            return (
                                <article
                                    key={postulacion.id}
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                        border: "1px solid #e5e7eb",
                                        borderTop: `4px solid ${badge.border}`,
                                        padding: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    {/* Cabecera de la tarjeta */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#111827" }}>
                                                {postulacion.puestoTitulo || postulacion.cargo || "Cargo sin especificar"}
                                            </h4>
                                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                                {postulacion.planta || postulacion.comuna || "Puerto Montt"}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                padding: "3px 8px",
                                                borderRadius: "12px",
                                                backgroundColor: badge.bg,
                                                color: badge.color,
                                                border: `1px solid ${badge.border}`,
                                                whiteSpace: "nowrap",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <Icono nombre={badge.icono} size={11} />
                                            {badge.texto}
                                        </span>
                                    </div>

                                    {/* Detalles */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#4b5563" }}>
                                        <div>
                                            <strong>Fecha de Postulación:</strong>{" "}
                                            {postulacion.fechaPostulacion
                                                ? new Date(postulacion.fechaPostulacion).toLocaleDateString("es-CL")
                                                : "Reciente"}
                                        </div>
                                        <div>
                                            <strong>Evaluador Asignado:</strong>{" "}
                                            {postulacion.evaluadorAsignado || postulacion.encargado || "Sin asignar"}
                                        </div>
                                    </div>

                                    {/* Estado de entrevista */}
                                    {tieneCita ? (
                                        <div
                                            style={{
                                                marginTop: "4px",
                                                padding: "8px 10px",
                                                backgroundColor: "#f0fdf4",
                                                borderRadius: "6px",
                                                border: "1px solid #bbf7d0",
                                                fontSize: "12px",
                                                color: "#166534",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <Icono nombre="calendar" size={13} />
                                                <strong>Entrevista Agendada:</strong>
                                            </div>
                                            <div style={{ fontWeight: "bold", marginTop: "2px" }}>
                                                {formatearFechaHora(postulacion.fechaEntrevista || postulacion.entrevista)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                marginTop: "4px",
                                                padding: "8px 10px",
                                                backgroundColor: "#fefce8",
                                                borderRadius: "6px",
                                                border: "1px solid #fef08a",
                                                fontSize: "12px",
                                                color: "#854d0e",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <Icono nombre="clock" size={13} />
                                            <span>Pendiente de citación a entrevista por el evaluador.</span>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MisPostulacionesView;
