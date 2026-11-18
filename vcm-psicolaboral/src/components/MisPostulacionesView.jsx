import { useState, useMemo } from "react";
import CalendarioEntrevistas from "./CalendarioEntrevistas.jsx";
import { ESTILO_ETIQUETA, ESTILO_VALOR, NARANJA, NARANJA_OSCURO } from "./Estilos.jsx";

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
            return { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe", texto: "🗓️ En Entrevista" };
        }
        if (f === "aceptado") {
            return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", texto: "✓ Aceptado" };
        }
        if (f === "rechazado") {
            return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", texto: "✕ No seleccionado" };
        }
        return { bg: "#fef3c7", color: "#92400e", border: "#fde68a", texto: "⏳ En Revisión" };
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
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1a1a1a" }}>
                        📌 Mis Postulaciones Activas y Calendario de Entrevistas
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
                    gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)",
                    gap: "20px",
                    alignItems: "start",
                }}
            >
                {/* Calendario con las entrevistas agendadas */}
                <CalendarioEntrevistas
                    entrevistas={entrevistasAgendadas}
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
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>
                            {diaSeleccionado ? `📅 Entrevistas del día: ${diaSeleccionado}` : "📅 Mis Citas de Entrevista"}
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
                                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🗓️</div>
                                <p style={{ margin: 0, fontSize: "14px" }}>
                                    {diaSeleccionado
                                        ? "No tienes entrevistas agendadas para esta fecha."
                                        : "Aún no tienes entrevistas agendadas por los evaluadores."}
                                </p>
                            </div>
                        ) : (
                            (diaSeleccionado ? entrevistasDelDia : entrevistasAgendadas).map((cita) => (
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
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#166534" }}>
                                            {cita.puestoTitulo || cita.cargo || "Entrevista Laboral"}
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
                                            Agendada
                                        </span>
                                    </div>

                                    <div style={{ fontSize: "13px", color: "#374151" }}>
                                        <strong>Planta:</strong> {cita.puestoPlanta || cita.planta || "AquaChile"}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>
                                        ⏰ Fecha y Hora: {formatearFechaHora(cita.fechaEntrevista || cita.entrevista)}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#4b5563" }}>
                                        <strong>Evaluador Asignado:</strong> {cita.evaluadorAsignado || cita.encargado || "Equipo de Selección"}
                                    </div>

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
                                            }}
                                        >
                                            💬 <strong>Indicaciones:</strong> {cita.observaciones}
                                        </div>
                                    )}
                                </article>
                            ))
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
                    <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#333" }}>
                        📋 Lista de Postulaciones en las que Participas ({postulaciones.length})
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
                                            }}
                                        >
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
                                            <div><strong>🗓️ Entrevista Agendada:</strong></div>
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
                                            }}
                                        >
                                            ⏳ Pendiente de citación a entrevista por el evaluador.
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
