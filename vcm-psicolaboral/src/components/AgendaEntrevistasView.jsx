import { useState, useMemo } from "react";
import CalendarioEntrevistas from "./CalendarioEntrevistas.jsx";
import ModalAgendarEntrevista from "./ModalAgendarEntrevista.jsx";
import BotonOrange from "./BotonOrange.jsx";
import { ESTILO_ETIQUETA, ESTILO_VALOR, NARANJA, NARANJA_OSCURO } from "./Estilos.jsx";

/**
 * Normaliza una fecha de entrevista (ISO o dd/mm/aaaa) a formato YYYY-MM-DD
 */
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

function AgendaEntrevistasView({ postulaciones = [], onAgendarEntrevista }) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "agendados" | "sin_agendar"
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [postulanteAEditar, setPostulanteAEditar] = useState(null);

    // Filtrar entrevistas activas (que tienen fecha asignada)
    const entrevistasConFecha = useMemo(() => {
        return postulaciones.filter((p) =>
            Boolean(p.fechaEntrevista || (p.entrevista && p.entrevista !== "Pendiente de confirmación" && p.entrevista !== "Por agendar"))
        );
    }, [postulaciones]);

    // Entrevistas que caen en el día seleccionado
    const entrevistasDelDia = useMemo(() => {
        if (!diaSeleccionado) return [];
        return entrevistasConFecha.filter((p) => {
            const clave = extraerClaveFecha(p.fechaEntrevista || p.entrevista);
            return clave === diaSeleccionado;
        });
    }, [entrevistasConFecha, diaSeleccionado]);

    // Filtrar postulantes para las tarjetas
    const postulantesFiltrados = useMemo(() => {
        return postulaciones.filter((p) => {
            const nombre = (p.candidatoNombre || p.nombre || "").toLowerCase();
            const rut = (p.candidatoRut || p.rut || "").toLowerCase();
            const cargo = (p.puestoTitulo || p.cargo || "").toLowerCase();
            const planta = (p.puestoPlanta || p.planta || "").toLowerCase();
            const termino = busqueda.toLowerCase().trim();

            const coincideBusqueda =
                !termino ||
                nombre.includes(termino) ||
                rut.includes(termino) ||
                cargo.includes(termino) ||
                planta.includes(termino);

            const tieneFecha = Boolean(
                p.fechaEntrevista ||
                (p.entrevista && p.entrevista !== "Pendiente de confirmación" && p.entrevista !== "Por agendar")
            );

            let coincideEstado = true;
            if (filtroEstado === "agendados") coincideEstado = tieneFecha;
            if (filtroEstado === "sin_agendar") coincideEstado = !tieneFecha;

            return coincideBusqueda && coincideEstado;
        });
    }, [postulaciones, busqueda, filtroEstado]);

    const handleAgendar = async (datos) => {
        if (onAgendarEntrevista) {
            await onAgendarEntrevista(datos);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Encabezado */}
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
                        🗓️ Agenda de Entrevistas de Trabajo
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Calendario interactivo y citación directa a postulantes
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ padding: "6px 14px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6", textAlign: "center" }}>
                        <span style={ESTILO_ETIQUETA}>Total Postulantes</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>{postulaciones.length}</div>
                    </div>
                    <div style={{ padding: "6px 14px", backgroundColor: "#dcfce7", borderRadius: "6px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#166534" }}>Con Cita Agendada</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#166534" }}>{entrevistasConFecha.length}</div>
                    </div>
                    <div style={{ padding: "6px 14px", backgroundColor: "#fff3cd", borderRadius: "6px", border: "1px solid #ffeeba", textAlign: "center" }}>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#856404" }}>Pendientes de Cita</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#856404" }}>
                            {postulaciones.length - entrevistasConFecha.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila Superior: Calendario (izq) + Lista de Postulantes a modo de Tarjetas (der) */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(320px, 1fr) minmax(360px, 1.25fr)",
                    gap: "20px",
                    alignItems: "start",
                }}
            >
                {/* Calendario */}
                <CalendarioEntrevistas
                    entrevistas={entrevistasConFecha}
                    diaSeleccionado={diaSeleccionado}
                    onSeleccionarDia={(clave) => setDiaSeleccionado(clave === diaSeleccionado ? null : clave)}
                />

                {/* Lista de Postulantes (Tarjetas) */}
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        padding: "16px 20px",
                        minHeight: "440px",
                        maxHeight: "560px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    }}
                >
                    {/* Encabezado y buscador compacto */}
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>
                                👥 Lista de Postulantes ({postulantesFiltrados.length})
                            </h3>
                            <span style={{ fontSize: "11px", color: "#888" }}>
                                {filtroEstado === "todos" ? "Todos" : filtroEstado === "sin_agendar" ? "Por citar" : "Agendados"}
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cargo, RUT..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    fontSize: "12px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                    minWidth: "160px",
                                }}
                            />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                style={{
                                    padding: "6px 8px",
                                    fontSize: "12px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                }}
                            >
                                <option value="todos">Todos</option>
                                <option value="sin_agendar">Por citar</option>
                                <option value="agendados">Con cita</option>
                            </select>
                        </div>
                    </div>

                    {/* Tarjetas de postulantes con scroll vertical */}
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                        {postulantesFiltrados.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 10px", color: "#888" }}>
                                🔍 No se encontraron postulantes con el filtro aplicado.
                            </div>
                        ) : (
                            postulantesFiltrados.map((postulante) => {
                                const tieneCita = Boolean(
                                    postulante.fechaEntrevista ||
                                    (postulante.entrevista &&
                                        postulante.entrevista !== "Pendiente de confirmación" &&
                                        postulante.entrevista !== "Por agendar")
                                );

                                return (
                                    <article
                                        key={postulante.id}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            padding: "12px 14px",
                                            backgroundColor: tieneCita ? "#fdfefe" : "#fff",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#111827" }}>
                                                    {postulante.candidatoNombre || postulante.nombre}
                                                </h4>
                                                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                                    {postulante.puestoTitulo || postulante.cargo} · {postulante.puestoPlanta || postulante.planta}
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    borderRadius: "10px",
                                                    padding: "2px 7px",
                                                    backgroundColor: tieneCita ? "#dcfce7" : "#fef3c7",
                                                    color: tieneCita ? "#166534" : "#92400e",
                                                    border: tieneCita ? "1px solid #bbf7d0" : "1px solid #fde68a",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {tieneCita ? "Agendada" : "Por Citar"}
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", fontSize: "11px", color: "#4b5563" }}>
                                            <span>RUT: {postulante.candidatoRut || postulante.rut || "Sin RUT"}</span>
                                            {tieneCita && (
                                                <span style={{ color: "#166534", fontWeight: "600" }}>
                                                    ⏰ {formatearFechaHora(postulante.fechaEntrevista || postulante.entrevista)}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
                                            <BotonOrange
                                                texto={tieneCita ? "Reagendar" : "Citar a Entrevista"}
                                                onClick={() => setPostulanteAEditar(postulante)}
                                            />
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Sección Inferior: Entrevistas Programadas (Ancho completo) */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
            >
                {/* Cabecera de Entrevistas Programadas */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "12px",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#333" }}>
                            {diaSeleccionado ? `📌 Citas del día: ${diaSeleccionado}` : "📌 Entrevistas Programadas"}
                        </h3>
                        <span style={{ fontSize: "13px", color: "gray" }}>
                            {diaSeleccionado
                                ? `Mostrando ${entrevistasDelDia.length} entrevista(s) programada(s) para la fecha seleccionada`
                                : `Mostrando todas las entrevistas confirmadas (${entrevistasConFecha.length}). Haz clic en un día del calendario para filtrar.`}
                        </span>
                    </div>

                    {diaSeleccionado && (
                        <button
                            type="button"
                            onClick={() => setDiaSeleccionado(null)}
                            style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                borderRadius: "5px",
                                border: "1px solid #ced4da",
                                background: "#f8f9fa",
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#495057",
                            }}
                        >
                            Ver todas las fechas
                        </button>
                    )}
                </div>

                {/* Grilla / lista de citas programadas */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "14px",
                    }}
                >
                    {(diaSeleccionado ? entrevistasDelDia : entrevistasConFecha).length === 0 ? (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 10px", color: "#888" }}>
                            <p style={{ margin: 0, fontSize: "14px" }}>
                                {diaSeleccionado
                                    ? "No hay entrevistas agendadas para esta fecha en el calendario."
                                    : "No hay entrevistas programadas en el sistema aún."}
                            </p>
                        </div>
                    ) : (
                        (diaSeleccionado ? entrevistasDelDia : entrevistasConFecha).map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    padding: "16px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "15px", color: "#111827" }}>
                                            {item.candidatoNombre || item.nombre}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                color: "#166534",
                                                backgroundColor: "#dcfce7",
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                border: "1px solid #bbf7d0",
                                            }}
                                        >
                                            Confirmada
                                        </span>
                                    </div>

                                    <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
                                        {item.puestoTitulo || item.cargo} · {item.puestoPlanta || item.planta}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600", marginTop: "6px" }}>
                                        ⏰ {formatearFechaHora(item.fechaEntrevista || item.entrevista)}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                        Evaluador: {item.evaluadorAsignado || item.encargado || "Sin asignar"}
                                    </div>
                                    {item.observaciones && (
                                        <div style={{ fontSize: "12px", color: "#374151", marginTop: "6px", backgroundColor: "#fff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #e5e7eb" }}>
                                            📝 {item.observaciones}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
                                    <button
                                        type="button"
                                        onClick={() => setPostulanteAEditar(item)}
                                        style={{
                                            padding: "6px 14px",
                                            fontSize: "12px",
                                            borderRadius: "5px",
                                            border: "1px solid #ced4da",
                                            background: "white",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: NARANJA_OSCURO,
                                        }}
                                    >
                                        Reagendar Cita
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal para Citar / Reagendar */}
            <ModalAgendarEntrevista
                isOpen={Boolean(postulanteAEditar)}
                postulante={postulanteAEditar}
                onCerrar={() => setPostulanteAEditar(null)}
                onAgendar={handleAgendar}
            />
        </div>
    );
}

export default AgendaEntrevistasView;
